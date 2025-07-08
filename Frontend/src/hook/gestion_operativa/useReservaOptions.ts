// hook/gestion_operativa/useReservaOptions.tsx
import { useState, useEffect } from 'react';

export interface PersonaOption {
  id: number;
  first_name: string;
}

export interface ProductoOption {
  id: number;
  nombre: string;
}

export const useReservaOptions = () => {
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [productos, setProductos] = useState<ProductoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado. Por favor, inicia sesión.');

      // Fetch personas
      const personasResponse = await fetch('http://localhost:8000/api/personas/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!personasResponse.ok) {
        const errorData = await personasResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${personasResponse.status}: No se pudieron obtener las personas`);
      }
      const personasData = await personasResponse.json();
      console.log('useReservaOptions - Personas API Response:', JSON.stringify(personasData, null, 2));
      const normalizedPersonas = Array.isArray(personasData) ? personasData : personasData.results || [];
      const formattedPersonas = normalizedPersonas.map((item: any) => ({
        id: item.id,
        first_name: item.first_name || 'Sin nombre',
      }));
      setPersonas(formattedPersonas);

      // Fetch productos
      const productosResponse = await fetch('http://localhost:8000/api/producto/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!productosResponse.ok) {
        const errorData = await productosResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${productosResponse.status}: No se pudieron obtener los productos`);
      }
      const productosData = await productosResponse.json();
      console.log('useReservaOptions - Productos API Response:', JSON.stringify(productosData, null, 2));
      const normalizedProductos = Array.isArray(productosData) ? productosData : productosData.results || [];
      const formattedProductos = normalizedProductos.map((item: any) => ({
        id: item.id,
        nombre: item.nombre || 'Sin nombre',
      }));
      setProductos(formattedProductos);

      console.log('useReservaOptions - Formatted Personas:', formattedPersonas);
      console.log('useReservaOptions - Formatted Productos:', formattedProductos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener opciones';
      console.error('useReservaOptions - Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return { personas, productos, loading, error };
};