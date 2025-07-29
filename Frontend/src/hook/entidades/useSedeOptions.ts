import { useEffect, useState } from 'react';
import { SedeOption } from '@/types/entidades/sede';

export const useSedeOptions = () => {
  const [sedeOptions, setSedeOptions] = useState<SedeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/sedes/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Error al cargar sedes');

        const data = await response.json();
        const options = data.map((sede: any) => ({
          id: sede.id,
          nombre_display: sede.nombre
        }));
        setSedeOptions(options);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchSedes();
  }, []);

  return { sedeOptions, loading, error };
};