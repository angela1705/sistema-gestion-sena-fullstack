// hook/gestion_operativa/useRegistrarReserva.tsx
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

      const payload: any = {
        producto: data.producto,
        cantidad: data.cantidad,
      };
      if (data.persona) {
        payload.persona = data.persona;
      }

      const response = await fetch('http://localhost:8000/api/reservas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al registrar la reserva');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al registrar reserva:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { registrarReserva, loading, error };
};