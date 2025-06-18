
// src/hook/gestion_operativa/useRegistrarDetalleCaja.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DetalleCaja, DetalleCajaCreateData } from '../../types/gestion_operativa/detalle_caja';

export const useRegistrarDetalleCaja = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const registrarDetalleCaja = async (data: DetalleCajaCreateData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      setError('No estás autenticado.');
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/detalleCaja/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const newDetalleCaja = await response.json();
      return newDetalleCaja as DetalleCaja;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { registrarDetalleCaja, loading, error };
};