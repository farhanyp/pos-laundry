"use client";

import { useTaxStore } from "@/store/useTaxStore";
import { useDeleteTax } from "@/hooks/useTax";

export function TaxDeleteAlert() {
  const { isDeleteAlertOpen, closeDeleteAlert, selectedTax } = useTaxStore();
  const deleteTaxMutation = useDeleteTax();

  const handleDelete = () => {
    if (!selectedTax) return;
    
    deleteTaxMutation.mutate(selectedTax.id, {
      onSuccess: () => closeDeleteAlert(),
    });
  };

  if (!isDeleteAlertOpen || !selectedTax) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-scrim/40 backdrop-blur-sm transition-opacity" 
        onClick={closeDeleteAlert}
      />
      
      <div className="relative bg-surface-container-low rounded-2xl shadow-elevation-3 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-error-container/20 text-error rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-[32px]" data-icon="warning">warning</span>
          </div>
          
          <div>
            <h2 className="text-title-lg font-display font-bold text-on-surface mb-1">Delete Tax?</h2>
            <p className="text-body-md text-on-surface-variant">
              Are you sure you want to delete <span className="font-bold text-on-surface">{selectedTax.tax_name}</span>? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="p-4 bg-surface-container flex gap-3">
          <button
            onClick={closeDeleteAlert}
            className="flex-1 px-4 py-2.5 text-label-md font-bold text-on-surface-variant bg-surface hover:bg-surface-container-highest border border-outline-variant/30 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteTaxMutation.isPending}
            className="flex-1 px-4 py-2.5 text-label-md font-bold bg-error text-on-error hover:bg-error/90 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {deleteTaxMutation.isPending ? (
              <span className="material-symbols-outlined text-[18px] animate-spin" data-icon="progress_activity">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]" data-icon="delete">delete</span>
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
