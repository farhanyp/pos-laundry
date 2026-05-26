import { create } from 'zustand';
import { Discount } from '@/types/discount';

interface DiscountStore {
  isModalOpen: boolean;
  isDeleteAlertOpen: boolean;
  selectedDiscount: Discount | null;
  openModal: (discount?: Discount) => void;
  closeModal: () => void;
  openDeleteAlert: (discount: Discount) => void;
  closeDeleteAlert: () => void;
}

export const useDiscountStore = create<DiscountStore>((set) => ({
  isModalOpen: false,
  isDeleteAlertOpen: false,
  selectedDiscount: null,
  openModal: (discount) => set({ isModalOpen: true, selectedDiscount: discount || null }),
  closeModal: () => set({ isModalOpen: false, selectedDiscount: null }),
  openDeleteAlert: (discount) => set({ isDeleteAlertOpen: true, selectedDiscount: discount }),
  closeDeleteAlert: () => set({ isDeleteAlertOpen: false, selectedDiscount: null }),
}));
