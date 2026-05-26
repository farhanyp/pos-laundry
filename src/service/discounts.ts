import { createClient } from '@/lib/supabase/client';
import { Discount, CreateDiscountInput, UpdateDiscountInput } from '@/types/discount';

export const getDiscounts = async (): Promise<Discount[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('discounts')
    .select('*')
    .order('promo_name');
  
  if (error) {
    throw new Error(error.message);
  }
  return data as Discount[];
};

export const createDiscount = async (payload: CreateDiscountInput): Promise<Discount> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('discounts')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Discount;
};

export const updateDiscount = async ({ id, payload }: { id: string; payload: UpdateDiscountInput }): Promise<Discount> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('discounts')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Discount;
};

export const deleteDiscount = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('discounts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};
