import { useState, useEffect } from "react";
import { Persona } from "../../types/usuarios/usuarios";
import { useNavigate } from "react-router-dom";

interface UseUsuariosResponse {
  usuarios: Persona[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export const useUsuarios = (apiUrl: string = "http://localhost:8000/api/personas/"): UseUsuariosResponse => {
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
        const errorText = await response.text();
        if (response.status === 404) {
          throw new Error("No se encontró la lista de usuarios. Verifica que la URL de la API sea correcta.");
        } else if (response.status === 403) {
          throw new Error("No tienes permisos para ver esta página. Debes ser administrador.");
        } else {
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log("Datos de la API (usuarios):", data); // Depuración
      const usuariosData = Array.isArray(data) ? data : (data.results || []); // Manejo de paginación
      if (!Array.isArray(usuariosData)) {
        throw new Error("La respuesta de la API no contiene un arreglo de usuarios.");
      }
      setUsuarios(usuariosData); // Mantiene los datos originales
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al cargar los usuarios.");
      console.error("Error fetching usuarios:", err);
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