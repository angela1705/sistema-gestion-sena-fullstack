import React, { useState, useEffect, Component } from "react";
import { Typography, Box } from "@mui/material";
import { useProductos } from "../../hook/inventario/useProductos";
import { Card, CardBody, CardFooter, Image, Button, Input } from "@nextui-org/react";
import { FaCheck } from "react-icons/fa";
import GlobalStyles from "../../components/global/GlobalStyles";
import { useRegistrarReserva } from "../../hook/gestion_operativa/useRegistrarReserva";
import { useUsuarios } from "../../hook/usuarios/useUsuarios";

// Error Boundary para manejar errores
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: string | null }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Typography variant="body1" color="error">
          Error: {this.state.error || "Ocurrió un problema."} Por favor, recarga la página.
        </Typography>
      );
    }
    return this.props.children;
  }
}

interface InicioProps {
  isNavbarOpen: boolean;
}

const getApiUrl = () => {
  if (typeof process !== "undefined" && process.env) {
    return process.env.REACT_APP_API_URL || "http://localhost:8000";
  }
  return "http://localhost:8000";
};

const Inicio: React.FC<InicioProps> = ({ isNavbarOpen }) => {
  const { productos, loading, error: productosError } = useProductos();
  const { registrarReserva, loading: registerLoading, error: registerError } = useRegistrarReserva();
  const { usuarios, loading: usuariosLoading, error: usuariosError } = useUsuarios();
  const apiUrl = getApiUrl();
  const token = localStorage.getItem("token");
  const [cantidad, setCantidad] = useState<{ [key: number]: number | string | undefined }>({}); // Permitimos string para el input

  const getCurrentUserId = () => {
    if (!token) {
      console.warn("No hay token disponible.");
      return null;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.user_id || payload.id || payload.sub;
      console.log("ID de usuario decodificado:", userId);
      return userId;
    } catch (e) {
      console.error("Error decodificando token:", e);
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    console.log("API URL usada:", apiUrl);
    if (productos && productos.length > 0) {
      productos.forEach((producto) => {
        const imageSrc = producto.imagen_url ?? "http://localhost:8000/static/placeholder.jpg"; // Lógica original
        console.log(`Imagen para ${producto.nombre}: ${imageSrc}`);
      });
    } else {
      console.log("No hay productos para procesar.");
    }
  }, [productos, apiUrl]);

  const handleReservar = async (productoId: number, cantidadValue: number | string | undefined) => {
    if (!currentUserId) {
      alert("Debes estar autenticado para reservar.");
      return;
    }

    const cantidadToUse = typeof cantidadValue === "string" ? parseInt(cantidadValue) || 1 : cantidadValue || 1;
    if (cantidadToUse <= 0) {
      alert("Por favor, ingresa una cantidad válida mayor a 0.");
      return;
    }

    try {
      await registrarReserva({
        persona: currentUserId,
        producto: productoId,
        cantidad: cantidadToUse,
      });
      alert("Reserva realizada con éxito!");
      setCantidad((prev) => ({ ...prev, [productoId]: undefined }));
    } catch (err) {
      console.error("Error al reservar:", err);
      alert("Error al realizar la reserva. Verifica los datos o intenta de nuevo.");
    }
  };

  const handleCantidadChange = (productoId: number, value: string) => {
    console.log(`Cambiando cantidad para producto ${productoId}:`, value); // Depuración
    setCantidad((prev) => ({ ...prev, [productoId]: value })); // Guardamos como string
  };

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <Box
        className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
          isNavbarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <Box sx={{ padding: "55px", maxWidth: "5xl", margin: "0 auto" }}>
          <div
            className="relative my-8"
            style={{
              backgroundColor: "#1B2433",
              height: "60px",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ borderTop: "2px solid #1B2433", borderBottom: "2px solid #1B2433" }}
            >
              <FaCheck style={{ color: "#00C4CC", marginRight: "8px" }} />
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  display: "inline",
                }}
              >
                Productos más comprados
              </Typography>
            </div>
          </div>

          {loading && <Typography variant="body1">Cargando productos...</Typography>}
          {productosError && <Typography variant="body1" color="error">Error al cargar productos: {productosError}</Typography>}
          {!loading && !productosError && productos.length === 0 && (
            <Typography variant="body1" color="textSecondary">
              No hay productos disponibles para mostrar.
            </Typography>
          )}
          {!loading && !productosError && productos.length > 0 && (
            <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
              {productos.map((producto) => {
                const imageSrc = producto.imagen_url ?? "http://localhost:8000/static/placeholder.jpg"; // Lógica original
                return (
                  <Card key={producto.id} isPressable shadow="sm" onPress={() => console.log("item pressed")}>
                    <CardBody className="overflow-visible p-0">
                      <Image
                        alt={producto.nombre}
                        className="w-full object-cover h-[140px]"
                        radius="lg"
                        shadow="sm"
                        src={imageSrc}
                        width="100%"
                      />
                    </CardBody>
                    <CardFooter className="text-small justify-between">
                      <b>{producto.nombre}</b>
                      <div className="flex flex-col items-end gap-1">
                        <Button
                          color="primary"
                          size="sm"
                          onPress={() => handleReservar(producto.id, cantidad[producto.id])}
                          isLoading={registerLoading}
                          disabled={!currentUserId || registerLoading || usuariosLoading}
                        >
                          ${producto.precio_final || "N/A"} Reservar
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={cantidad[producto.id] ? cantidad[producto.id].toString() : ""}
                          onChange={(e) => handleCantidadChange(producto.id, e.target.value)}
                          placeholder="Cantidad"
                          size="sm"
                          className="w-20 mt-1"
                          isDisabled={registerLoading || usuariosLoading}
                        />
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
          {registerError && <Typography variant="body1" color="error">Error al reservar: {registerError}</Typography>}
          {usuariosError && <Typography variant="body1" color="error">Error al cargar usuarios: {usuariosError}</Typography>}
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default Inicio;