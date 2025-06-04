// src/pages/entidades/SenaEmpresas.tsx
import React, { useEffect, useState } from "react";
import { useSenaEmpresas } from "../../hook//entidades/useSenaEmpresas";
import { useRegistrarSenaEmpresa } from "../../hook/entidades/useRegistrarSenaEmpresa";
import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Switch,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import Tabla from "../../components/global/Tabla";
import { FaPlus } from "react-icons/fa";

interface SenaEmpresasProps {
  isNavbarOpen: boolean;
}

const columns = [
  { uid: "nombre", name: "Nombre" },
  { uid: "nit", name: "NIT" },
  { uid: "direccion_principal", name: "Dirección Principal" },
  { uid: "telefono_contacto", name: "Teléfono" },
  { uid: "email_contacto", name: "Correo" },
  { uid: "activa", name: "Activa" },
  { uid: "fecha_creacion", name: "Fecha de Creación" },
];

const searchableFields = ["nombre", "nit", "direccion_principal"];

const SenaEmpresas: React.FC<SenaEmpresasProps> = ({ isNavbarOpen }) => {
  const { senaEmpresas, isLoading, error: fetchError, retry } = useSenaEmpresas(
    "http://localhost:8000/api/empresas-sena/"
  );
  const {
    success,
    error: registerError,
    loading: registerLoading,
    registrarSenaEmpresa,
    reset,
  } = useRegistrarSenaEmpresa("http://localhost:8000/api/empresas-sena/");
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    direccion_principal: "",
    telefono_contacto: "",
    email_contacto: "",
    activa: true,
  });

  // Manejar errores de permisos y redirección
  useEffect(() => {
    if (fetchError === "No tienes permisos para ver esta página. Debes ser administrador.") {
      navigate("/login");
    }
  }, [fetchError, navigate]);

  // Manejar registro exitoso
  useEffect(() => {
    if (success) {
      setIsModalOpen(false);
      setFormData({
        nombre: "",
        nit: "",
        direccion_principal: "",
        telefono_contacto: "",
        email_contacto: "",
        activa: true,
      });
      reset();
      retry(); // Actualizar la tabla
    }
  }, [success, reset, retry]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, activa: checked }));
  };

  const handleSubmit = async () => {
    const payload = {
      nombre: formData.nombre,
      nit: formData.nit,
      direccion_principal: formData.direccion_principal,
      telefono_contacto: formData.telefono_contacto,
      email_contacto: formData.email_contacto,
      activa: formData.activa,
    };

    console.log("Payload enviado:", payload);
    await registrarSenaEmpresa(payload);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({
      nombre: "",
      nit: "",
      direccion_principal: "",
      telefono_contacto: "",
      email_contacto: "",
      activa: true,
    });
    reset();
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
        isNavbarOpen ? "ml-64" : "ml-16"
      } flex items-center justify-center`}
    >
      <Card className="w-full max-w-5xl">
        <CardBody className="flex flex-col p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Lista de Empresas SENA</h1>
          {isLoading && <p className="text-gray-500">Cargando empresas SENA...</p>}
          {fetchError && <p className="text-red-500 mb-4">{fetchError}</p>}
          {senaEmpresas.length === 0 && !isLoading && !fetchError && (
            <p className="text-gray-500 mb-4">No hay empresas SENA para mostrar.</p>
          )}
          <Tabla
            columns={columns}
            data={senaEmpresas}
            searchableFields={searchableFields}
            extraControls={
              <div className="flex items-center gap-4">
                <Button
                  color="primary"
                  onPress={() => setIsModalOpen(true)}
                  startContent={<FaPlus />}
                >
                  Registrar
                </Button>
              </div>
            }
          />
        </CardBody>
      </Card>

      {/* Modal para el formulario */}
      <Modal isOpen={isModalOpen} onClose={handleCancel} placement="center">
        <ModalContent>
          <ModalHeader>Registrar Nueva Empresa SENA</ModalHeader>
          <ModalBody>
            {registerError && <p className="text-red-500 mb-4">{registerError}</p>}
            <div className="grid grid-cols-1 gap-4">
              <Input
                name="nombre"
                label="Nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                isRequired
              />
              <Input
                name="nit"
                label="NIT"
                value={formData.nit}
                onChange={handleInputChange}
                isRequired
              />
              <Input
                name="direccion_principal"
                label="Dirección Principal"
                value={formData.direccion_principal}
                onChange={handleInputChange}
                isRequired
              />
              <Input
                name="telefono_contacto"
                label="Teléfono"
                value={formData.telefono_contacto}
                onChange={handleInputChange}
                isRequired
              />
              <Input
                name="email_contacto"
                label="Correo Electrónico"
                type="email"
                value={formData.email_contacto}
                onChange={handleInputChange}
                isRequired
              />
              <div className="flex items-center gap-2">
                <Switch
                  isSelected={formData.activa}
                  onValueChange={handleSwitchChange}
                />
                <span>Activa</span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleCancel}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isDisabled={registerLoading}
            >
              {registerLoading ? "Guardando..." : "Registrar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SenaEmpresas;