export type Role = "ADMIN" | "DEVELOPER";

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}
