// src/hooks/usuarios/useAuth.ts
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { LoginCredentials, LoginResponse } from '../../types/usuarios/auth';
import { decodeJWT } from '../../utils/jwt';

export interface UserInfo {
  user_id: number;
  rol: string | null;
  unidad_productiva: string | null;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);

  // Cargar información del usuario desde el token al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    const decoded = decodeJWT(token);
    if (decoded) {
      setUserInfo({
        user_id: decoded.user_id,
        rol: decoded.rol || null,
        unidad_productiva: decoded.unidad_productiva || null,
      });
    }
    setLoadingUserInfo(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<LoginResponse>('/personas/login/', credentials);
      const { access } = response.data;
      localStorage.setItem('token', access);

      // Decodificar el token después de iniciar sesión
      const decoded = decodeJWT(access);
      if (decoded) {
        setUserInfo({
          user_id: decoded.user_id,
          rol: decoded.rol || null,
          unidad_productiva: decoded.unidad_productiva || null,
        });
      }

      return response.data;
    } catch (err) {
      const errorMessage = (err as any).response?.data?.detail || 'Error al iniciar sesión';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error, userInfo, loadingUserInfo };
};