import { create } from 'zustand';
import { UserItem } from '@/types/user';

interface UserStore {
  isRoleModalOpen: boolean;
  selectedUser: UserItem | null;
  isDeleteAlertOpen: boolean;
  userToDelete: UserItem | null;
  openRoleModal: (user: UserItem) => void;
  closeRoleModal: () => void;
  openDeleteAlert: (user: UserItem) => void;
  closeDeleteAlert: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  isRoleModalOpen: false,
  selectedUser: null,
  isDeleteAlertOpen: false,
  userToDelete: null,
  openRoleModal: (user) => set({ isRoleModalOpen: true, selectedUser: user }),
  closeRoleModal: () => set({ isRoleModalOpen: false, selectedUser: null }),
  openDeleteAlert: (user) => set({ isDeleteAlertOpen: true, userToDelete: user }),
  closeDeleteAlert: () => set({ isDeleteAlertOpen: false, userToDelete: null }),
}));
