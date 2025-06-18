
import { useState, useEffect } from 'react';
import { Persona } from '../../types/usuarios/usuarios';
import { useNavigate } from 'react-router-dom';

interface UseCurrentUserResponse {
  user: Persona | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCurrentUser = (): UseCurrentUserResponse => {
  const [user, setUser] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      setError('No estás autenticado. Por favor, inicia sesión.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/personas/me/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: Persona = await response.json();
      setUser(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [navigate]);

  const refetch = () => {
    setIsLoading(true);
    setError(null);
    fetchUser();
  };

  return { user, isLoading, error, refetch };
};