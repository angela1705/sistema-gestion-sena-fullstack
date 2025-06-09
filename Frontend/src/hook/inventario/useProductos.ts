
import { useState, useEffect } from 'react';
import { Producto } from '../../types/inventario/Producto';

export const useProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch('http://localhost:8000/api/producto/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Datos de productos:', data);
      const normalizedData = Array.isArray(data) ? data : data.results || [];
      setProductos(normalizedData);
      setError(null); // Limpiar error si la petición es exitosa
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar productos';
      console.error('Error en fetchProductos:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  return { productos, loading, error, refetch: fetchProductos };
};