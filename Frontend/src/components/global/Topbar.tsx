// src/components/Global/Topbar.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const Topbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Eliminar el token de localStorage
    localStorage.removeItem("token");
    // Redirigir a la página de login
    navigate("/");
  };

  return (
    <header className="w-full h-16 bg-gray-800 text-white shadow-md fixed top-0 left-0 z-50 flex items-center px-4">
      <div className="flex-1 flex justify-between items-center">
        {/* Espacio vacío a la izquierda por ahora */}
        <span></span>
        {/* Botón de Cerrar Sesión */}
        <Button
          variant="outlined"
          sx={{ color: "white", borderColor: "white" }}
          onClick={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
};

export default Topbar;