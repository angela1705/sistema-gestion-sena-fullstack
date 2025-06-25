import { useState, useEffect } from "react";
import { useUsuarios } from "../../hook/usuarios/useUsuarios";
import { useProductos } from "../../hook/inventario/useProductos";
import { Reserva } from "../../types/gestion_operativa/reserva";

interface UseReservaResponse {
  reservas: Reserva[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useReserva = (apiUrl: string = "http://localhost:8000/api/reservas/"): UseReservaResponse => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { usuarios } = useUsuarios(); // Obtenemos usuarios para mapear
  const { productos } = useProductos(); // Obtenemos productos para mapear

  const fetchReservas = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      setLoading(false);
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
          throw new Error("No se encontraron las reservas. Verifica la URL de la API.");
        } else if (response.status === 403) {
          throw new Error("No tienes permisos para ver las reservas.");
        } else {
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log("Datos de la API (reservas):", data); // Depuración
      const reservasData = Array.isArray(data) ? data : (data.results || []);

      // Mapeamos las reservas para incluir nombres
      const enrichedReservas = reservasData.map((reserva: any) => {
        const persona = usuarios.find((u) => u.id === reserva.persona) || { first_name: 'Sin nombre' };
        const producto = productos.find((p) => p.id === reserva.producto) || { nombre: 'Sin producto' };
        return {
          ...reserva,
          persona_info: { first_name: persona.first_name },
          producto_info: { nombre: producto.nombre },
        };
      });

      setReservas(enrichedReservas);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al cargar las reservas.");
      console.error("Error fetching reservas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, [apiUrl]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    fetchReservas();
  };

  return { reservas, loading, error, refetch };
};