export interface Fee {
  id: string;
  fee_name: string;
  fee_type: 'percentage' | 'fixed';
  value: number;
  is_active: boolean;
  created_at: string;
}

export type CreateFeeInput = Omit<Fee, "id" | "created_at">;

export type UpdateFeeInput = Partial<CreateFeeInput>;
