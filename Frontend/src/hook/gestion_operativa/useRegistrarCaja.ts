import { useState } from 'react';
import { CajaDiariaFormData } from '../../types/gestion_operativa/caja_diaria';

export const useRegistrarCaja = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrarCaja = async (data: CajaDiariaFormData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado');

      const response = await fetch('http://localhost:8000/api/cajaDiaria/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unidadProductiva: parseInt(data.unidadProductiva),
          saldo_inicial: parseFloat(data.saldo_inicial),
          observaciones: data.observaciones || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al registrar caja');
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

  return { registrarCaja, loading, error };
};