import { createClient } from '@/lib/supabase/client';
import { Service, CreateServiceInput, UpdateServiceInput } from '@/types/service';

export const getServices = async (): Promise<Service[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) {
    throw new Error(error.message);
  }
  return data as Service[];
};

export const createService = async (payload: CreateServiceInput): Promise<Service> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('services')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Service;
};

export const updateService = async ({ id, payload }: { id: string; payload: UpdateServiceInput }): Promise<Service> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('services')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Service;
};

export const deleteService = async (id: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('services')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};
