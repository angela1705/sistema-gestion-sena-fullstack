// pages/Reserva.tsx
import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus } from 'react-icons/fa';
import { useReserva } from '../../hook/gestion_operativa/useReserva';
import { useRegistrarReserva } from '../../hook/gestion_operativa/useRegistrarReserva';
import { useCancelarReserva } from '../../hook/gestion_operativa/useCancelarReserva';
import { useReservaOptions, PersonaOption, ProductoOption } from '../../hook/gestion_operativa/useReservaOptions';
import { ReservaForm } from '../../components/gestion_operativa/ReservaForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import Tabla from '../../components/global/Tabla';
import { type Reserva, ReservaCreateData } from '../../types/gestion_operativa/reserva';
import { ReactNode } from 'react';

// Definimos SedeOption para coincidir con Tabla.tsx
interface SedeOption {
  id: number;
  nombre_display: string;
}

interface Column {
  uid: string;
  name: string;
  render?: (data: any, row: Reserva, options: SedeOption[]) => ReactNode;
}

export default function Reserva({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservaId, setSelectedReservaId] = useState<number | null>(null);
  const { reservas, loading: reservasLoading, error: reservasError, refetch } = useReserva();
  const { registrarReserva, loading: registerLoading, error: registerError } = useRegistrarReserva();
  const { cancelarReserva, loading: cancelLoading, error: cancelError } = useCancelarReserva();
  const { personas, productos, loading: optionsLoading, error: optionsError } = useReservaOptions();

  // Usamos ProductoOption explícitamente para evitar la advertencia
  const productosTyped: ProductoOption[] = productos;

  const [formData, setFormData] = useState<ReservaCreateData>({
    producto: 0,
    cantidad: 0,
  });

  const handleChange = (field: keyof ReservaCreateData, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!isModalOpen) return;
      await registrarReserva(formData);
      setIsModalOpen(false);
      setFormData({
        producto: 0,
        cantidad: 0,
      });
      setSelectedReservaId(null);
      await refetch();
    } catch (err) {
      console.error('Error al procesar reserva:', err);
    }
  };

  const handleOpenModal = (reservaId: number | null) => {
    setSelectedReservaId(reservaId);
    setIsModalOpen(true);
    const initialFormData: ReservaCreateData = {
      producto: productosTyped.length === 1 ? productosTyped[0].id : 0,
      cantidad: 1,
      persona: personas.length === 1 ? personas[0].id : undefined,
    };
    setFormData(initialFormData);
  };

  const handleCancel = async (reservaId: number) => {
    try {
      await cancelarReserva(reservaId);
      await refetch();
    } catch (err) {
      console.error('Error al cancelar reserva:', err);
    }
  };

  const columns: Column[] = [
    { uid: 'fecha_creacion', name: 'Fecha Creación' },
    {
      uid: 'persona_info.first_name',
      name: 'Persona',
      render: (_data, row: Reserva, _options: SedeOption[]) => row.persona_info?.first_name || 'N/A',
    },
    {
      uid: 'producto_info.nombre',
      name: 'Producto',
      render: (_data, row: Reserva, _options: SedeOption[]) => row.producto_info?.nombre || 'N/A',
    },
    { uid: 'cantidad', name: 'Cantidad' },
    { uid: 'total', name: 'Total' },
    {
      uid: 'estado_display',
      name: 'Estado',
      render: (_data, row: Reserva, _options: SedeOption[]) => row.estado_display || 'N/A',
    },
    {
      uid: 'acciones',
      name: 'Acciones',
      render: (_data, row: Reserva, _options: SedeOption[]) =>
        row.estado === 'pendiente' ? (
          <Button
            color="danger"
            onPress={() => handleCancel(row.id)}
            isLoading={cancelLoading}
            disabled={cancelLoading}
          >
            Cancelar
          </Button>
        ) : null,
    },
  ];

  const searchableFields = ['persona_info.first_name', 'producto_info.nombre', 'estado_display'];

  // Logs de depuración
  console.log('Reserva - Personas:', personas);
  console.log('Reserva - Productos:', productosTyped);
  console.log('Reserva - OptionsLoading:', optionsLoading);
  console.log('Reserva - OptionsError:', optionsError);
  console.log('Reserva - Reservas:', reservas);
  console.log('Reserva - CancelError:', cancelError);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
        isNavbarOpen ? 'ml-64' : 'ml-16'
      } flex items-center justify-center`}
    >
      <Card className="w-full max-w-5xl">
        <CardBody className="flex flex-col p-6">
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lista de Reservas</h1>
            <Button
              onPress={() => handleOpenModal(null)}
              color="primary"
              startContent={<FaPlus />}
              isDisabled={optionsLoading || personas.length === 0 || productosTyped.length === 0}
            >
              Registrar
            </Button>
          </div>

          {(reservasLoading || optionsLoading || cancelLoading) && (
            <p className="text-gray-500">Cargando datos...</p>
          )}
          {(reservasError || optionsError || cancelError) && (
            <p className="text-red-500 mb-4">{reservasError || optionsError || cancelError}</p>
          )}
          {reservas && reservas.length === 0 && !reservasLoading && !reservasError && (
            <p className="text-gray-500 mb-4">No hay reservas para mostrar.</p>
          )}
          <Tabla
            columns={columns}
            data={reservas || []}
            searchableFields={searchableFields}
            senaEmpresas={personas.map((p: PersonaOption) => ({
              id: p.id,
              nombre_display: p.first_name,
            }))}
          />
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <ModalContent>
              <ModalHeader>Registrar Nueva Reserva</ModalHeader>
              <ModalBody>
                <ReservaForm
                  formData={formData}
                  personas={personas}
                  productos={productosTyped}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={registerLoading}
                  error={registerError || optionsError}
                  optionsLoading={optionsLoading}
                  isRegister={selectedReservaId === null}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </CardBody>
      </Card>
    </div>
  );
}