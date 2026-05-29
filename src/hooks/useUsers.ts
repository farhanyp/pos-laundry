import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserRole, deleteUser } from '@/service/users';
import { toast } from 'sonner';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role berhasil diperbarui');
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal memperbarui role');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Pengguna berhasil dihapus');
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menghapus pengguna');
    },
  });
};
