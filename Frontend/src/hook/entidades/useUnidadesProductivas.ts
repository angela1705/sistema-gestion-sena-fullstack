import { useState, useEffect } from 'react';
import { UnidadProductiva } from '@/types/entidades/UnidadProductiva';

interface UseUnidades {
  unidades: UnidadProductiva[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export const useUnidades = (url: string): UseUnidades => {
  const [unidades, setUnidades] = useState<UnidadProductiva[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnidades = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('No tienes permisos para ver esta página. Debes ser administrador.');
        } else {
          const errorData = await response.json();
          // Manejo mejorado de errores del backend
          setError(
            errorData.detail || 
            errorData.message || 
            `Error ${response.status}: ${JSON.stringify(errorData)}`
          );
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      interface UnidadTemporal {
        activa: boolean;
        [key: string]: any;
      }
      
      const unidadesFormateadas = (Array.isArray(data) ? data : data.results || []).map((unit: UnidadTemporal) => ({
        ...unit,
        esta_activa: unit.activa,
        estado_display: unit.activa ? 'Activa' : 'Inactiva'
      }));

      setUnidades(unidadesFormateadas as UnidadProductiva[]);

    } catch (err: any) {
      console.error('Error al cargar unidades:', err);
      setError(err.message || 'Error al cargar las unidades productivas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidades();
  }, [url]);

  return { 
    unidades, 
    isLoading, 
    error, 
    retry: fetchUnidades 
  };
};