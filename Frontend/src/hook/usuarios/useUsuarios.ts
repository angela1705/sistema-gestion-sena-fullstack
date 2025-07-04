// src/hook/usuarios/useUsuarios.ts (suposición basada en Inicio.tsx)
import { useState, useEffect } from 'react';
import { Persona } from '../../types/usuarios/usuarios';

export interface UseUsuariosResponse {
  usuarios: Persona[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUsuarios = (): UseUsuariosResponse => {
  const [usuarios, setUsuarios] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No se encontró el token de autenticación');

      const response = await fetch('http://localhost:8000/api/personas/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al cargar usuarios');
      }

      const data = await response.json();
      const normalizedData: Persona[] = Array.isArray(data) ? data : data.results || [];
      setUsuarios(normalizedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return { usuarios, loading, error, refetch: fetchUsuarios };
};