import { useState } from 'react';
import { CajaDiariaCierreData } from '../../types/gestion_operativa/caja_diaria';

export const useCerrarCaja = (cajaId: number | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cerrarCaja = async (data: CajaDiariaCierreData) => {
    if (!cajaId) throw new Error('No se especificó el ID de la caja');
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado');

      const response = await fetch(`http://localhost:8000/api/cajaDiaria/${cajaId}/cerrar_caja/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          saldo_final: parseFloat(data.saldo_final),
          observaciones: data.observaciones || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || 'Error al cerrar caja');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { cerrarCaja, loading, error };
};