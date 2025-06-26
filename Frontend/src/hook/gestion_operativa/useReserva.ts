// hook/gestion_operativa/useReserva.ts
import { useState, useEffect } from 'react';
import { Reserva } from '../../types/gestion_operativa/reserva';

interface UseReservaResponse {
  reservas: Reserva[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useReserva = (apiUrl: string = 'http://localhost:8000/api/reservas/'): UseReservaResponse => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No estás autenticado. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Datos de la API (reservas) - Conteo:', data.length); // Solo conteo para depuración
      const reservasData = Array.isArray(data) ? data : (data.results || []);
      setReservas(reservasData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar las reservas.');
      console.error('Error fetching reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]); // Solo se ejecuta al montar o cambiar apiUrl

  const refetch = () => {
    setLoading(true);
    setError(null);
    fetchReservas();
  };

  return { reservas, loading, error, refetch };
};