import { useState } from 'react';
//import { UnidadProductiva } from '@/types/entidades/UnidadProductiva';

interface UseManageUnidad {
  success: boolean;
  error: string | null;
  loading: boolean;
  toggleActiva: (id: number, currentStatus: boolean) => Promise<void>;
  createUpdateUnidad: (data: FormData, isUpdate: boolean, id?: number) => Promise<void>;
  reset: () => void;
}

export const useManageUnidad = (baseUrl: string): UseManageUnidad => {
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const createUpdateUnidad = async (data: FormData, isUpdate: boolean, id?: number) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación');
        setLoading(false);
        return;
      }

      // Asegurar que los campos relacionales estén incluidos
      if (!data.get('sede')) {
        setError('La sede es requerida');
        setLoading(false);
        return;
      }

      const url = isUpdate ? `${baseUrl}${id}/` : baseUrl;
      const method = isUpdate ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          // No incluir 'Content-Type' para FormData (se genera automáticamente con boundary)
        },
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del backend:', errorData);
        
        if (errorData.tipo?.[0]?.includes("Ya existe una unidad productiva")) {
            setError("Ya existe una unidad registrada con ese tipo.");
           } else {
             setError(
              errorData.detail || 
              errorData.message || 
             (typeof errorData === 'object' ? JSON.stringify(errorData) : `Error ${response.status}`)
    );
  }  

      setLoading(false);
      return;
    }

    setSuccess(true);
  } catch (err: any) {
    console.error('Error al gestionar unidad:', err);
    setError(err.message || 'Error al guardar la unidad productiva');
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
        setError('No se encontró el token de autenticación');
        setLoading(false);
        return;
      }

  
      const response = await fetch(`${baseUrl}${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          activa: !currentStatus 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || `Error al cambiar estado: ${response.status}`);
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Error al cambiar estado:', err);
      setError(err.message || 'Error al cambiar estado de la unidad');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setError(null);
    setLoading(false);
  };

  return { 
    success, 
    error, 
    loading, 
    toggleActiva, 
    createUpdateUnidad, 
    reset 
  };
};