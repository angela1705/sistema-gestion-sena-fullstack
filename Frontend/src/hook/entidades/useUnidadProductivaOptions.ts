
import { useState, useEffect } from 'react';

interface SedeOption {
  id: number;
  nombre_display: string;
}

interface EncargadoOption {
  id: number;
  nombre_completo: string;
}

export const useUnidadProductivaOptions = () => {
  const [sedes, setSedes] = useState<SedeOption[]>([]);
  const [encargados, setEncargados] = useState<EncargadoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch sedes
        const sedeResponse = await fetch('http://localhost:8000/api/sedes/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!sedeResponse.ok) throw new Error('Error al cargar sedes');
        const sedeData = await sedeResponse.json();
        console.log('Respuesta de /api/sedes/:', sedeData);
        const normalizedSedes = Array.isArray(sedeData) ? sedeData : (sedeData.results || []);
        setSedes(normalizedSedes);

        // Fetch encargados
        const encargadoResponse = await fetch('http://localhost:8000/api/personas/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!encargadoResponse.ok) throw new Error('Error al cargar encargados');
        const encargadoData = await encargadoResponse.json();
        console.log('Respuesta de /api/personas/:', encargadoData);
        const normalizedEncargados = Array.isArray(encargadoData) ? encargadoData : (encargadoData.results || []);
        setEncargados(normalizedEncargados);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error en useUnidadProductivaOptions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { sedes, encargados, loading, error };
};
