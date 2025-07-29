import { useState } from 'react';
import axios from 'axios';
import { SenaEmpresa } from '@/types/entidades/SenaEmpresa';

export const useManageSenaEmpresa = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createUpdateEmpresa = async (data: Partial<SenaEmpresa>, isUpdate: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const url = isUpdate 
        ? `http://localhost:8000/api/empresas-sena/${data.id}/`
        : 'http://localhost:8000/api/empresas-sena/';

      const method = isUpdate ? 'patch' : 'post';
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (value instanceof Blob) {
                formData.append(key, value);
            } else if (typeof value === 'number' || typeof value === 'boolean') {
                formData.append(key, value.toString());
            } else if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else {
            formData.append(key, value as string);
        }
       }
       });

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar la empresa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleActiva = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:8000/api/empresas-sena/${id}/activate/`,
        { activa: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cambiar estado');
      throw err;
    }
  };

  return {
    createUpdateEmpresa,
    toggleActiva,
    loading,
    error,
    success,
    reset: () => {
      setError(null);
      setSuccess(false);
    }
  };
};