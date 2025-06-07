// src/hooks/useSedeOptions.ts
import { useState, useEffect } from 'react';

interface SenaEmpresa {
  id: number;
  nombre: string;
}

export const useSedeOptions = () => {
  const [senaEmpresas, setSenaEmpresas] = useState<SenaEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresas = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('http://localhost:8000/api/empresas-sena/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status); // Para debug

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Datos recibidos:', data); // Para verificar los datos

      if (!Array.isArray(data)) {
        throw new Error('Formato de datos inválido');
      }

      setSenaEmpresas(data);
    } catch (err) {
      console.error('Error al obtener empresas:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSenaEmpresas([]); // Asegurar array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return { 
    senaEmpresas, 
    loading, 
    error,
    refetch: fetchEmpresas
  };
};