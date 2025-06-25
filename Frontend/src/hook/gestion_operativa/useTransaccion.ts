import { useState, useEffect } from 'react';
import { Transaccion } from '../../types/gestion_operativa/transaccion';
import { useUsuarios } from '../../hook/usuarios/useUsuarios';
import { useProductos } from '../../hook/inventario/useProductos';

export const useTransaccion = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { usuarios } = useUsuarios();
  const { productos } = useProductos();

  const fetchTransacciones = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No estás autenticado.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/transaccion/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Datos de la API (transacciones):', data); // Depuración
      const transaccionesData = Array.isArray(data) ? data : data.results || [];

      // Enriquecemos las transacciones con nombres
      const enrichedTransacciones = transaccionesData.map((transaccion: any) => {
        const usuario = usuarios.find((u) => u.id === transaccion.usuario) || { first_name: 'Sin usuario' };
        const producto = productos.find((p) => p.id === transaccion.producto) || { nombre: 'Sin producto' };
        return {
          ...transaccion,
          usuario_info: { first_name: usuario.first_name },
          producto_info: { nombre: producto.nombre },
        };
      });

      setTransacciones(enrichedTransacciones);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones.');
      setTransacciones([]); // Aseguramos que se limpie si hay error
      console.error('Error fetching transacciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransacciones();
  }, [usuarios, productos]);

  const refetch = () => fetchTransacciones();

  return { transacciones, loading, error, refetch };
};