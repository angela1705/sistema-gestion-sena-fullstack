
import { useState, useEffect } from 'react';
import { TipoCategoria } from '../../types/inventario/Categoria';

export const useCategories = () => {
  const [categorias, setCategorias] = useState<TipoCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/categoria/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener categorías');

      const data = await response.json();
      console.log('Datos de categorías:', data);
      const normalizedData = Array.isArray(data) ? data : data.results || [];
      setCategorias(normalizedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return { categorias, loading, error, refetch: fetchCategorias };
};