
import React from "react";
import { Typography, Box } from "@mui/material";
import { useProductos } from "../../hook/inventario/useProductos";
import { Card, CardBody, CardFooter, Image } from "@heroui/react";
import { FaCheck } from "react-icons/fa";
import GlobalStyles from "../../components/global/GlobalStyles";

interface InicioProps {
  isNavbarOpen: boolean;
}

const Inicio: React.FC<InicioProps> = ({ isNavbarOpen }) => {
  const { productos, loading, error } = useProductos();

  return (
    <>
      <GlobalStyles />
      <Box
        className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
          isNavbarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* Sección de Productos más comprados */}
        <Box sx={{ padding: "45px", maxWidth: "5xl", margin: "0 auto" }}>
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
              {productos.map((producto) => (
                <Card key={producto.id} isPressable shadow="sm" onPress={() => console.log("item pressed")}>
                  <CardBody className="overflow-visible p-0">
                    <Image
                      alt={producto.nombre}
                      className="w-full object-cover h-[140px]"
                      radius="lg"
                      shadow="sm"
                      src={producto.imagen_url} // Asegúrate de que 'imagen' sea la URL correcta
                      width="100%"
                    />
                  </CardBody>
                  <CardFooter className="text-small justify-between">
                    <b>{producto.nombre}</b>
                    <p className="text-default-500">${producto.precio_final || "N/A"}</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Inicio;