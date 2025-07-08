// hook/gestion_operativa/useCancelarReserva.tsx
import { useState } from 'react';

interface UseCancelarReservaResponse {
  cancelarReserva: (id: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useCancelarReserva = (): UseCancelarReservaResponse => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cancelarReserva = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado.');

      const response = await fetch(`http://localhost:8000/api/reservas/${id}/cancelar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al cancelar la reserva');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al cancelar reserva:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { cancelarReserva, loading, error };
};