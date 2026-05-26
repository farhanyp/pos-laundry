import { Role } from "./enums";

export interface UserRole {
  id: string;
  name: Role;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles?: Role[];
  created_at: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  roles: Role[];
}
