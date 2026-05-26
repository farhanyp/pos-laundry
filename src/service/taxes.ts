import { createClient } from '@/lib/supabase/client';
import { Tax, CreateTaxInput, UpdateTaxInput } from '@/types/tax';

export const getTaxes = async (): Promise<Tax[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('taxes')
    .select('*')
    .order('tax_name');
  
  if (error) {
    throw new Error(error.message);
  }
  return data as Tax[];
};

export const createTax = async (payload: CreateTaxInput): Promise<Tax> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('taxes')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Tax;
};

export const updateTax = async ({ id, payload }: { id: string; payload: UpdateTaxInput }): Promise<Tax> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('taxes')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Tax;
};

export const deleteTax = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('taxes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};
