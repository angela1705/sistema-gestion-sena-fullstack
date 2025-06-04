// src/hook/sedes/useRegistrarSede.ts
import { useState } from "react";

interface UseRegistrarSede {
  success: boolean;
  error: string | null;
  loading: boolean;
  registrarSede: (data: any) => Promise<void>;
  reset: () => void;
}

export const useRegistrarSede = (url: string): UseRegistrarSede => {
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const registrarSede = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    console.log("Enviando datos para registrar sede:", data);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No se encontró el token de autenticación.");
        setLoading(false);
        console.log("Error: Token no encontrado.");
        return;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log("Respuesta del servidor (registrar sede):", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Datos del error:", errorData);
        setError(errorData.detail || JSON.stringify(errorData) || `Error ${response.status}: ${response.statusText}`);
        setLoading(false);
        return;
      }

      setSuccess(true);
      console.log("Registro exitoso de sede.");
    } catch (err: any) {
      console.error("Error al registrar sede:", err);
      setError(err.message || "Error al registrar la sede.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setError(null);
    setLoading(false);
  };

  return { success, error, loading, registrarSede, reset };
};