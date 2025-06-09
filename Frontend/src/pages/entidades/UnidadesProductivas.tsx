
import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus } from 'react-icons/fa';
import { useUnidadesProductivas } from '../../hook/entidades/useUnidadesProductivas';
import { useRegistrarUnidadProductiva } from '../../hook/entidades/useRegistrarUnidadProductiva';
import { useUnidadProductivaOptions } from '../../hook/entidades/useUnidadProductivaOptions';
import { RegistrarUnidadProductivaForm } from '../../components/entidades/RegistrarUnidadProductivaForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import Tabla from '../../components/global/Tabla';
import { UnidadProductivaFormData } from '../../types/entidades/UnidadProductiva';
const columns = [
  { uid: 'nombre', name: 'Nombre' },
  { uid: 'tipo_display', name: 'Tipo' },
  { uid: 'estado_display', name: 'Estado' },
  {
    uid: 'sede_info',
    name: 'Sede',
    render: (data: any, row: any, sedes: any[]) => {
      console.log('Render sede_info:', { data, row, sedes });
      if (data && typeof data === 'object' && data.nombre_display) {
        return data.nombre_display;
      }
      const sede = sedes?.find((s) => s?.id === parseInt(data));
      return sede ? sede.nombre_display : 'Sin sede';
    },
  },
  {
    uid: 'encargado_info',
    name: 'Encargado',
    render: (data: any, row: any, encargados: any[]) => {
      console.log('Render encargado_info:', { data, row, encargados });
      if (data && typeof data === 'object' && data.nombre_completo) {
        return data.nombre_completo;
      }
      const encargado = encargados?.find((e) => e?.id === parseInt(data));
      return encargado ? encargado.nombre_completo : 'Sin encargado';
    },
  },
  { uid: 'horario_atencion', name: 'Horario Atención' },
  {
    uid: 'fecha_creacion',
    name: 'Fecha Creación',
    render: (data: string) => new Date(data).toLocaleDateString(),
  },
];

const searchableFields = ['nombre', 'tipo_display', 'estado_display', 'horario_atencion'];

export default function UnidadesProductivas({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { unidades, loading: unidadesLoading, error: unidadesError, refetch } = useUnidadesProductivas();
  const { registrarUnidad, loading: registerLoading, error: registerError } = useRegistrarUnidadProductiva();
  const { sedes, encargados, loading: optionsLoading, error: optionsError } = useUnidadProductivaOptions();

  console.log('Estado de unidades:', { unidades, unidadesLoading, unidadesError });
  console.log('Estado de opciones:', { sedes, encargados, optionsLoading, optionsError });

  const [formData, setFormData] = useState<UnidadProductivaFormData>({
    nombre: '',
    tipo: '',
    sede: '',
    encargado: '',
  });

  const handleChange = (field: keyof UnidadProductivaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await registrarUnidad(formData);
      setIsModalOpen(false);
      setFormData({
        nombre: '',
        tipo: '',
        sede: '',
        encargado: '',
      });
      refetch();
    } catch (err) {
      console.error('Error al registrar unidad:', err);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
        isNavbarOpen ? 'ml-64' : 'ml-16'
      } flex items-center justify-center`}
    >
      <Card className="w-full max-w-5xl">
        <CardBody className="flex flex-col p-6">
          <div className="flex flex-col sm:flex-col justify-start mb-4 gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lista de Unidades Productivas</h1>
          </div>

          {unidadesLoading && <p className="text-gray-500">Cargando unidades productivas...</p>}
          {unidadesError && <p className="text-red-500 mb-4">{unidadesError}</p>}
          {optionsError && <p className="text-red-500 mb-4">Error al cargar opciones: {optionsError}</p>}
          {unidades?.length === 0 && !unidadesLoading && !unidadesError && (
            <p className="text-gray-500 mb-4">No hay unidades productivas para mostrar.</p>
          )}
          <Tabla
            columns={columns}
            data={unidades || []}
            searchableFields={searchableFields}
            sedes={sedes || []}
            encargados={encargados || []}
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
              <ModalHeader>Registrar Nueva Unidad Productiva</ModalHeader>
              <ModalBody>
                <RegistrarUnidadProductivaForm
                  formData={formData}
                  sedes={sedes || []}
                  encargados={encargados || []}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={registerLoading}
                  error={registerError || optionsError}
                  optionsLoading={optionsLoading}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </CardBody>
      </Card>
    </div>
  );
}