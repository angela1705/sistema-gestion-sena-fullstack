// src/types/usuarios.ts
export interface LoginCredentials {
  identificacion: string;
  password: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
}

export interface AuthError {
  message: string;
}