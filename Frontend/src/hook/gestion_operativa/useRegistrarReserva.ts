import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Reserva, ReservaCreateData } from '../../types/gestion_operativa/reserva';

export const useRegistrarReserva = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const registrarReserva = async (data: ReservaCreateData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      setError('No estás autenticado.');
      return null;
    }

    setLoading(true);
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1] || '';
      const response = await fetch('http://localhost:8000/api/reservas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRFToken': csrfToken, // Para manejar CSRF si el servidor lo requiere
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const newReserva = await response.json();
      return newReserva as Reserva;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { registrarReserva, loading, error };
};