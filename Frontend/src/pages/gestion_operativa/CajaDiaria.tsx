
// src/pages/gestion_operativa/caja_diaria/CajaDiaria.tsx
import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus } from 'react-icons/fa';
import { useCajaDiaria } from '../../hook/gestion_operativa/useCajaDiaria';
import { useRegistrarCaja } from '../../hook/gestion_operativa/useRegistrarCaja';
import { useCerrarCaja } from '../../hook/gestion_operativa/useCerrarCaja';
import { useUnidadesProductivas } from '../../hook/entidades/useUnidadesProductivas';
import { CajaDiariaForm } from '../../components/gestion_operativa/CajaDiariaForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import Tabla from '../../components/global/Tabla';
import { CajaDiariaFormData } from '../../types/gestion_operativa/caja_diaria';

const columns = [
  { uid: 'fecha_apertura', name: 'Fecha Apertura' },
  { uid: 'unidadProductiva_info.nombre', name: 'Unidad Productiva' },
  { uid: 'saldo_inicial', name: 'Saldo Inicial' },
  { uid: 'esta_abierta', name: 'Estado', render: (data: boolean) => (data ? 'Abierta' : 'Cerrada') },
  { uid: 'duracion', name: 'Duración' },
  {
    uid: 'acciones',
    name: 'Acciones',
    render: (row: any) => {
      if (!row || typeof row.esta_abierta === 'undefined') return null; // Verificación más robusta
      return row.esta_abierta ? (
        <Button color="danger" onPress={() => handleOpenModal(row.id, false)}>Cerrar</Button>
      ) : null;
    },
  },
];

const searchableFields = ['fecha_apertura', 'unidadProductiva_info.nombre', 'saldo_inicial', 'duracion'];

export default function CajaDiaria({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cajas, loading: cajasLoading, error: cajasError, refetch } = useCajaDiaria();
  const { registrarCaja, loading: registerLoading, error: registerError } = useRegistrarCaja();
  const { cerrarCaja, loading: cerrarLoading, error: cerrarError } = useCerrarCaja(0);
  const { unidades, loading: unidadesLoading, error: unidadesError } = useUnidadesProductivas();
  const [formData, setFormData] = useState<CajaDiariaFormData>({
    saldo_final: '0',
    observaciones: '',
    unidadProductiva: '',
    saldo_inicial: '',
  });

  console.log('Estado de cajas:', { cajas, cajasLoading, cajasError });
  console.log('Unidades productivas:', { unidades, unidadesLoading, unidadesError });

  const handleChange = (field: keyof CajaDiariaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!isModalOpen) return;
      if (selectedCajaId === null && formData.unidadProductiva && formData.saldo_inicial) {
        await registrarCaja({
          unidadProductiva: formData.unidadProductiva,
          saldo_inicial: formData.saldo_inicial,
          observaciones: formData.observaciones,
        });
      } else if (selectedCajaId) {
        await cerrarCaja({
          saldo_final: parseFloat(formData.saldo_final),
          observaciones: formData.observaciones,
        });
      }
      setIsModalOpen(false);
      setFormData({
        saldo_final: '0',
        observaciones: '',
        unidadProductiva: '',
        saldo_inicial: '',
      });
      // Forzar recarga de datos y esperar la respuesta
      await refetch();
      console.log('Después de refetch, cajas:', cajas);
    } catch (err) {
      console.error('Error al procesar caja:', err);
    }
  };

  const [selectedCajaId, setSelectedCajaId] = useState<number | null>(null);
  const handleOpenModal = (cajaId: number | null, isRegister: boolean) => {
    setSelectedCajaId(cajaId);
    setIsModalOpen(true);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lista de Cajas Diarias</h1>
          </div>

          {cajasLoading && <p className="text-gray-500">Cargando cajas...</p>}
          {cajasError && <p className="text-red-500 mb-4">{cajasError}</p>}
          {unidadesError && <p className="text-red-500 mb-4">Error al cargar unidades: {unidadesError}</p>}
          {cajas && cajas.length === 0 && !cajasLoading && !cajasError && (
            <p className="text-gray-500 mb-4">No hay cajas para mostrar.</p>
          )}
          <Tabla
            columns={columns}
            data={cajas || []}
            searchableFields={searchableFields}
            extraControls={
              <div className="flex items-center gap-4">
                <Button
                  onPress={() => handleOpenModal(null, true)}
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
              <ModalHeader>{selectedCajaId ? 'Cerrar Caja' : 'Registrar Nueva Caja'}</ModalHeader>
              <ModalBody>
                <CajaDiariaForm
                  formData={formData}
                  unidades={unidades}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={selectedCajaId ? cerrarLoading : registerLoading}
                  error={selectedCajaId ? cerrarError : registerError || unidadesError}
                  optionsLoading={unidadesLoading}
                  isRegister={!selectedCajaId}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </CardBody>
      </Card>
    </div>
  );
}