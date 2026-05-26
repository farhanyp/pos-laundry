import { create } from 'zustand';
import { Service } from '@/types/service';

interface ServiceStore {
  isModalOpen: boolean;
  isDeleteAlertOpen: boolean;
  selectedService: Service | null;
  openModal: (service?: Service) => void;
  closeModal: () => void;
  openDeleteAlert: (service: Service) => void;
  closeDeleteAlert: () => void;
}

export const useServiceStore = create<ServiceStore>((set) => ({
  isModalOpen: false,
  isDeleteAlertOpen: false,
  selectedService: null,
  openModal: (service) => set({ isModalOpen: true, selectedService: service || null }),
  closeModal: () => set({ isModalOpen: false, selectedService: null }),
  openDeleteAlert: (service) => set({ isDeleteAlertOpen: true, selectedService: service }),
  closeDeleteAlert: () => set({ isDeleteAlertOpen: false, selectedService: null }),
}));
