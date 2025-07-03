import { useState } from 'react';
import { TransaccionCreateData, TipoTransaccion } from '../../types/gestion_operativa/transaccion';

export const useRegistrarTransaccion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrarTransaccion = async (data: TransaccionCreateData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch('http://localhost:8000/api/transaccion/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          tipo: data.tipo || TipoTransaccion.VENTA,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar transacción';
      setError(errorMessage);
      console.error('Error en registrarTransaccion:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { registrarTransaccion, loading, error };
};