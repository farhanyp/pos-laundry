"use client";

import { useTaxStore } from "@/store/useTaxStore";
import { useDeleteTax } from "@/hooks/useTax";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

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
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-title-lg font-display font-bold text-on-surface mb-1">Hapus Pajak?</h2>
            <p className="text-body-md text-on-surface-variant">
              Apakah Anda yakin ingin menghapus <span className="font-bold text-on-surface">{selectedTax.tax_name}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        <div className="p-4 bg-surface-container flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={closeDeleteAlert}
            className="w-full sm:flex-1 px-4 py-2.5 text-label-md font-bold text-on-surface-variant bg-surface hover:bg-surface-container-highest border border-outline-variant/30 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteTaxMutation.isPending}
            className="w-full sm:flex-1 px-4 py-2.5 text-label-md font-bold bg-error text-on-error hover:bg-error/90 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {deleteTaxMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
