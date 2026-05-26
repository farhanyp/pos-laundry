export interface Discount {
  id: string
  promo_name: string
  discount_type: string
  value: number
  min_order_amount: number
  max_discount_amount: number
  is_active: boolean
  start_date: string
  end_date: string
}

export type CreateDiscountInput = Omit<Discount, "id">

export type UpdateDiscountInput = Partial<CreateDiscountInput>
