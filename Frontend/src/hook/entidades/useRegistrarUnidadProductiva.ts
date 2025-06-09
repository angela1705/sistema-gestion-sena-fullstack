
import { useState } from 'react';
import { UnidadProductivaFormData } from '../../types/entidades/UnidadProductiva';

export const useRegistrarUnidadProductiva = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrarUnidad = async (formData: UnidadProductivaFormData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/unidad-productiva/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          tipo: formData.tipo,
          sede: parseInt(formData.sede),
          encargado: parseInt(formData.encargado),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al registrar unidad productiva');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { registrarUnidad, loading, error };
};
