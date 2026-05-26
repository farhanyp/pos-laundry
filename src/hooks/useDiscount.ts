import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from '@/service/discounts';
import { toast } from 'sonner';

export const useDiscounts = () => {
  return useQuery({
    queryKey: ['discounts'],
    queryFn: getDiscounts,
  });
};

export const useCreateDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create discount');
    },
  });
};

export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update discount');
    },
  });
};

export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete discount');
    },
  });
};
