
import { useState, useEffect } from 'react';

interface Option {
  id: number;
  nombre: string;
}

export const usePrecioOptions = () => {
  const [productos, setProductos] = useState<Option[]>([]);
  const [cargos, setCargos] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const productosResponse = await fetch('http://localhost:8000/api/producto/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const cargosResponse = await fetch('http://localhost:8000/api/cargo/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!productosResponse.ok || !cargosResponse.ok) {
        throw new Error('Error al cargar opciones');
      }

      const productosData = await productosResponse.json();
      const cargosData = await cargosResponse.json();

      console.log('Datos de productos:', productosData);
      console.log('Datos de cargos:', cargosData);

      const normalizedProductos = (Array.isArray(productosData) ? productosData : productosData.results || []).map(
        (item: any) => ({ id: item.id, nombre: item.nombre })
      );
      const normalizedCargos = (Array.isArray(cargosData) ? cargosData : cargosData.results || []).map(
        (item: any) => ({ id: item.id, nombre: item.nombre })
      );

      setProductos(normalizedProductos);
      setCargos(normalizedCargos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return { productos, cargos, loading, error };
};