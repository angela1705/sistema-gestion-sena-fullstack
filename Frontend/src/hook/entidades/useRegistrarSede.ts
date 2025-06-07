import { useState } from "react";
import { SedeFormData } from "../../types/entidades/sede";

export const useRegistrarSede = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrarSede = async (formData: SedeFormData) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No autenticado");

      const payload = {
        nombre: formData.nombre,
        sena_empresa: parseInt(formData.sena_empresa),
        direccion: formData.direccion,
        telefono: formData.telefono,
        responsable: formData.responsable,
        activa: formData.activa,
      };

      const response = await fetch("http://localhost:8000/api/sedes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.nombre?.[0] || 
          errorData.sena_empresa?.[0] || 
          "Error al registrar sede"
        );
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { registrarSede, loading, error };
};