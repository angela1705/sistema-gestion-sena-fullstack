
// src/hook/gestion_operativa/useRegistrarCaja.ts
import { useState } from 'react';
import { CajaDiariaFormData } from '../../types/gestion_operativa/caja_diaria';

export const useRegistrarCaja = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrarCaja = async (data: CajaDiariaFormData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado');
      const response = await fetch('http://localhost:8000/api/cajaDiaria/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unidadProductiva: parseInt(data.unidadProductiva || '0'),
          saldo_inicial: parseFloat(data.saldo_inicial || '0'),
          observaciones: data.observaciones || '',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al registrar caja: ${errorText}`);
      }

      const result = await response.json();
      console.log('Registro exitoso:', result);
      return result; // Devolver la respuesta para posibles usos futuros
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { registrarCaja, loading, error };
};