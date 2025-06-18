
// src/hook/gestion_operativa/useDetalleCaja.ts
import { useState, useEffect } from 'react';
import { DetalleCaja } from '../../types/gestion_operativa/detalle_caja';

export const useDetalleCaja = () => {
  const [detalleCajas, setDetalleCajas] = useState<DetalleCaja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetalleCajas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/detalleCaja/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const detalleCajasData = Array.isArray(data) ? data : data.results || [];
      setDetalleCajas(detalleCajasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching detalle cajas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetalleCajas();
  }, []);

  const refetch = () => fetchDetalleCajas();

  return { detalleCajas, loading, error, refetch };
};