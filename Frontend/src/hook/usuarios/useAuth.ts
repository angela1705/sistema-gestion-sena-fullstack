// src/hooks/usuarios/useAuth.ts
import { useState } from 'react';
import api from '../../api/axios';
import { LoginCredentials, LoginResponse } from '../../types/usuarios/auth';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<LoginResponse>('/personas/login/', credentials); // Cambiado a '/personas/login/'
      const { access } = response.data;
      localStorage.setItem('token', access);
      return response.data;
    } catch (err) {
      const errorMessage = (err as any).response?.data?.detail || 'Error al iniciar sesión';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};