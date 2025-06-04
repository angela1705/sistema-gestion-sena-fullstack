// src/hook/sedes/useSedeOptions.ts
import { useState, useEffect } from "react";

interface SenaEmpresaOption {
  id: number;
  nombre: string;
}

interface UseSedeOptions {
  nombreOptions: { [key: string]: string };
  senaEmpresas: SenaEmpresaOption[];
  isLoading: boolean;
  error: string | null;
}

export const useSedeOptions = (): UseSedeOptions => {
  const [nombreOptions, setNombreOptions] = useState<{ [key: string]: string }>({
    centro: "Centro",
    yamboro: "Yamboro",
  });
  const [senaEmpresas, setSenaEmpresas] = useState<SenaEmpresaOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Iniciar como true para mostrar carga inicial
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró el token de autenticación.");
        setIsLoading(false);
        console.log("Error: Token no encontrado.");
        return;
      }

      try {
        const empresasResponse = await fetch("http://localhost:8000/api/empresas-sena/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Respuesta cruda de empresas:", empresasResponse);

        if (!empresasResponse.ok) {
          throw new Error(`Error al cargar empresas SENA: ${empresasResponse.statusText}`);
        }

        const empresasData = await empresasResponse.json();
        console.log("Datos de empresas SENA recibidos:", empresasData);
        setSenaEmpresas(empresasData);
      } catch (err: any) {
        console.error("Error al cargar opciones:", err);
        setError(err.message || "Error al cargar las opciones.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { nombreOptions, senaEmpresas, isLoading, error };
};