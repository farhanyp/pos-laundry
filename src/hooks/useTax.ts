import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTaxes, createTax, updateTax, deleteTax } from '@/service/taxes';
import { toast } from 'sonner';

export const useTaxes = () => {
  return useQuery({
    queryKey: ['taxes'],
    queryFn: getTaxes,
  });
};

export const useCreateTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast.success('Tax created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create tax');
    },
  });
};

export const useUpdateTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast.success('Tax updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update tax');
    },
  });
};

export const useDeleteTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast.success('Tax deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete tax');
    },
  });
};
