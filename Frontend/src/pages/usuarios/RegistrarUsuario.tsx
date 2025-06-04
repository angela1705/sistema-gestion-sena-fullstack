// src/pages/usuarios/RegistrarUsuario.tsx
import React from "react";
import RegistrarUsuarioForm from "../../components/usuarios/RegistrarUsuarioForm";

interface RegistrarUsuarioProps {
  isNavbarOpen: boolean;
}

const RegistrarUsuario: React.FC<RegistrarUsuarioProps> = ({ isNavbarOpen }) => {
  return <RegistrarUsuarioForm isNavbarOpen={isNavbarOpen} />;
};

export default RegistrarUsuario;