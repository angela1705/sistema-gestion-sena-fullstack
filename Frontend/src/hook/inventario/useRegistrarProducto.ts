import { useState } from 'react';
import axios from 'axios';
import { ProductoFormData } from '@/types/inventario/Producto';

export function useRegistrarProducto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrarProducto = async (
    data: ProductoFormData,
    isEdit: boolean = false,
    id?: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      for (const key in data) {
        const value = (data as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'imagen' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value);
          }
        }
      }

      const baseURL = 'http://127.0.0.1:8000/api/producto/';
      const url = isEdit ? `${baseURL}${id}/` : baseURL;
      const method = isEdit ? 'put' : 'post';

      const token = localStorage.getItem('token'); 

      await axios({
        url,
        method,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        Object.values(err?.response?.data || {})?.[0] ||
        'Error al registrar/editar producto';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    registrarProducto,
    loading,
    error,
  };
}
