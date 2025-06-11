
// src/pages/gestion_operativa/caja_diaria/CajaDiaria.tsx
import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus } from 'react-icons/fa';
import { useCajaDiaria } from '../../hook/gestion_operativa/useCajaDiaria';
import { useRegistrarCaja } from '../../hook/gestion_operativa/useRegistrarCaja';
import { useCerrarCaja } from '../../hook/gestion_operativa/useCerrarCaja';
import { CajaDiariaForm } from '../../components/gestion_operativa/CajaDiariaForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import Tabla from '../../components/global/Tabla';

const columns = [
  { uid: 'fecha_apertura', name: 'Fecha Apertura' },
  { 
    uid: 'unidadProductiva_info.nombre', 
    name: 'Unidad Productiva',
    render: (data: any) => data?.nombre || 'Sin nombre'
  },
  { uid: 'saldo_inicial', name: 'Saldo Inicial' },
  { 
    uid: 'esta_abierta', 
    name: 'Estado',
    render: (data: boolean) => (data ? 'Abierta' : 'Cerrada')
  },
  { uid: 'duracion', name: 'Duración' },
  { 
    uid: 'acciones', 
    name: 'Acciones', 
    render: (data: any, row: any) => (
      row.esta_abierta ? (
        <Button color="error" onPress={() => handleOpenModal(row.id, false)}>Cerrar</Button>
      ) : null
    )
  },
];

const searchableFields = ['unidadProductiva_info.nombre', 'observaciones'];

export default function CajaDiaria({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cajas, loading, error, refetch } = useCajaDiaria();
  const { registrarCaja, loading: registerLoading, error: registerError } = useRegistrarCaja();
  const { cerrarCaja, loading: cerrarLoading, error: cerrarError } = useCerrarCaja(0);
  const [selectedCajaId, setSelectedCajaId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    saldo_final: 0,
    observaciones: '',
    unidadProductiva: undefined as number | undefined,
    saldo_inicial: undefined as number | undefined,
  });

  console.log('Estado de cajas:', { cajas, loading, error });

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (selectedCajaId === null && formData.unidadProductiva !== undefined && formData.saldo_inicial !== undefined) {
      // Registro
      try {
        await registrarCaja({
          unidadProductiva: formData.unidadProductiva,
          saldo_inicial: formData.saldo_inicial,
          observaciones: formData.observaciones,
        });
        setIsModalOpen(false);
        setFormData({
          saldo_final: 0,
          observaciones: '',
          unidadProductiva: undefined,
          saldo_inicial: undefined,
        });
        refetch();
      } catch (err) {
        console.error('Error al registrar caja:', err);
      }
    } else if (selectedCajaId) {
      // Cierre
      try {
        await cerrarCaja({ saldo_final: formData.saldo_final, observaciones: formData.observaciones });
        setIsModalOpen(false);
        setFormData({
          saldo_final: 0,
          observaciones: '',
          unidadProductiva: undefined,
          saldo_inicial: undefined,
        });
        refetch();
      } catch (err) {
        console.error('Error al cerrar caja:', err);
      }
    }
  };

  const handleOpenModal = (cajaId: number | null, isRegister: boolean) => {
    setSelectedCajaId(cajaId);
    setIsModalOpen(true);
    setFormData({
      saldo_final: 0,
      observaciones: '',
      unidadProductiva: isRegister ? undefined : formData.unidadProductiva,
      saldo_inicial: isRegister ? undefined : formData.saldo_inicial,
    });
  };

  // Placeholder para unidadProductivas (reemplaza con tu hook real si existe)
  const unidadProductivas = cajas.map(c => ({ id: c.unidadProductiva, nombre: c.unidadProductiva_info.nombre })).filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
  const unidadesLoading = false;
  const unidadesError = null;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${isNavbarOpen ? 'ml-64' : 'ml-16'} flex items-center justify-center`}>
      <Card className="w-full max-w-5xl">
        <CardBody className="flex flex-col p-6">
          <div className="flex flex-col sm:flex-col justify-start mb-4 gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Listado de Cajas Diarias</h1>
          </div>

          {loading && <p className="text-gray-500">Cargando cajas...</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {unidadesError && <p className="text-red-500 mb-4">Error al cargar unidades: {unidadesError}</p>}
          {cajas?.length === 0 && !loading && !error && (
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
                  unidadProductivas={unidadProductivas}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={selectedCajaId ? cerrarLoading : registerLoading}
                  error={selectedCajaId ? cerrarError : registerError}
                  isRegister={!selectedCajaId}
                  unidadesLoading={unidadesLoading}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </CardBody>
      </Card>
    </div>
  );
}