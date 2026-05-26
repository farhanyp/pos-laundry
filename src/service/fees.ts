import { createClient } from '@/lib/supabase/client';
import { Fee, CreateFeeInput, UpdateFeeInput } from '@/types/fee';

export const getFees = async (): Promise<Fee[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('service_fees')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }
  return data as Fee[];
};

export const createFee = async (payload: CreateFeeInput): Promise<Fee> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('service_fees')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Fee;
};

export const updateFee = async ({ id, payload }: { id: string; payload: UpdateFeeInput }): Promise<Fee> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('service_fees')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Fee;
};

export const deleteFee = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('service_fees')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};
