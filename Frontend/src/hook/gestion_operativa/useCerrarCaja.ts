
// src/hook/gestion_operativa/useCerrarCaja.ts
import { useState } from 'react';
import { CajaDiariaCierreData } from '../../types/gestion_operativa/caja_diaria';

export const useCerrarCaja = (cajaId: number) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cerrarCaja = async (data: CajaDiariaCierreData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/cajaDiaria/${cajaId}/cerrar_caja/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          saldo_final: parseFloat(data.saldo_final.toString()),
          observaciones: data.observaciones,
        }),
      });

      if (!response.ok) throw new Error('Error al cerrar caja');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { cerrarCaja, loading, error };
};