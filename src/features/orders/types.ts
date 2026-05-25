export enum LaundryStatus {
  MENUNGGU_PEMBAYARAN = 'MENUNGGU_PEMBAYARAN',
  PROSES = 'PROSES',
  SIAP_DIAMBIL = 'SIAP_DIAMBIL'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  DP = 'DP',
  PAID = 'PAID'
}

export enum PaymentType {
  CASH = 'cash',
  TRANSFER = 'transfer',
  MIDTRANS = 'midtrans'
}

export enum PaymentCategory {
  DP = 'dp',
  PELUNASAN = 'pelunasan',
  FULL = 'full'
}

export interface Order {
  id: string;
  invoice_no: string;
  customer_id: string;
  user_id: string; // Kasir
  customer_token: string;

  laundry_status: LaundryStatus | string;
  payment_status: PaymentStatus | string;

  discount_id: string | null;
  tax_id: string | null;
  service_fee_id: string | null;

  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  service_fee_amount: number;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  change_amount: number;

  estimated_finish: string | null;
  picked_up_at: string | null;
  whatsapp_sent: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  service_id: string;
  qty: number;
  price_per_unit: number;
  notes: string | null;
}

export interface OrderPayment {
  id: string;
  order_id: string;
  payment_type: PaymentType | string;
  amount: number;
  payment_category: PaymentCategory | string;

  midtrans_snap_token: string | null;
  midtrans_payment_url: string | null;
  midtrans_status: string | null;
  created_at: string;
}
