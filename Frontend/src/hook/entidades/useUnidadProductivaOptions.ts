// src/hooks/entidades/useUnidadProductivaOptions.ts
import { useState, useEffect } from "react";
import { SedeOption, EncargadoOption } from "../../types/entidades/Options";

export const useUnidadProductivaOptions = () => {
  const [sedes, setSedes] = useState<SedeOption[]>([]);
  const [encargados, setEncargados] = useState<EncargadoOption[]>([]);
  const [tipos, setTipos] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem("token");
        // Fetch sedes
        const sedesResponse = await fetch("http://localhost:8000/api/sedes/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!sedesResponse.ok) throw new Error("Error al obtener sedes");
        const sedesData = await sedesResponse.json();
        const normalizedSedes = (Array.isArray(sedesData) ? sedesData : sedesData.results || []).map(
          (sede: any) => ({
            id: sede.id,
            nombre_display: sede.nombre_display,
          })
        );
        setSedes(normalizedSedes);

        // Fetch encargados
        const encargadosResponse = await fetch("http://localhost:8000/api/personas/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!encargadosResponse.ok) throw new Error("Error al obtener encargados");
        const encargadosData = await encargadosResponse.json();
        const normalizedEncargados = (Array.isArray(encargadosData) ? encargadosData : encargadosData.results || []).map(
          (persona: any) => ({
            id: persona.id,
            nombre_completo: `${persona.first_name} ${persona.last_name}`,
          })
        );
        setEncargados(normalizedEncargados);

        // Fetch tipos
        const tiposResponse = await fetch("http://localhost:8000/api/unidad-productiva/opciones/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!tiposResponse.ok) throw new Error("Error al obtener opciones de tipos");
        const tiposData = await tiposResponse.json();
        const tipoOptions = Object.entries(tiposData.tipos).map(([value, label]) => ({
          value,
          label: label as string,
        }));
        setTipos(tipoOptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { sedes, encargados, tipos, loading, error };
};