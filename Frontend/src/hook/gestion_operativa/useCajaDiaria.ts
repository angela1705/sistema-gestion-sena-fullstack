
// src/hook/gestion_operativa/useCajaDiaria.ts
import { useState, useEffect } from 'react';

export interface CajaDiaria {
  id: number;
  fecha_apertura: string;
  unidadProductiva_info: { nombre: string };
  saldo_inicial: number;
  esta_abierta: boolean;
  duracion: string;
}

export const useCajaDiaria = () => {
  const [cajas, setCajas] = useState<CajaDiaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCajas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/cajaDiaria/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener cajas diarias');

      const data = await response.json();
      console.log('Datos de cajas:', data);
      const normalizedData = Array.isArray(data) ? data : data.results || [];
      setCajas(normalizedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCajas();
  }, []);

  const refetch = () => fetchCajas();

  return { cajas, loading, error, refetch };
};