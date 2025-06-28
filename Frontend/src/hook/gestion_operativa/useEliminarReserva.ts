import { useState } from 'react';

interface UseEliminarReservaResponse {
  eliminarReserva: (reservaId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useEliminarReserva = (): UseEliminarReservaResponse => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const eliminarReserva = async (reservaId: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autenticado. Por favor, inicia sesión.');
      }

      const response = await fetch(`http://localhost:8000/api/reservas/${reservaId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al eliminar la reserva.');
      console.error('Error eliminando reserva:', err);
    } finally {
      setLoading(false);
    }
  };

  return { eliminarReserva, loading, error };
};