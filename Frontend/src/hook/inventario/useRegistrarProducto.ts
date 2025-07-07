import { useState } from 'react';
import { ProductoFormData } from '../../types/inventario/Producto';

export const useRegistrarProducto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrarProducto = async (formData: ProductoFormData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const form = new FormData();
      form.append('nombre', formData.nombre);
      form.append('descripcion', formData.descripcion);
      if (formData.categoria) form.append('categoria', formData.categoria);
      if (formData.unidadP) form.append('unidadP', formData.unidadP);
      form.append('estado', formData.estado);
      form.append('stock', formData.stock.toString());
      form.append('reservas', formData.reservas.toString());
      if (formData.hora_limite_reserva) form.append('hora_limite_reserva', formData.hora_limite_reserva);
      if (formData.stock && formData.stock_actual != null)
        form.append('stock_actual', formData.stock_actual.toString());
      if (formData.max_reservas) form.append('max_reservas', formData.max_reservas.toString());
      form.append('precio_compra', formData.precio_compra);
      form.append('tiene_descuento', formData.tiene_descuento.toString());
      if (formData.porcentaje_descuento) form.append('porcentaje_descuento', formData.porcentaje_descuento);
      form.append('tiene_comision', formData.tiene_comision.toString());
      if (formData.comision) form.append('comision', formData.comision);
      if (formData.unidad_comision_destino) form.append('unidad_comision_destino', formData.unidad_comision_destino);
      if (formData.imagen) form.append('imagen', formData.imagen);
      form.append('unidad_medida_base', formData.unidad_medida_base);

      const response = await fetch('http://localhost:8000/api/producto/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          response.status === 403
            ? 'No tienes permisos para registrar un producto con comisión. Debes ser líder de Tienda Yamboro.'
            : errorData.detail || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al registrar el producto';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { registrarProducto, loading, error };
};