import { useState } from 'react';

interface UseManageCategoria {
  success: boolean;
  error: string | null;
  loading: boolean;
  createUpdateCategoria: (data: FormData, isUpdate: boolean, id?: number) => Promise<void>;
  reset: () => void;
}

export const useManageCategoria = (baseUrl: string): UseManageCategoria => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createUpdateCategoria = async (data: FormData, isUpdate: boolean, id?: number) => {
    setSuccess(false);
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = isUpdate ? `${baseUrl}${id}/` : baseUrl;
      const method = isUpdate ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData?.nombre?.[0] || 'Error al guardar');
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setError(null);
    setLoading(false);
  };

  return { success, error, loading, createUpdateCategoria, reset };
};