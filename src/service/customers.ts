import { createClient } from '@/lib/supabase/client';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '@/types/customer';

export const getCustomers = async (): Promise<Customer[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
  
  if (error) {
    throw new Error(error.message);
  }
  return data as Customer[];
};

export const createCustomer = async (payload: CreateCustomerInput): Promise<Customer> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('customers')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Customer;
};

export const updateCustomer = async ({ id, payload }: { id: string; payload: UpdateCustomerInput }): Promise<Customer> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('customers')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Customer;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};
