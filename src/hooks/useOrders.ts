import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, createOrderTransaction, updateOrderStatus, processOrderPayment, deleteOrder } from '@/service/orders';
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

type PaymentPayload = {
  orderId: string;
  paymentMethod: 'CASH' | 'NON_TUNAI';
  expectedAmount: number;
  cashGiven: number;
  totalAmount: number;
  paymentMode?: 'FULL' | 'DP' | 'SETTLE';
};

export function useProcessOrderPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaymentPayload) => processOrderPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Payment processed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process payment');
    },
  });
}

export function useCreateDPMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaymentPayload) => processOrderPayment({ ...payload, paymentMode: 'DP' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Down Payment processed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process Down Payment');
    },
  });
}

export function useSettlePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaymentPayload) => processOrderPayment({ ...payload, paymentMode: 'SETTLE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Payment settled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to settle payment');
    },
  });
}

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Pesanan berhasil dihapus');
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menghapus pesanan');
    },
  });
};
