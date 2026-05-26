import { create } from 'zustand';
import { Fee } from '@/types/fee';

interface FeeState {
  isModalOpen: boolean;
  isAlertOpen: boolean;
  selectedFee: Fee | null;
  openModal: (fee?: Fee | null) => void;
  closeModal: () => void;
  openAlert: (fee: Fee) => void;
  closeAlert: () => void;
}

export const useFeeStore = create<FeeState>((set) => ({
  isModalOpen: false,
  isAlertOpen: false,
  selectedFee: null,
  openModal: (fee = null) => set({ isModalOpen: true, selectedFee: fee }),
  closeModal: () => set({ isModalOpen: false, selectedFee: null }),
  openAlert: (fee) => set({ isAlertOpen: true, selectedFee: fee }),
  closeAlert: () => set({ isAlertOpen: false, selectedFee: null }),
}));
