// src/hooks/entidades/useRegistrarUnidadProductiva.ts
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
      if (!token) throw new Error('No se encontró el token de autenticación');

      const encargadoId = formData.encargado ? parseInt(formData.encargado) : null;
      console.log('Enviando datos al backend:', { ...formData, encargado: encargadoId }); // Añadir log

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
          encargado: encargadoId,
          horario_atencion: formData.horario_atencion,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al registrar unidad productiva');
      }

      const result = await response.json();
      console.log('Unidad registrada:', result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { registrarUnidad, loading, error };
};