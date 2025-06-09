
import { useState, useEffect } from 'react';

export const useProductoOptions = () => {
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [unidades, setUnidades] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [categoriasResponse, unidadesResponse] = await Promise.all([
          fetch('http://localhost:8000/api/categoria/', { headers }),
          fetch('http://localhost:8000/api/unidad-productiva/', { headers }),
        ]);

        if (!categoriasResponse.ok || !unidadesResponse.ok) {
          throw new Error('Error al obtener opciones');
        }

        const categoriasData = await categoriasResponse.json();
        const unidadesData = await unidadesResponse.json();

        console.log('Respuesta de /api/categoria/:', categoriasData);
        console.log('Respuesta de /api/unidad-productiva/:', unidadesData);

        const normalizedCategorias = Array.isArray(categoriasData)
          ? categoriasData
          : categoriasData.results || [];
        const normalizedUnidades = Array.isArray(unidadesData)
          ? unidadesData
          : unidadesData.results || [];

        setCategorias(normalizedCategorias);
        setUnidades(normalizedUnidades);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { categorias, unidades, loading, error };
};