export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount'
}

export interface Discount {
  id: string;
  promo_name: string;
  discount_type: DiscountType | string;
  value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  is_active: boolean;
  start_date: string; // timestamp
  end_date: string; // timestamp
}

export interface Tax {
  id: string;
  tax_name: string;
  rate_percentage: number;
  is_active: boolean;
  created_at: string;
}

export interface ServiceFee {
  id: string;
  fee_name: string;
  fee_type: string;
  value: number;
  is_active: boolean;
  created_at: string;
}
