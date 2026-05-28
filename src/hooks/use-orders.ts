import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, createOrderTransaction, updateOrderStatus, processOrderPayment } from '@/service/orders';
import { toast } from 'sonner';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });
};

export const useCreateOrderTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrderTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });
};

export function useProcessOrderPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { orderId: string, paymentMethod: 'CASH' | 'NON_TUNAI', amountPaid: number, totalAmount: number }) =>
      processOrderPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Payment processed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process payment');
    },
  });
}
