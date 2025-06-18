
import { useState } from 'react';
import { Persona } from '../../types/usuarios/usuarios';

interface UseUpdateProfilePhotoResponse {
  updatePhoto: (file: File, userId: number) => Promise<Persona | null>;
  isLoading: boolean;
  error: string | null;
}

export const useUpdateProfilePhoto = (): UseUpdateProfilePhotoResponse => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePhoto = async (file: File, userId: number): Promise<Persona | null> => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No estás autenticado.');
      setIsLoading(false);
      return null;
    }

    const formData = new FormData();
    formData.append('foto', file);

    try {
      const response = await fetch(`http://localhost:8000/api/personas/${userId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }

      const data: Persona = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la foto.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updatePhoto, isLoading, error };
};