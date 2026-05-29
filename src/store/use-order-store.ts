import { create } from 'zustand';
import { Customer } from '@/types/customer';
import { Service } from '@/types/service';
import { Discount } from '@/types/discount';
import { Tax } from '@/types/tax';
import { Fee } from '@/types/fee';
import { OrderWithDetails } from '@/types/order';

export type PaymentMethod = 'CASH' | 'NON_TUNAI';

export interface OrderItemSelection {
  service: Service;
  qty: number;
}

interface OrderStore {
  // Wizard State
  step: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Dialog State
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;

  // Customer Data
  selectedCustomer: Customer | null;
  newCustomerData: { name: string; whatsapp_no: string; address: string } | null;
  setCustomer: (customer: Customer | null) => void;
  setNewCustomerData: (data: { name: string; whatsapp_no: string; address: string } | null) => void;

  // Items Data
  items: OrderItemSelection[];
  addItem: (service: Service) => void;
  removeItem: (serviceId: string) => void;
  updateItemQty: (serviceId: string, qty: number) => void;

  // Financial Options
  selectedDiscount: Discount | null;
  selectedTax: Tax | null;
  selectedFee: Fee | null;
  setDiscount: (discount: Discount | null) => void;
  setTax: (tax: Tax | null) => void;
  setFee: (fee: Fee | null) => void;

  // Payment Data
  paymentMethod: PaymentMethod;
  amountPaid: number;
  setPaymentMethod: (method: PaymentMethod) => void;
  setAmountPaid: (amount: number) => void;

  // Mock Midtrans Data
  midtransUrl: string | null;
  midtransToken: string | null;
  setMidtransUrl: (url: string | null) => void;
  setMidtransToken: (token: string | null) => void;

  // Computed Properties (can be derived in UI, but good to have getters if needed, or compute on fly)
  resetOrder: () => void;

  // Payment Dialog State
  isPaymentOpen: boolean;
  activeOrder: OrderWithDetails | null;
  paymentMode: 'FULL' | 'DP';
  setPaymentMode: (mode: 'FULL' | 'DP') => void;
  openPaymentDialog: (order: OrderWithDetails) => void;
  closePaymentDialog: () => void;
}

const initialOrderState = {
  step: 1,
  isOpen: false,
  selectedCustomer: null,
  newCustomerData: null,
  items: [],
  selectedDiscount: null,
  selectedTax: null,
  selectedFee: null,
  paymentMethod: 'CASH' as PaymentMethod,
  amountPaid: 0,
  midtransUrl: null,
  midtransToken: null,
};

export const useOrderStore = create<OrderStore>((set) => ({
  ...initialOrderState,

  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 4) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),

  setIsOpen: (isOpen) => set({ isOpen, ...(isOpen ? {} : initialOrderState) }), // Reset on close

  setCustomer: (selectedCustomer) => set({ selectedCustomer, newCustomerData: null }),
  setNewCustomerData: (newCustomerData) => set({ newCustomerData, selectedCustomer: null }),

  addItem: (service) => set((state) => {
    const existing = state.items.find(i => i.service.id === service.id);
    if (existing) {
      return {
        items: state.items.map(i => i.service.id === service.id ? { ...i, qty: i.qty + 1 } : i)
      };
    }
    return { items: [...state.items, { service, qty: 1 }] };
  }),
  removeItem: (serviceId) => set((state) => ({
    items: state.items.filter(i => i.service.id !== serviceId)
  })),
  updateItemQty: (serviceId, qty) => set((state) => ({
    items: state.items.map(i => i.service.id === serviceId ? { ...i, qty } : i)
  })),

  setDiscount: (selectedDiscount) => set({ selectedDiscount }),
  setTax: (selectedTax) => set({ selectedTax }),
  setFee: (selectedFee) => set({ selectedFee }),

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setAmountPaid: (amountPaid) => set({ amountPaid }),

  setMidtransUrl: (midtransUrl) => set({ midtransUrl }),
  setMidtransToken: (midtransToken) => set({ midtransToken }),

  resetOrder: () => set(initialOrderState),

  // Payment Dialog State
  isPaymentOpen: false,
  activeOrder: null,
  paymentMode: 'FULL',
  setPaymentMode: (mode) => set({ paymentMode: mode }),
  openPaymentDialog: (order: OrderWithDetails) => set({
    isPaymentOpen: true,
    activeOrder: order,
    paymentMode: 'FULL',
    paymentMethod: 'CASH',
    amountPaid: 0,
    midtransUrl: null,
    midtransToken: null
  }),
  closePaymentDialog: () => set({ 
    isPaymentOpen: false, 
    activeOrder: null, 
    midtransUrl: null, 
    midtransToken: null 
  })
}));
