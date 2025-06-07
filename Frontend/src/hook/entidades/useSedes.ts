import { useState, useEffect } from "react";
import { Sede } from "../../types/entidades/sede";

export const useSedes = () => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSedes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/sedes/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener sedes");

      const data = await response.json();
      setSedes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  return { sedes, loading, error, refetch: fetchSedes };
};