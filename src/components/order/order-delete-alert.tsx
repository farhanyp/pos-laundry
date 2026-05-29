"use client";

import { useOrderStore } from "@/store/use-order-store";
import { useDeleteOrder } from "@/hooks/useOrders";
import { Loader2, AlertTriangle, X } from "lucide-react";

export function OrderDeleteAlert() {
  const { isDeleteAlertOpen, selectedOrderToDelete, closeDeleteAlert } = useOrderStore();
  const { mutate: deleteOrder, isPending } = useDeleteOrder();

  if (!isDeleteAlertOpen || !selectedOrderToDelete) return null;

  const handleDelete = () => {
    deleteOrder(selectedOrderToDelete.id, {
      onSuccess: () => {
        closeDeleteAlert();
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300 p-4"
      onClick={closeDeleteAlert}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-6 text-error">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h2 className="text-[22px] font-bold text-on-surface mb-2 font-display">
            Hapus Pesanan?
          </h2>
          
          <p className="text-[15px] text-on-surface-variant mb-2">
            Apakah Anda yakin ingin menghapus pesanan 
            <span className="font-bold text-on-surface block mt-1">{selectedOrderToDelete.invoice_no}</span>
          </p>
          
          <div className="w-full bg-error/5 border border-error/10 rounded-xl p-4 mt-4 mb-8">
            <p className="text-[13px] text-error font-medium leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Semua data pembayaran dan item pesanan terkait juga akan terhapus secara permanen.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
            <button
              onClick={closeDeleteAlert}
              disabled={isPending}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-[14px] font-bold text-on-surface-variant hover:bg-surface-variant/20 hover:text-on-surface transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[14px] font-bold bg-error text-on-error hover:bg-error/90 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-error/20"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <X className="w-5 h-5" />
              )}
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
