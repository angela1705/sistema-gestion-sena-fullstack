
// src/hook/gestion_operativa/useTransaccion.ts
import { useState, useEffect } from 'react';
import { Transaccion } from '../../types/gestion_operativa/transaccion';

export const useTransaccion = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransacciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/transaccion/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const transaccionesData = Array.isArray(data) ? data : data.results || [];
      setTransacciones(transaccionesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching transacciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransacciones();
  }, []);

  const refetch = () => fetchTransacciones();

  return { transacciones, loading, error, refetch };
};