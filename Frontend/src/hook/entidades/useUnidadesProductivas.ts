// src/hooks/unidades-productivas/useUnidadesProductivas.ts
import { useState, useEffect } from 'react';
import { UnidadProductiva } from '../../types/entidades/UnidadProductiva';

export const useUnidadesProductivas = () => {
  const [unidades, setUnidades] = useState<UnidadProductiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnidades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/unidad-productiva/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener unidades productivas');

      const data = await response.json();
      console.log('Datos de unidades productivas:', data);
      const normalizedData = Array.isArray(data) ? data : data.results || [];
      setUnidades(normalizedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidades();
  }, []);

  return { unidades, loading, error, refetch: fetchUnidades };
};