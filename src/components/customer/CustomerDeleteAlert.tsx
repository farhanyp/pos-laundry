"use client";

import { useCustomerStore } from "@/store/useCustomerStore";
import { useDeleteCustomer } from "@/hooks/useCustomer";
import { AlertTriangle, Loader2 } from "lucide-react";

export function CustomerDeleteAlert() {
  const { isDeleteAlertOpen, closeDeleteAlert, customerToDelete } = useCustomerStore();
  const deleteMutation = useDeleteCustomer();

  if (!isDeleteAlertOpen || !customerToDelete) return null;

  const handleDelete = () => {
    deleteMutation.mutate(customerToDelete.id, {
      onSuccess: () => {
        closeDeleteAlert();
      },
    });
  };

  const isPending = deleteMutation.isPending;

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={closeDeleteAlert}
    >
      <div 
        className="bg-surface-container-lowest border border-outline-variant/20 shadow-2xl rounded-2xl w-full max-w-[400px] flex flex-col transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-error-container/20 text-error rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-error/10">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="font-display text-[22px] font-bold text-on-surface leading-tight">Hapus Pelanggan?</h2>
          <p className="text-[14px] text-on-surface-variant leading-relaxed">
            Apakah Anda yakin ingin menghapus <span className="font-bold text-primary">{customerToDelete.name}</span>? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
          </p>
        </div>
        
        <div className="p-6 pt-0 flex flex-col-reverse sm:flex-row justify-center gap-3">
          <button
            onClick={closeDeleteAlert}
            disabled={isPending}
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl text-[14px] font-bold border border-outline-variant/30 text-on-surface hover:bg-surface-variant/20 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-bold bg-error text-on-error hover:bg-error/90 transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-error/20"
          >
            {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            {isPending ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
