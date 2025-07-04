// src/hook/entidades/useSenaEmpresas.ts
import { useState, useEffect } from 'react';
import { SenaEmpresa } from '../../types/entidades/SenaEmpresa';
import { SedeOption } from '../../types/entidades/sede';

interface UseSenaEmpresas {
  senaEmpresas: SenaEmpresa[];
  senaEmpresasAsOptions: SedeOption[];
  isLoading: boolean;
  error: string | null;
}

export const useSenaEmpresas = (): UseSenaEmpresas => {
  const [senaEmpresas, setSenaEmpresas] = useState<SenaEmpresa[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSenaEmpresas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/empresas-sena/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Respuesta del servidor (sena empresas):', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 403) {
          setError('No tienes permisos para ver esta página. Debes ser administrador.');
        } else {
          const errorText = await response.text();
          setError(`Error ${response.status}: ${errorText}`);
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Datos de sena empresas:', data);
      const normalizedEmpresas = Array.isArray(data) ? data : data.results || [];
      setSenaEmpresas(normalizedEmpresas);
    } catch (err: any) {
      console.error('Error al cargar sena empresas:', err);
      setError(err.message || 'Error al cargar las empresas SENA.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSenaEmpresas();
  }, []);

  // Mapear a SedeOption para Sedes.tsx
  const senaEmpresasAsOptions: SedeOption[] = senaEmpresas.map((empresa) => ({
    id: empresa.id,
    nombre_display: empresa.nombre,
  }));

  return { senaEmpresas, senaEmpresasAsOptions, isLoading, error };
};