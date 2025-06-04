// src/hook/senaEmpresas/useSenaEmpresas.ts
import { useState, useEffect } from "react";
import { SenaEmpresa } from "../../types/entidades/SenaEmpresa";

interface UseSenaEmpresas {
  senaEmpresas: SenaEmpresa[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export const useSenaEmpresas = (url: string): UseSenaEmpresas => {
  const [senaEmpresas, setSenaEmpresas] = useState<SenaEmpresa[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryFlag, setRetryFlag] = useState<number>(0);

  const fetchSenaEmpresas = async () => {
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

      console.log("Respuesta del servidor (sena empresas):", response.status, response.statusText);

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
      console.log("Datos de sena empresas:", data);
      setSenaEmpresas(data);
    } catch (err: any) {
      console.error("Error al cargar sena empresas:", err);
      setError(err.message || "Error al cargar las empresas SENA.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSenaEmpresas();
  }, [url, retryFlag]);

  const retry = () => setRetryFlag((prev) => prev + 1);

  return { senaEmpresas, isLoading, error, retry };
};