export interface User {
  id: string | number;
  phone: string;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshResponse {
  access: string;
}