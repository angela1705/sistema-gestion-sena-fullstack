
// src/hooks/gestion_operativa/caja_diaria/useCerrarCaja.ts
import { useState } from 'react';
import { CajaDiariaCierreData } from '../../types/gestion_operativa/caja_diaria';
import { useNavigate } from 'react-router-dom';

export const useCerrarCaja = (cajaId: number) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const cerrarCaja = async (data: CajaDiariaCierreData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      setError('No estás autenticado.');
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/cajaDiaria/${cajaId}/cerrar_caja/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cerrar la caja.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedCaja = await response.json();
      return updatedCaja;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { cerrarCaja, loading, error };
};