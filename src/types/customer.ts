export interface Customer {
  id: string;
  name: string;
  whatsapp_no: string;
  address: string | null;
  created_at: string;
}

export type CreateCustomerInput = Omit<Customer, "id" | "created_at">;

export type UpdateCustomerInput = Partial<CreateCustomerInput>;
