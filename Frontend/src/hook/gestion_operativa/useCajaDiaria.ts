
// src/hooks/gestion_operaciones/useCajaDiaria.ts
import { useState, useEffect } from "react";
import { CajaDiaria } from "../../types/gestion_operativa/caja_diaria";

export const useCajaDiaria = () => {
  const [cajas, setCajas] = useState<CajaDiaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCajas = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      const response = await fetch("http://localhost:8000/api/cajaDiaria/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      // Ajuste: Si la API devuelve { results: CajaDiaria[] }, usamos data.results
      const cajasData = Array.isArray(data) ? data : data.results || data;
      setCajas(cajasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error fetching cajas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCajas();
  }, []);

  return { cajas, loading, error, refetch: fetchCajas };
};