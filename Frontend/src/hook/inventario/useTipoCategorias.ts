import { useState, useEffect } from 'react';
import { TipoCategoria } from '@/types/inventario/Categoria';

export const useTipoCategorias = () => {
  const [categorias, setCategorias] = useState<TipoCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/categoria/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setCategorias(Array.isArray(data.results) ? data.results : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return { categorias, loading, error, retry: fetchCategorias };
};