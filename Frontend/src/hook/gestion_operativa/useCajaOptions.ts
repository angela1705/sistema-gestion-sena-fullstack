
// src/hooks/gestion_operaciones/useCajaOptions.ts
import { useState, useEffect } from "react";
import { CajaDiaria } from "../../types/gestion_operativa/detalle_caja";

export const useCajaOptions = () => {
  const [cajas, setCajas] = useState<CajaDiaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCajas = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/cajaDiaria/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener cajas");

      const data = await response.json();
      console.log("Respuesta de API cajaDiaria:", data);
      const cajasArray = Array.isArray(data) ? data : (data.results || data.data || []);
      setCajas(cajasArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCajas();
  }, []);

  return { cajas, loading, error };
};