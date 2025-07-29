// src/pages/entidades/UnidadesProductivas.tsx
import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { FaPlus } from 'react-icons/fa';
import { useUnidadesProductivas } from '../../hook/entidades/useUnidadesProductivas';
import { useSedeOptions } from '@/hook/entidades/useSedeOptions';
import { useRegistrarUnidadProductiva } from '../../hook/entidades/useRegistrarUnidadProductiva';
import Tabla from '../../components/global/Tabla';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import { RegistrarUnidadProductivaForm } from '../../components/entidades/RegistrarUnidadProductivaForm';
import { UnidadProductivaFormData } from '../../types/entidades/UnidadProductiva';
import { EncargadoOption } from '../../types/entidades/Options';

interface UnidadesProductivasProps {
  isNavbarOpen: boolean;
}

const columns = [
  { uid: 'id', name: 'ID' },
  { uid: 'nombre', name: 'Nombre' },
  { uid: 'sede_info', name: 'Sede', render: (data: any) => data?.nombre_display || 'N/A' },
  {
    uid: 'encargado_info',
    name: 'Encargado',
    render: (data: any) => (data ? `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Sin encargado' : 'Sin encargado'),
  },
  { uid: 'horario_atencion', name: 'Horario de Atención' },
  { uid: 'tipo_display', name: 'Tipo' },
  { uid: 'estado_display', name: 'Estado' },
];

const searchableFields = ['nombre', 'sede_info.nombre_display', 'encargado_info.first_name', 'encargado_info.last_name', 'tipo_display'];

const UnidadesProductivas: React.FC<UnidadesProductivasProps> = ({ isNavbarOpen }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { unidades, loading, error, refetch } = useUnidadesProductivas();
  const { encargados, loading: optionsLoading, error: optionsError } = useSedeOptions();
  const { registrarUnidad, loading: registerLoading, error: registerError } = useRegistrarUnidadProductiva();
  const [tipos, setTipos] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/unidad-productiva/opciones/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Error al obtener opciones');
        const data = await response.json();
        const tipos = Object.entries(data.tipos).map(([value, label]) => ({
          value,
          label: label as string,
        }));
        setTipos(tipos);
      } catch (err) {
        console.error('Error al obtener tipos:', err);
      }
    };
    fetchTipos();
  }, []);

  const [formData, setFormData] = useState<UnidadProductivaFormData>({
    nombre: '',
    tipo: '',
    sede: '',
    encargado: '',
    horario_atencion: '',
  });

  const handleChange = (field: keyof UnidadProductivaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      console.log('Enviando formData:', formData);
      await registrarUnidad(formData);
      setIsModalOpen(false);
      setFormData({ nombre: '', tipo: '', sede: '', encargado: '', horario_atencion: '' });
      refetch();
    } catch (err) {
      console.error('Error al registrar unidad productiva:', err);
    }
  };

  const safeEncargados: EncargadoOption[] = Array.isArray(encargados) ? encargados : [];

  console.log('Datos en UnidadesProductivas:', { unidades, safeEncargados, formData });

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
        isNavbarOpen ? 'ml-64' : 'ml-16'
      } flex items-center justify-center`}
    >
      <Card className="w-full max-w-5xl">
        <CardBody className="flex flex-col p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Unidades Productivas</h1>
          {loading && <p className="text-gray-500">Cargando unidades...</p>}
          {(error || optionsError || registerError) && (
            <p className="text-red-500 mb-4">{error || optionsError || registerError}</p>
          )}
          {unidades?.length === 0 && !loading && !error && (
            <p className="text-gray-500 mb-4">No hay unidades productivas para mostrar.</p>
          )}
          <Tabla
            columns={columns}
            data={unidades || []}
            searchableFields={searchableFields}
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
                  encargados={safeEncargados}
                  tipos={tipos}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={registerLoading}
                  error={registerError}
                  optionsLoading={optionsLoading}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </CardBody>
      </Card>
    </div>
  );
};

export default UnidadesProductivas;