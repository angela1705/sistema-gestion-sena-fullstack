// src/pages/entidades/Sedes.tsx
import  { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus } from 'react-icons/fa';
import { useSedes } from '../../hook/entidades/useSedes';
import { useRegistrarSede } from '../../hook/entidades/useRegistrarSede';
import { useSedeOptions } from '../../hook/entidades/useSedeOptions';
import { SedeForm } from '../../components/entidades/SedeForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import Tabla from '../../components/global/Tabla';

const columns = [
  { uid: "nombre_display", name: "Nombre" },
  { 
    uid: "sena_empresa", 
    name: "Empresa SENA", 
    render: (data: any, row: any, senaEmpresas: any[]) => {
      console.log('Render sena_empresa:', { data, row, senaEmpresas }); // Para depuración
      // Si data es un objeto (sena_empresa_info), usamos su campo nombre
      if (data && typeof data === 'object' && data.nombre) {
        return data.nombre;
      }
      // Como respaldo, buscamos en senaEmpresas si data es un ID
      const empresa = senaEmpresas?.find((emp) => emp?.id === parseInt(data));
      return empresa ? empresa.nombre : "Sin empresa";
    }
  },
  { uid: "direccion", name: "Dirección" },
  { uid: "telefono", name: "Teléfono" },
  { uid: "responsable", name: "Responsable" },
  { uid: "activa", name: "Activa" },
];

const searchableFields = ["nombre_display", "direccion", "responsable"];

export default function Sedes({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { sedes, loading: sedesLoading, error: sedesError, refetch } = useSedes();
  const { registrarSede, loading: registerLoading, error: registerError } = useRegistrarSede();
  const { senaEmpresas, loading: empresasLoading, error: empresasError } = useSedeOptions();

  console.log('Estado de sedes:', { sedes, sedesLoading, sedesError });
  console.log('Estado de empresas:', { senaEmpresas, empresasLoading, empresasError });

  const [formData, setFormData] = useState({
    nombre: "",
    sena_empresa: "",
    direccion: "",
    telefono: "",
    responsable: "",
    activa: true,
  });

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await registrarSede(formData);
      setIsModalOpen(false);
      setFormData({
        nombre: "",
        sena_empresa: "",
        direccion: "",
        telefono: "",
        responsable: "",
        activa: true,
      });
      refetch();
    } catch (err) {
      console.error("Error al registrar sede:", err);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${isNavbarOpen ? "ml-64" : "ml-16"} flex items-center justify-center`}>
      <Card className="w-full max-w-5xl">
        <CardBody className="flex flex-col p-6">
          <div className="flex flex-col sm:flex-col justify-start mb-4 gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lista de Sedes</h1>
          </div>

          {sedesLoading && <p className="text-gray-500">Cargando sedes...</p>}
          {sedesError && <p className="text-red-500 mb-4">{sedesError}</p>}
          {empresasError && <p className="text-red-500 mb-4">Error al cargar empresas: {empresasError}</p>}
          {sedes?.length === 0 && !sedesLoading && !sedesError && (
            <p className="text-gray-500 mb-4">No hay sedes para mostrar.</p>
          )}
          <Tabla
            columns={columns}
            data={sedes || []}
            searchableFields={searchableFields}
            senaEmpresas={senaEmpresas || []}
            extraControls={
              <div className="flex items-center gap-4">
                <Button 
                  onPress={() => setIsModalOpen(true)} 
                  color="primary" 
                  startContent={<FaPlus />}
                >
                  Registrar
                </Button>
              </div>
            }
          />

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <ModalContent>
              <ModalHeader>Registrar Nueva Sede</ModalHeader>
              <ModalBody>
                <SedeForm
                  formData={formData}
                  senaEmpresas={senaEmpresas || []}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={registerLoading}
                  error={registerError || empresasError}
                  empresasLoading={empresasLoading}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </CardBody>
      </Card>
    </div>
  );
}