import React, { Component, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import { useProductos } from "../../hook/inventario/useProductos";
import { Card, CardBody, CardFooter, Image } from "@heroui/react";
import { FaCheck } from "react-icons/fa";
import GlobalStyles from "../../components/global/GlobalStyles";

// Error Boundary para manejar errores en el componente
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: string | null }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Typography variant="body1" color="error">
          Error: {this.state.error || "Ocurrió un problema al cargar los productos."} Por favor, recarga la página.
        </Typography>
      );
    }
    return this.props.children;
  }
}

interface InicioProps {
  isNavbarOpen: boolean;
}

// Componente para obtener la URL de la API desde un contexto o configuración
const getApiUrl = () => {
  // Intenta usar process.env, pero con un fallback seguro
  if (typeof process !== "undefined" && process.env) {
    return process.env.REACT_APP_API_URL || "http://localhost:8000";
  }
  return "http://localhost:8000"; // Fallback seguro
};

const Inicio: React.FC<InicioProps> = ({ isNavbarOpen }) => {
  const { productos, loading, error } = useProductos();
  const apiUrl = getApiUrl();

  useEffect(() => {
    console.log("API URL usada:", apiUrl); // Depuración
    if (productos && productos.length > 0) {
      productos.forEach((producto) => {
        const imageSrc = producto.imagen_url ? `${apiUrl}${producto.imagen_url}` : "/static/images/placeholder.jpg";
        console.log(`Imagen para ${producto.nombre}: ${imageSrc}`); // Depuración de URLs
      });
    }
  }, [productos, apiUrl]);

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <Box
        className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
          isNavbarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* Sección de Productos más comprados */}
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

          {/* Cards de productos */}
          {loading && <Typography variant="body1">Cargando productos...</Typography>}
          {error && <Typography variant="body1" color="error">Error: {error}</Typography>}
          {!loading && !error && productos.length > 0 && (
            <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
              {productos.map((producto) => {
                const imageSrc = producto.imagen_url ?? "http://localhost:8000/static/placeholder.jpg";
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
                      <p className="text-default-500">${producto.precio_final || "N/A"}</p>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default Inicio;