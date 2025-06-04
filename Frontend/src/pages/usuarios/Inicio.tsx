// src/pages/usuarios/Inicio.tsx
import React from "react";
import { Typography, Box } from "@mui/material";

interface InicioProps {
  isNavbarOpen: boolean;
}

const Inicio: React.FC<InicioProps> = ({ isNavbarOpen }) => {
  return (
    <Box
      className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
        isNavbarOpen ? "ml-64" : "ml-16"
      }`}
    >
      <Box sx={{ padding: "50px", textAlign: "center", maxWidth: "5xl", margin: "0 auto" }}>
        <Typography variant="h3" gutterBottom>
          Bienvenido a la Página de Inicio
        </Typography>
        <Typography variant="body1">
          Este es el dashboard principal. Aquí puedes agregar más contenido según tus necesidades.
        </Typography>
      </Box>
    </Box>
  );
};

export default Inicio;