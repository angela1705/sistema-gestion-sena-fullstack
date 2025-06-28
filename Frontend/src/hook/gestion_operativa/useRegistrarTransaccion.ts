import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaccion, TransaccionCreateData } from '../../types/gestion_operativa/transaccion';
import { useTransaccion } from './useTransaccion';

export const useRegistrarTransaccion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refetch } = useTransaccion();

  const registrarTransaccion = async (data: TransaccionCreateData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      setError('No estás autenticado.');
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/transaccion/', {
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

      const newTransaccion = await response.json();
      console.log('Transacción creada:', newTransaccion); // Depuración
      refetch(); // Refrescamos la lista
      return newTransaccion as Transaccion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar transacción.');
      console.error('Error registrando transacción:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { registrarTransaccion, loading, error };
};