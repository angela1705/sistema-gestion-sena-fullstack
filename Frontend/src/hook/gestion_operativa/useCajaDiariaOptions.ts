import { useState, useEffect } from 'react';

export const useCajaDiariaOptions = () => {
  const [unidades, setUnidades] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado. Por favor, inicia sesión.');

      const response = await fetch('http://localhost:8000/api/unidad-productiva/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}: No se pudieron obtener las unidades productivas`);
      }

      const data = await response.json();
      console.log('useCajaDiariaOptions - API Response:', data);
      const normalizedData = Array.isArray(data) ? data : data.results || [];
      const formattedUnits = normalizedData.map((item: any) => ({
        id: item.id,
        nombre: item.nombre || 'Sin nombre',
      }));
      setUnidades(formattedUnits);
      console.log('useCajaDiariaOptions - Formatted Units:', formattedUnits);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener unidades';
      console.error('useCajaDiariaOptions - Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return { unidades, loading, error };
};