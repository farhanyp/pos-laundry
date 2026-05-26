import { create } from 'zustand';
import { Tax } from '@/types/tax';

interface TaxStore {
  isModalOpen: boolean;
  isDeleteAlertOpen: boolean;
  selectedTax: Tax | null;
  openModal: (tax?: Tax) => void;
  closeModal: () => void;
  openDeleteAlert: (tax: Tax) => void;
  closeDeleteAlert: () => void;
}

export const useTaxStore = create<TaxStore>((set) => ({
  isModalOpen: false,
  isDeleteAlertOpen: false,
  selectedTax: null,
  openModal: (tax) => set({ isModalOpen: true, selectedTax: tax || null }),
  closeModal: () => set({ isModalOpen: false, selectedTax: null }),
  openDeleteAlert: (tax) => set({ isDeleteAlertOpen: true, selectedTax: tax }),
  closeDeleteAlert: () => set({ isDeleteAlertOpen: false, selectedTax: null }),
}));
