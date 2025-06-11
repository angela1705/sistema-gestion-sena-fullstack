
// src/hooks/gestion_operativa/caja_diaria/useRegistrarCaja.ts
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { CajaDiaria } from "../../types/gestion_operativa/caja_diaria";

export const useRegistrarCaja = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const registrarCaja = async (data: { unidadProductiva: number; saldo_inicial: number; observaciones?: string }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      setError('No estás autenticado.');
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/cajaDiaria/", {
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

      const newCaja = await response.json();
      return newCaja as CajaDiaria;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { registrarCaja, loading, error };
};