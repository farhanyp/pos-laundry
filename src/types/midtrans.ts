export interface MidtransPaymentLinkRequest {
  transaction_details: TransactionDetails;
  customer_required?: boolean;
  credit_card?: CreditCard;
  usage_limit?: number;
  expiry?: Expiry;
  enabled_payments?: ('qris' | 'other_qris' | 'credit_card' | 'bca_va' | 'mandiri_va' | 'bni_va' | 'bri_va' | 'gopay' | 'shopeepay' | string)[];
  item_details?: ItemDetail[];
  customer_details?: CustomerDetails;
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
}

export interface TransactionDetails {
  order_id: string;
  gross_amount: number;
  payment_link_id?: string;
}

export interface CreditCard {
  secure?: boolean;
  bank?: string;
  installment?: Installment;
}

export interface Installment {
  required?: boolean;
  terms?: Record<string, number[]>;
}

export interface Expiry {
  start_time?: string; // Format: "YYYY-MM-DD HH:mm:ss Z", e.g., "2022-04-01 18:00 +0700"
  duration?: number;
  unit?: 'days' | 'hours' | 'minutes' | string;
}

export interface ItemDetail {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  brand?: string;
  category?: string;
  merchant_name?: string;
}

export interface CustomerDetails {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface MidtransNotificationResponse {
  transaction_type?: string;
  transaction_time?: string;
  transaction_status: 'capture' | 'settlement' | 'pending' | 'deny' | 'cancel' | 'expire' | 'failure' | string;
  transaction_id?: string;
  status_message?: string;
  status_code: string;
  signature_key: string;
  settlement_time?: string;
  payment_type?: string; // e.g. 'qris', 'credit_card', 'bank_transfer'
  order_id: string;
  merchant_id?: string;
  merchant_cross_reference_id?: string;
  issuer?: string;
  gross_amount: string;
  fraud_status?: 'accept' | 'challenge' | 'deny' | string;
  currency?: string;
  acquirer?: string;
  // Field tambahan yang mungkin muncul dari tipe pembayaran lain
  payment_amounts?: Array<{
    paid_at?: string;
    amount?: string;
  }>;
  store?: string;
}
