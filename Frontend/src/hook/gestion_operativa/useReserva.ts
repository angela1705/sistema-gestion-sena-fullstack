
// src/hooks/gestion_operaciones/useReserva.ts
import { useState, useEffect } from "react";
import { Reserva } from "../../types/gestion_operativa/reserva";

export const useReserva = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      const response = await fetch("http://localhost:8000/api/reservas/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      // Ajuste: Si la API devuelve { results: Reserva[] }, usamos data.results
      const reservasData = Array.isArray(data) ? data : data.results || data;
      setReservas(reservasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error fetching reservas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return { reservas, loading, error, refetch: fetchReservas };
};