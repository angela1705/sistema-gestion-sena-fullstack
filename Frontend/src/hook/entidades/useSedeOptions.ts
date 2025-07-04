
// src/hook/entidades/useSedeOptions.ts
import { useState, useEffect } from 'react';
import { SedeOption, EncargadoOption } from '../../types/entidades/Options';

export const useSedeOptions = () => {
  const [sedes, setSedes] = useState<SedeOption[]>([]);
  const [encargados, setEncargados] = useState<EncargadoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No se encontró el token de autenticación');

        // Obtener sedes
        const sedesResponse = await fetch('http://localhost:8000/api/sedes/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!sedesResponse.ok) throw new Error('Error al obtener sedes');
        const sedesData = await sedesResponse.json();
        console.log('Respuesta de /api/sedes/:', sedesData);
        const normalizedSedes = Array.isArray(sedesData) ? sedesData : sedesData.results || [];
        setSedes(
          normalizedSedes.map((sede: any) => ({
            id: sede.id,
            nombre_display: sede.nombre,
          }))
        );

        // Obtener encargados
        const encargadosResponse = await fetch('http://localhost:8000/api/personas/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!encargadosResponse.ok) throw new Error('Error al obtener encargados');
        const encargadosData = await encargadosResponse.json();
        console.log('Respuesta de /api/personas/:', encargadosData);
        const normalizedEncargados = Array.isArray(encargadosData) ? encargadosData : encargadosData.results || [];
        setEncargados(
          normalizedEncargados.map((persona: any) => ({
            id: persona.id,
            nombre_completo: `${persona.first_name} ${persona.last_name}`,
          }))
        );
      } catch (err) {
        console.error('Error en useSedeOptions:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setSedes([]);
        setEncargados([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  return { sedes, encargados, loading, error };
};