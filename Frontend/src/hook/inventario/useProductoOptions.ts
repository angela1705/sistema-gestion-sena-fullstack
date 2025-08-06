import { useEffect, useState } from 'react';

interface Categoria {
  id: number;
  nombre: string;
}

interface UnidadProductiva {
  id: number;
  nombre: string;
}

export const useProductoOptions = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<UnidadProductiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');

      const [catRes, unidRes] = await Promise.all([
        fetch('http://localhost:8000/api/categoria/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:8000/api/unidad-productiva/', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!catRes.ok || !unidRes.ok) {
        throw new Error('Error al cargar opciones');
      }

      const catData = await catRes.json();
      const unidData = await unidRes.json();

      setCategorias(catData.results ?? catData);  // compatible con paginado o no
      setUnidades(unidData.results ?? unidData);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return { categorias, unidades, loading, error };
};
