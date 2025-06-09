
import { useState, useEffect } from 'react';
import { Precio } from '../../types/inventario/Precio';

export const usePrecio = () => {
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrecios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/precio/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener precios');

      const data = await response.json();
      console.log('Datos de precios:', data);
      const normalizedData = Array.isArray(data) ? data : data.results || [];
      setPrecios(normalizedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrecios();
  }, []);

  return { precios, loading, error, refetch: fetchPrecios };
};
