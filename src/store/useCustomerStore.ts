import { create } from 'zustand';
import { Customer } from '@/types/customer';

interface CustomerStore {
  isModalOpen: boolean;
  selectedCustomer: Customer | null;
  isDeleteAlertOpen: boolean;
  customerToDelete: Customer | null;
  openModal: (customer?: Customer) => void;
  closeModal: () => void;
  openDeleteAlert: (customer: Customer) => void;
  closeDeleteAlert: () => void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  isModalOpen: false,
  selectedCustomer: null,
  isDeleteAlertOpen: false,
  customerToDelete: null,
  openModal: (customer) => set({ isModalOpen: true, selectedCustomer: customer || null }),
  closeModal: () => set({ isModalOpen: false, selectedCustomer: null }),
  openDeleteAlert: (customer) => set({ isDeleteAlertOpen: true, customerToDelete: customer }),
  closeDeleteAlert: () => set({ isDeleteAlertOpen: false, customerToDelete: null }),
}));
