"use client";

import { useCustomerStore } from "@/store/useCustomerStore";
import { useDeleteCustomer } from "@/hooks/useCustomer";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="bg-surface-container-low border border-outline-variant/15 shadow-xl rounded-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-error-container/20 text-error rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-[32px]" data-icon="warning">warning</span>
          </div>
          <h2 className="font-display text-title-lg font-bold text-on-surface">Delete Customer?</h2>
          <p className="text-body-md text-on-surface-variant">
            Are you sure you want to delete <span className="font-bold text-primary">{customerToDelete.name}</span>? This action cannot be undone.
          </p>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={closeDeleteAlert}
            disabled={isPending}
            className="flex-1 px-4 py-2 rounded-lg text-label-md font-medium text-on-surface-variant bg-surface-container-highest hover:bg-surface-variant transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-label-md font-medium bg-error text-on-error hover:bg-error/90 transition-colors disabled:opacity-50 active:scale-95 duration-150"
          >
            {isPending ? (
              <span className="material-symbols-outlined text-[16px] animate-spin" data-icon="progress_activity">
                progress_activity
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
