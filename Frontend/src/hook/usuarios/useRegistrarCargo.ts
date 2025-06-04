// src/hook/usuarios/useRegistrarCargo.ts
import { useState } from "react";

interface RegistrarCargoResponse {
  success: boolean;
  error: string | null;
  loading: boolean;
  registrarCargo: (nombre: string) => Promise<void>;
}

export const useRegistrarCargo = (url: string): RegistrarCargoResponse => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const registrarCargo = async (nombre: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const token = localStorage.getItem("token");
    console.log("Token al registrar cargo:", token);
    if (!token) {
      setError("Debes iniciar sesión para registrar un cargo.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
      });

      console.log("Respuesta del servidor (cargo):", response.status, response.statusText);

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json();
        setError(errorData[Object.keys(errorData)[0]] || "No se pudo registrar el cargo.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return { success, error, loading, registrarCargo };
};