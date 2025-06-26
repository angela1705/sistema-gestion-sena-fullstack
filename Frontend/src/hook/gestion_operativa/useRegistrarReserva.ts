// hook/gestion_operativa/useRegistrarReserva.ts
import { useState } from 'react';
import { ReservaCreateData } from '../../types/gestion_operativa/reserva';

interface UseRegistrarReservaResponse {
  registrarReserva: (data: ReservaCreateData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useRegistrarReserva = (): UseRegistrarReservaResponse => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const registrarReserva = async (data: ReservaCreateData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado.');

      const response = await fetch('http://localhost:8000/api/reservas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error al registrar la reserva');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al registrar reserva:', err);
    } finally {
      setLoading(false);
    }
  };

  return { registrarReserva, loading, error };
};