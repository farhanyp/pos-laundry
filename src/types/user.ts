import { Role } from './enums';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  created_at: string;
}

export interface UpdateUserRoleInput {
  role: Role;
}
