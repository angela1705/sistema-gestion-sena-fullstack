import { useState, useEffect } from 'react';
import { Sede } from '../../types/entidades/sede';

interface UseSedes {
  sedes: Sede[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export const useSedes = (url: string): UseSedes => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSedes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('No tienes permisos para ver esta página. Debes ser administrador.');
        } else {
          const errorText = await response.text();
          setError(`Error ${response.status}: ${errorText}`);
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      const normalizedSedes = Array.isArray(data) ? data : data.results || [];
      setSedes(normalizedSedes);
    } catch (err: any) {
      console.error('Error al cargar sedes:', err);
      setError(err.message || 'Error al cargar las sedes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, [url]);

  return { sedes, isLoading, error, retry: fetchSedes };
};