import { useState, useEffect } from 'react';
import { Transaccion } from '../../types/gestion_operativa/transaccion';

export const useTransaccion = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransacciones = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch('http://localhost:8000/api/transaccion/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Datos de transacciones:', data);
      const normalizedData = Array.isArray(data) ? data : data.results || [];
      setTransacciones(normalizedData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar transacciones';
      console.error('Error en fetchTransacciones:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransacciones();
  }, []);

  return { transacciones, loading, error, refetch: fetchTransacciones };
};