import { useState, useEffect } from 'react';
import axios from 'axios';
import { SenaEmpresa } from '@/types/entidades/SenaEmpresa';

export const useSenaEmpresas = () => {
  const [empresas, setEmpresas] = useState<SenaEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/empresas-sena/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = response.data.results || response.data;

      if (!Array.isArray(data)) {
        throw new Error('Formato de datos inesperado');
      }
      
      setEmpresas(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      console.error('Error fetching empresas:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchEmpresas();
  }, []);

  return { 
    empresas, 
    loading, 
    error,
    refetch: fetchEmpresas
  };
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return 'Error desconocido';
}