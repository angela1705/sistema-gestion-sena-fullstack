// src/hooks/usuarios/useUsuarios.ts
import { useState, useEffect } from "react";
import { Persona } from "../../types/usuarios/usuarios";
import { useNavigate } from "react-router-dom";

interface UseUsuariosResponse {
  usuarios: Persona[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export const useUsuarios = (apiUrl: string = "http://localhost:8000/api/usuarios/"): UseUsuariosResponse => {
  const [usuarios, setUsuarios] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUsuarios = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      setError("No estás autenticado. Por favor, inicia sesión.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "No se encontró la lista de usuarios. Verifica que la URL de la API sea correcta (actual: " + apiUrl + ")."
          );
        } else if (response.status === 403) {
          throw new Error("No tienes permisos para ver esta página. Debes ser administrador.");
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }

      const data: Persona[] = await response.json();
      setUsuarios(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al cargar los usuarios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [apiUrl, navigate]);

  const retry = () => {
    setIsLoading(true);
    setError(null);
    fetchUsuarios();
  };

  return { usuarios, isLoading, error, retry };
};