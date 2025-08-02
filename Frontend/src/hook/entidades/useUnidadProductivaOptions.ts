import { useState, useEffect } from 'react';
import { UnidadOpciones } from '@/types/entidades/UnidadProductiva';

export const useUnidadOpciones = () => {
  const [opciones, setOpciones] = useState<UnidadOpciones>({ 
    tipos: {}, 
    encargados: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpciones = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch('http://localhost:8000/api/unidad-productiva/opciones/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        setOpciones({
          tipos: data.tipos || {},
          encargados: data.encargados || []
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar opciones');
      } finally {
        setLoading(false);
      }
    };

    fetchOpciones();
  }, []);

  return { 
    opciones, 
    loading, 
    error 
  };
};