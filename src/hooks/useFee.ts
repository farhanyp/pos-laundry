import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFees, createFee, updateFee, deleteFee } from '@/service/fees';
import { toast } from 'sonner';

export const useFees = () => {
  return useQuery({
    queryKey: ['fees'],
    queryFn: getFees,
  });
};

export const useCreateFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast.success('Fee created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create fee');
    },
  });
};

export const useUpdateFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast.success('Fee updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update fee');
    },
  });
};

export const useDeleteFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast.success('Fee deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete fee');
    },
  });
};
