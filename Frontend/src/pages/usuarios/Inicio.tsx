// src/pages/Inicio.tsx
import React from "react";
import { Typography, Box } from "@mui/material";

const Inicio: React.FC = () => {
  return (
    <Box sx={{ padding: "50px", textAlign: "center" }}>
      <Typography variant="h3" gutterBottom>
        Bienvenido a la Página de Inicio
      </Typography>
      <Typography variant="body1">
        Este es el dashboard principal. Aquí puedes agregar más contenido según tus necesidades.
      </Typography>
    </Box>
  );
};

export default Inicio;