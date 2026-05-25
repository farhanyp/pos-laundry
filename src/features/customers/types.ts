export interface Customer {
  id: string;
  name: string;
  whatsapp_no: string; // Format: 628xxx
  address: string | null;
  created_at: string;
}
