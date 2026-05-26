export interface Tax {
  id: string;
  tax_name: string;
  rate_percentage: number;
  is_active: boolean;
  created_at?: string;
}

export type CreateTaxInput = Omit<Tax, 'id' | 'created_at'>;
export type UpdateTaxInput = Partial<CreateTaxInput>;
