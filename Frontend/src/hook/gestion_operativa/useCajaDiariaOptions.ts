
// src/hook/gestion_operativa/useCajaDiariaOptions.ts
import { useState, useEffect } from 'react';

export const useCajaDiariaOptions = () => {
  const [unidades, setUnidades] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/unidad-productiva/opciones/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener opciones');

      const data = await response.json();
      const normalizedData = Array.isArray(data) ? data : data.results || [];
      setUnidades(normalizedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return { unidades, loading, error };
};