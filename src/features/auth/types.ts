export enum RoleName {
  OWNER = 'owner',
  KASIR = 'kasir'
}

export interface User {
  id: string; // uuid
  name: string;
  email: string;
  created_at: string; // timestamp
}

export interface Role {
  id: string; // uuid
  role_name: RoleName | string;
  description: string | null;
  created_at: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_at: string;
}
