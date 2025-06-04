// src/hook/usuarios/useRegistrarUsuario.ts
import { useState } from "react";

interface RegistrarUsuarioResponse {
  success: boolean;
  error: string | null;
  loading: boolean;
  registrarUsuario: (data: any) => Promise<void>;
}

export const useRegistrarUsuario = (url: string): RegistrarUsuarioResponse => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const registrarUsuario = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const token = localStorage.getItem("token"); // Cambiado de "access_token" a "token"
    console.log("Token al registrar usuario:", token); // Depuración
    if (!token) {
      setError("Debes iniciar sesión para registrar un usuario.");
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
        body: JSON.stringify(data),
      });

      console.log("Respuesta del servidor (usuario):", response.status, response.statusText); // Depuración

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json();
        setError(errorData[Object.keys(errorData)[0]] || "No se pudo registrar el usuario.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return { success, error, loading, registrarUsuario };
};