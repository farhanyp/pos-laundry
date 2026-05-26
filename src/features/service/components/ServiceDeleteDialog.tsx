"use client";

import { useServiceStore } from '@/store/useServiceStore';
import { useDeleteService } from '@/hooks/useService';

export const ServiceDeleteDialog = () => {
  const { isDeleteAlertOpen, closeDeleteAlert, selectedService } = useServiceStore();
  const deleteMutation = useDeleteService();

  if (!isDeleteAlertOpen || !selectedService) return null;

  const handleDelete = () => {
    deleteMutation.mutate(selectedService.id, {
      onSuccess: () => closeDeleteAlert()
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={closeDeleteAlert}
    >
      <div 
        className="bg-surface-container-low border border-outline-variant/15 p-6 rounded-lg w-full max-w-sm shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          
          <div>
            <h2 className="font-display text-headline-sm text-on-surface mb-2">Delete Service?</h2>
            <p className="text-body-md text-on-surface-variant">
              Are you sure you want to delete <span className="font-bold text-on-surface">{selectedService.name}</span>? This action cannot be undone.
            </p>
          </div>

          <div className="flex w-full gap-3 mt-6">
            <button 
              onClick={closeDeleteAlert}
              className="flex-1 px-4 py-2 text-body-md text-on-surface-variant hover:bg-surface-container-highest rounded transition-colors border border-outline-variant/10"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-2 bg-error text-onError font-label-md rounded hover:opacity-90 transition-opacity disabled:opacity-50 text-white flex justify-center items-center"
            >
              {deleteMutation.isPending ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
