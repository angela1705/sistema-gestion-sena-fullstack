// src/pages/entidades/Sedes.tsx
import React, { useEffect, useState } from "react";
import { useSedes } from "../../hook/entidades/useSedes";
import { useRegistrarSede } from "../../hook/entidades/useRegistrarSede";
import { useSedeOptions } from "../../hook/entidades//useSedeOptions";
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
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import Tabla from "../../components/global/Tabla";
import { FaPlus } from "react-icons/fa";

interface SedesProps {
  isNavbarOpen: boolean;
}

const columns = [
  { uid: "nombre_display", name: "Nombre" },
  { uid: "sena_empresa_info.nombre", name: "Sena Empresa" },
  { uid: "direccion", name: "Dirección" },
  { uid: "telefono", name: "Teléfono" },
  { uid: "responsable", name: "Responsable" },
  { uid: "activa", name: "Activa" },
  { uid: "fecha_creacion", name: "Fecha de Creación" },
];

const searchableFields = ["nombre_display", "direccion", "responsable"];

const Sedes: React.FC<SedesProps> = ({ isNavbarOpen }) => {
  const { sedes, isLoading, error: fetchError, retry } = useSedes("http://localhost:8000/api/sedes/");
  const {
    success,
    error: registerError,
    loading: registerLoading,
    registrarSede,
    reset,
  } = useRegistrarSede("http://localhost:8000/api/sedes/");
  const { nombreOptions, senaEmpresas, isLoading: optionsLoading, error: optionsError } = useSedeOptions();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    sena_empresa: "",
    direccion: "",
    telefono: "",
    responsable: "",
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
        sena_empresa: "",
        direccion: "",
        telefono: "",
        responsable: "",
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, activa: checked }));
  };

  const handleSubmit = async () => {
    const payload = {
      nombre: formData.nombre,
      sena_empresa: parseInt(formData.sena_empresa),
      direccion: formData.direccion,
      telefono: formData.telefono,
      responsable: formData.responsable,
      activa: formData.activa,
    };

    console.log("Payload enviado:", payload);
    await registrarSede(payload);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({
      nombre: "",
      sena_empresa: "",
      direccion: "",
      telefono: "",
      responsable: "",
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Lista de Sedes</h1>
          {isLoading && <p className="text-gray-500">Cargando sedes...</p>}
          {fetchError && <p className="text-red-500 mb-4">{fetchError}</p>}
          {sedes.length === 0 && !isLoading && !fetchError && (
            <p className="text-gray-500 mb-4">No hay sedes para mostrar.</p>
          )}
          <Tabla
            columns={columns}
            data={sedes}
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
          <ModalHeader>Registrar Nueva Sede</ModalHeader>
          <ModalBody>
            {optionsLoading && <p className="text-gray-500">Cargando opciones...</p>}
            {optionsError && <p className="text-red-500 mb-4">{optionsError}</p>}
            {registerError && <p className="text-red-500 mb-4">{registerError}</p>}
            <div className="grid grid-cols-1 gap-4">
              <Select
                name="nombre"
                label="Nombre de la Sede"
                placeholder="Seleccione un nombre"
                selectedKeys={formData.nombre ? [formData.nombre] : []}
                onChange={(e) => handleSelectChange("nombre", e.target.value)}
                isRequired
              >
                {Object.entries(nombreOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </Select>
              <Select
                name="sena_empresa"
                label="Sena Empresa"
                placeholder="Seleccione una empresa"
                selectedKeys={formData.sena_empresa ? [formData.sena_empresa] : []}
                onChange={(e) => handleSelectChange("sena_empresa", e.target.value)}
                isRequired
              >
                {senaEmpresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id.toString()}>
                    {empresa.nombre}
                  </SelectItem>
                ))}
              </Select>
              <Input
                name="direccion"
                label="Dirección"
                value={formData.direccion}
                onChange={handleInputChange}
                isRequired
              />
              <Input
                name="telefono"
                label="Teléfono"
                value={formData.telefono}
                onChange={handleInputChange}
                isRequired
              />
              <Input
                name="responsable"
                label="Responsable"
                value={formData.responsable}
                onChange={handleInputChange}
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
              isDisabled={registerLoading || optionsLoading}
            >
              {registerLoading ? "Guardando..." : "Registrar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Sedes;