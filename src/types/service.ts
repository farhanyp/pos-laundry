export interface Service {
  id: string
  name: string
  category: string
  price: number
  estimation_hours: number
  unit: string
  is_active: boolean
}

export type CreateServiceInput = Omit<Service, "id">

export type UpdateServiceInput = Partial<CreateServiceInput>
