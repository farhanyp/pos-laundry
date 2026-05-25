export enum ServiceCategory {
  KILOAN = 'kiloan',
  SATUAN = 'satuan',
  KARPET = 'karpet',
  BONEKA = 'boneka',
  TAS = 'tas'
}

export enum ServiceUnit {
  KG = 'kg',
  PCS = 'pcs',
  METER = 'meter',
  PAKET = 'paket'
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory | string;
  price: number; // decimal
  estimation_hours: number;
  unit: ServiceUnit | string;
  is_active: boolean;
}
