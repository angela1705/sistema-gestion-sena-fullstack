// src/hook/usuarios/useRegistrarRol.ts
import { useState } from "react";

interface RegistrarRolResponse {
  success: boolean;
  error: string | null;
  loading: boolean;
  registrarRol: (nombre: string) => Promise<void>;
}

export const useRegistrarRol = (url: string): RegistrarRolResponse => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const registrarRol = async (nombre: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const token = localStorage.getItem("token");
    console.log("Token al registrar rol:", token);
    if (!token) {
      setError("Debes iniciar sesión para registrar un rol.");
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

      console.log("Respuesta del servidor (rol):", response.status, response.statusText);

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json();
        setError(errorData[Object.keys(errorData)[0]] || "No se pudo registrar el rol.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return { success, error, loading, registrarRol };
};