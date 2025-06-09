
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
      const form = new FormData();
      form.append('nombre', formData.nombre);
      form.append('descripcion', formData.descripcion);
      if (formData.categoria) form.append('categoria', formData.categoria);
      if (formData.unidadP) form.append('unidadP', formData.unidadP);
      form.append('estado', formData.estado);
      form.append('tipo_gestion', formData.tipo_gestion);
      form.append('reservas', formData.reservas.toString());
      if (formData.hora_limite_reserva)
        form.append('hora_limite_reserva', formData.hora_limite_reserva);
      if (formData.stock_actual != null)
        form.append('stock_actual', formData.stock_actual.toString());
      if (formData.capacidad_diaria != null)
        form.append('capacidad_diaria', formData.capacidad_diaria.toString());
      form.append('precio_compra', formData.precio_compra);
      form.append('tiene_descuento', formData.tiene_descuento.toString());
      if (formData.porcentaje_descuento)
        form.append('porcentaje_descuento', formData.porcentaje_descuento);
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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al registrar producto');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { registrarProducto, loading, error };
};