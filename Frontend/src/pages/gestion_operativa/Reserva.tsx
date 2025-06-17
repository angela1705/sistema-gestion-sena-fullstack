
// src/pages/gestion_operaciones/reserva/Reserva.tsx
import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus } from 'react-icons/fa';
import { useReserva } from '../../hook/gestion_operativa/useReserva';
import { useRegistrarReserva } from '../../hook/gestion_operativa/useRegistrarReserva';
import { useUsuarios } from '../../hook/usuarios/useUsuarios';
import { useProductos } from '../../hook/inventario/useProductos';
import { ReservaForm } from '../../components/gestion_operativa/ReservaForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import Tabla from '../../components/global/Tabla';
import { ReservaCreateData } from '../../types/gestion_operativa/reserva';

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
    render: (row: any) => {
      if (!row || typeof row.estado === 'undefined') return null;
      return row.estado === 'pendiente' ? (
        <Button color="danger" onPress={() => handleOpenModal(row.id, false)}>Cancelar</Button>
      ) : null;
    },
  },
];

const searchableFields = ['persona_info.first_name', 'producto_info.nombre'];

export default function Reserva({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { reservas, loading: reservasLoading, error: reservasError, refetch } = useReserva();
  const { registrarReserva, loading: registerLoading, error: registerError } = useRegistrarReserva();
  const { usuarios, loading: personasLoading, error: personasError } = useUsuarios();
  const { productos, loading: productosLoading, error: productosError } = useProductos();
  const [selectedReservaId, setSelectedReservaId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ReservaCreateData>({
    persona: undefined,
    producto: undefined,
    cantidad: undefined,
  });

  console.log('Estado de reservas:', { reservas, reservasLoading, reservasError });
  console.log('Personas:', { usuarios, personasLoading, personasError });
  console.log('Productos:', { productos, productosLoading, productosError });

  const handleChange = (field: keyof ReservaCreateData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!isModalOpen) return;
      if (selectedReservaId === null && formData.persona !== undefined && formData.producto !== undefined && formData.cantidad !== undefined) {
        await registrarReserva({
          persona: formData.persona,
          producto: formData.producto,
          cantidad: formData.cantidad,
        });
      } else if (selectedReservaId) {
        // Lógica para cancelar reserva (ajustar según backend si aplica)
      }
      setIsModalOpen(false);
      setFormData({
        persona: undefined,
        producto: undefined,
        cantidad: undefined,
      });
      await refetch();
      console.log('Después de refetch, reservas:', reservas);
    } catch (err) {
      console.error('Error al procesar reserva:', err);
    }
  };

  const handleOpenModal = (reservaId: number | null, isRegister: boolean) => {
    setSelectedReservaId(reservaId);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Listado de Reservas</h1>
          </div>

          {reservasLoading && <p className="text-gray-500">Cargando reservas...</p>}
          {reservasError && <p className="text-red-500 mb-4">{reservasError}</p>}
          {personasError && <p className="text-red-500 mb-4">{personasError}</p>}
          {productosError && <p className="text-red-500 mb-4">{productosError}</p>}
          {reservas && reservas.length === 0 && !reservasLoading && !reservasError && (
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
                  personas={usuarios}
                  productos={productos}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={registerLoading}
                  error={registerError || personasError || productosError}
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
