"use client";

import { useServiceStore } from "@/store/useServiceStore";
import { useDeleteService } from "@/hooks/useService";

export function ServiceDeleteAlert() {
  const { isDeleteAlertOpen, closeDeleteAlert, selectedService } = useServiceStore();
  const deleteMutation = useDeleteService();

  if (!isDeleteAlertOpen || !selectedService) return null;

  const handleDelete = () => {
    deleteMutation.mutate(selectedService.id, {
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
            <span className="material-symbols-outlined text-[32px]" data-icon="warning">warning</span>
          </div>
          <h2 className="font-display text-[22px] font-bold text-on-surface leading-tight">Delete Service?</h2>
          <p className="text-[14px] text-on-surface-variant leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-primary">{selectedService.name}</span>? This action is permanent and cannot be undone.
          </p>
        </div>
        
        <div className="p-6 pt-0 flex justify-center gap-3">
          <button
            onClick={closeDeleteAlert}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-xl text-[14px] font-bold border border-outline-variant/30 text-on-surface hover:bg-surface-variant/20 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-bold bg-error text-on-error hover:bg-error/90 transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-error/20"
          >
            {isPending && <span className="material-symbols-outlined text-[18px] animate-spin" data-icon="progress_activity">progress_activity</span>}
            {isPending ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
