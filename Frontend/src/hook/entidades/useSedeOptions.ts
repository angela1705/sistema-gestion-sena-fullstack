// src/hooks/entidades/useSedeOptions.ts
import { useState, useEffect } from "react";

export const useSedeOptions = () => {
  const [senaEmpresas, setSenaEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresas = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token para /api/empresas-sena/:", token);
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch("http://localhost:8000/api/empresas-sena/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status /api/empresas-sena/:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Datos de /api/empresas-sena/:", JSON.stringify(data, null, 2));

      // Normalizar datos: extraer results si es un objeto paginado
      const normalizedData = Array.isArray(data) ? data : data.results || [];
      if (!Array.isArray(normalizedData)) {
        console.error("Formato de datos inválido, recibido:", JSON.stringify(data, null, 2));
        throw new Error("Formato de datos inválido");
      }

      setSenaEmpresas(normalizedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error("Error al obtener empresas:", errorMessage);
      setError(errorMessage);
      setSenaEmpresas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return { senaEmpresas, loading, error, refetch: fetchEmpresas };
};