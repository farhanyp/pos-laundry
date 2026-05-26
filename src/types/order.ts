import { Customer } from "./customer";
import { Service } from "./service";
import { LaundryStatus, PaymentStatus } from "./enums";

export interface Order {
  id: string;
  invoice_no: string;
  customer_id: string;
  user_id: string;
  customer_token: string;
  
  laundry_status: LaundryStatus;
  payment_status: PaymentStatus;
  
  discount_id?: string;
  tax_id?: string;
  service_fee_id?: string;

  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  service_fee_amount: number;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  change_amount: number;

  estimated_finish?: string;
  picked_up_at?: string;
  whatsapp_sent: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  service_id: string;
  qty: number;
  price_per_unit: number;
  notes?: string;
  created_at?: string;
}

export interface OrderPayment {
  id: string;
  order_id: string;
  payment_type: 'TUNAI' | 'NON_TUNAI';
  amount: number;
  midtrans_snap_token?: string;
  midtrans_payment_url?: string;
  midtrans_status?: string;
  created_at: string;
}

// Extends the Order to include relations, useful for the frontend display
export interface OrderWithDetails extends Order {
  customers: Customer;
  order_items: (OrderItem & { services: Service })[];
  order_payments: OrderPayment[];
}

export interface OrderPayload {
  user_id: string;
  customer_id: string | null;
  new_customer?: {
    name: string;
    whatsapp_no: string;
    address: string;
  };
  items: {
    service: Service;
    qty: number;
  }[];
  financials: {
    discount_id?: string;
    tax_id?: string;
    fee_id?: string;
    discount_amount: number;
    tax_amount: number;
    service_fee_amount: number;
  };
  payment: {
    method: 'CASH' | 'NON_CASH';
    amount_paid: number;
  };
}
