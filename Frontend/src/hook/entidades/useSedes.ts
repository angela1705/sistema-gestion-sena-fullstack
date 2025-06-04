// src/hook/sedes/useSedes.ts
import { useState, useEffect } from "react";
import { Sede } from "../../types/entidades/sede";

interface UseSedes {
  sedes: Sede[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export const useSedes = (url: string): UseSedes => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryFlag, setRetryFlag] = useState<number>(0);

  const fetchSedes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró el token de autenticación.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Respuesta del servidor (sedes):", response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 403) {
          setError("No tienes permisos para ver esta página. Debes ser administrador.");
        } else {
          setError(`Error ${response.status}: ${response.statusText}`);
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Datos de sedes:", data);
      setSedes(data);
    } catch (err: any) {
      console.error("Error al cargar sedes:", err);
      setError(err.message || "Error al cargar las sedes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, [url, retryFlag]);

  const retry = () => setRetryFlag((prev) => prev + 1);

  return { sedes, isLoading, error, retry };
};