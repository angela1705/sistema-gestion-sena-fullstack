// src/pages/usuarios/Usuarios.tsx
import React, { useEffect } from "react";
import { useUsuarios } from "../../hook/usuarios/useUsuarios";
import { Button, Card, CardBody } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import Tabla from "../../components/global/Tabla";
import { FaPlus } from "react-icons/fa";

interface UsuariosProps {
  isNavbarOpen: boolean;
}

const columns = [
  { uid: "identificacion", name: "Identificación" },
  { uid: "first_name", name: "Nombre" },
  { uid: "last_name", name: "Apellido" },
  { uid: "email", name: "Correo Electrónico" },
  { uid: "telefono", name: "Teléfono" },
  { uid: "rol_nombre", name: "Rol" },
  { uid: "cargo_nombre", name: "Cargo" },
  { uid: "sede_nombre", name: "Sede" },
  { uid: "numFicha", name: "Número de Ficha" },
];

const searchableFields = ["first_name", "last_name", "identificacion"];

const Usuarios: React.FC<UsuariosProps> = ({ isNavbarOpen }) => {
  const { usuarios, isLoading, error, retry } = useUsuarios("http://localhost:8000/api/personas/");
  const navigate = useNavigate();

  useEffect(() => {
    if (error === "No tienes permisos para ver esta página. Debes ser administrador.") {
      navigate("/login");
    }
  }, [error, navigate]);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
        isNavbarOpen ? "ml-64" : "ml-16"
      } flex items-center justify-center`}
    >
      <Card className="w-full max-w-5xl">
        <CardBody className="flex flex-col p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Lista de Usuarios</h1>
          <Tabla
            columns={columns}
            data={usuarios}
            searchableFields={searchableFields}
            extraControls={
              <div className="flex items-center gap-4">
                <Button
                  color="primary"
                  onPress={() => navigate("/usuarios/registrar")}
                  startContent={<FaPlus />}
                >
                  Registrar
                </Button>
              </div>
            }
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default Usuarios;