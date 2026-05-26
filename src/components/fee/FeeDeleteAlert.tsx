"use client";

import { useFeeStore } from "@/store/useFeeStore";
import { useDeleteFee } from "@/hooks/useFee";

export function FeeDeleteAlert() {
  const { isAlertOpen, closeAlert, selectedFee } = useFeeStore();
  const deleteMutation = useDeleteFee();

  if (!isAlertOpen || !selectedFee) return null;

  const handleDelete = () => {
    deleteMutation.mutate(selectedFee.id, {
      onSuccess: () => {
        closeAlert();
      },
    });
  };

  const isPending = deleteMutation.isPending;

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300"
      onClick={closeAlert}
    >
      <div 
        className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-200 border border-outline-variant/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4 text-error mx-auto">
            <span className="material-symbols-outlined text-2xl" data-icon="warning">warning</span>
          </div>
          <h2 className="text-xl font-display font-bold text-on-surface text-center mb-2">Delete Fee</h2>
          <p className="text-on-surface-variant text-body-md text-center">
            Are you sure you want to delete <span className="font-bold text-on-surface">{selectedFee.fee_name}</span>? This action cannot be undone.
          </p>
        </div>
        
        <div className="p-4 bg-surface-container-low flex gap-3 justify-end border-t border-outline-variant/10">
          <button
            onClick={closeAlert}
            disabled={isPending}
            className="px-4 py-2 font-label-md rounded-lg text-on-surface-variant hover:bg-surface-variant/20 transition-colors disabled:opacity-50 flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-4 py-2 font-label-md rounded-lg bg-error text-on-error hover:bg-error/90 transition-colors disabled:opacity-50 active:scale-95 flex-1"
          >
            {isPending && (
              <span className="material-symbols-outlined text-[18px] animate-spin" data-icon="progress_activity">
                progress_activity
              </span>
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
