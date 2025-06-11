
// src/pages/gestion_operaciones/reserva/Reserva.tsx
import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus } from 'react-icons/fa';
import { useReserva } from '../../hook/gestion_operativa/useReserva';
import { useRegistrarReserva } from '../../hook/gestion_operativa/useRegistrarReserva';
import { ReservaForm } from '../../components/gestion_operativa/ReservaForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import Tabla from '../../components/global/Tabla';

const columns = [
  { uid: 'fecha_creacion', name: 'Fecha Creación' },
  { uid: 'persona_info.first_name', name: 'Persona', render: (data: any) => data?.first_name || 'Sin nombre' },
  { uid: 'producto_info.nombre', name: 'Producto', render: (data: any) => data?.nombre || 'Sin producto' },
  { uid: 'cantidad', name: 'Cantidad' },
  { uid: 'total', name: 'Total' },
  { uid: 'estado_display', name: 'Estado' },
  { 
    uid: 'acciones', 
    name: 'Acciones', 
    render: (data: any, row: any) => (
      row.estado === 'pendiente' ? (
        <Button color="error" onPress={() => handleOpenModal(row.id, false)}>Cancelar</Button>
      ) : null
    )
  },
];

const searchableFields = ['persona_info.first_name', 'producto_info.nombre'];

export default function Reserva({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { reservas, loading, error, refetch } = useReserva();
  const { registrarReserva, loading: registerLoading, error: registerError } = useRegistrarReserva();
  const [selectedReservaId, setSelectedReservaId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    persona: undefined as number | undefined,
    producto: undefined as number | undefined,
    cantidad: undefined as number | undefined,
  });

  console.log('Estado de reservas:', { reservas, loading, error });

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (selectedReservaId === null && formData.persona !== undefined && formData.producto !== undefined && formData.cantidad !== undefined) {
      // Registro
      try {
        await registrarReserva({
          persona: formData.persona,
          producto: formData.producto,
          cantidad: formData.cantidad,
        });
        setIsModalOpen(false);
        setFormData({
          persona: undefined,
          producto: undefined,
          cantidad: undefined,
        });
        refetch();
      } catch (err) {
        console.error('Error al registrar reserva:', err);
      }
    }
  };

  const handleOpenModal = (reservaId: number | null, isRegister: boolean) => {
    setSelectedReservaId(reservaId);
    setIsModalOpen(true);
    setFormData({
      persona: undefined,
      producto: undefined,
      cantidad: undefined,
    });
  };

  // Placeholder para personas y productos con chequeo
  const personas = Array.isArray(reservas) ? reservas.map(r => ({ id: r.persona, first_name: r.persona_info.first_name })).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) : [];
  const productos = Array.isArray(reservas) ? reservas.map(r => ({ id: r.producto, nombre: r.producto_info.nombre })).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) : [];
  const personasLoading = false;
  const productosLoading = false;
  const personasError = null;
  const productosError = null;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${isNavbarOpen ? 'ml-64' : 'ml-16'} flex items-center justify-center`}>
      <Card className="w-full max-w-5xl">
        <CardBody className="flex flex-col p-6">
          <div className="flex flex-col sm:flex-col justify-start mb-4 gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Listado de Reservas</h1>
          </div>

          {loading && <p className="text-gray-500">Cargando reservas...</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {personasError && <p className="text-red-500 mb-4">Error al cargar personas: {personasError}</p>}
          {productosError && <p className="text-red-500 mb-4">Error al cargar productos: {productosError}</p>}
          {reservas?.length === 0 && !loading && !error && (
            <p className="text-gray-500 mb-4">No hay reservas para mostrar.</p>
          )}
          <Tabla
            columns={columns}
            data={reservas || []}
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
              <ModalHeader>{selectedReservaId ? 'Cancelar Reserva' : 'Registrar Nueva Reserva'}</ModalHeader>
              <ModalBody>
                <ReservaForm
                  formData={formData}
                  personas={personas}
                  productos={productos}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={registerLoading}
                  error={registerError}
                  personasLoading={personasLoading}
                  productosLoading={productosLoading}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </CardBody>
      </Card>
    </div>
  );
}