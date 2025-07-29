import { useState } from 'react';
import { Sede } from '../../types/entidades/sede';

interface UseManageSede {
  success: boolean;
  error: string | null;
  loading: boolean;
  toggleActiva: (id: number, currentStatus: boolean) => Promise<void>;
  createUpdateSede: (data: Sede, isUpdate: boolean) => Promise<void>;
  reset: () => void;
}

export const useManageSede = (baseUrl: string): UseManageSede => {
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const createUpdateSede = async (data: Sede, isUpdate: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        setLoading(false);
        return;
      }

      const url = isUpdate ? `${baseUrl}${data.id}/` : baseUrl;
      const method = isUpdate ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || JSON.stringify(errorData) || `Error ${response.status}`);
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Error al gestionar sede:', err);
      setError(err.message || 'Error al gestionar la sede.');
    } finally {
      setLoading(false);
    }
  };

  const toggleActiva = async (id: number, currentStatus: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${baseUrl}${id}/toggle_activa/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activa: !currentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || `Error ${response.status}`);
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Error al cambiar estado de sede:', err);
      setError(err.message || 'Error al cambiar estado de sede.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setError(null);
    setLoading(false);
  };

  return { success, error, loading, toggleActiva, createUpdateSede, reset };
};