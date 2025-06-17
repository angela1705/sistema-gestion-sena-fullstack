
// src/pages/gestion_operaciones/detalle_caja/DetalleCaja.tsx
import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus } from 'react-icons/fa';
import { useDetalleCaja } from '../../hook/gestion_operativa/useDetalleCaja';
import { useRegistrarDetalleCaja } from '../../hook/gestion_operativa/useRegistrarDetalleCaja';
import { useTransaccion } from '../../hook/gestion_operativa/useTransaccion';
import { useCajaDiaria } from '../../hook/gestion_operativa/useCajaDiaria';
import { DetalleCajaForm } from '../../components/gestion_operativa/DetalleCajaForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import Tabla from '../../components/global/Tabla';
import { DetalleCajaCreateData } from '../../types/gestion_operativa/detalle_caja';

const columns = [
  { uid: 'fecha', name: 'Fecha' },
  { uid: 'transaccion', name: 'Transacción', render: (data: any) => data?.descripcion || 'Sin transacción' },
  { uid: 'caja_diaria', name: 'Caja Diaria', render: (data: any) => data?.descripcion || 'Sin caja' },
  { uid: 'monto', name: 'Monto' },
  { uid: 'tipo', name: 'Tipo' },
  {
    uid: 'acciones',
    name: 'Acciones',
    render: (row: any) => (
      row.estado === 'pendiente' ? (
        <Button color="danger" onPress={() => handleOpenModal(row.id, false)}>Cancelar</Button>
      ) : null
    ),
  },
];

const searchableFields = ['transaccion.descripcion', 'caja_diaria.descripcion', 'tipo'];

export default function DetalleCaja({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { detalleCajas, loading: detalleCajasLoading, error: detalleCajasError, refetch } = useDetalleCaja();
  const { registrarDetalleCaja, loading: registerLoading, error: registerError } = useRegistrarDetalleCaja();
  const { transacciones, loading: transaccionesLoading } = useTransaccion();
  const { cajaDiarias, loading: cajaDiariasLoading } = useCajaDiaria();
  const [selectedDetalleCajaId, setSelectedDetalleCajaId] = useState<number | null>(null);
  const [formData, setFormData] = useState<DetalleCajaCreateData>({
    transaccion: undefined,
    caja_diaria: undefined,
    monto: 0,
    tipo: '',
    descripcion: '',
  });

  console.log('Estado de detalle cajas:', { detalleCajas, detalleCajasLoading, detalleCajasError });
  console.log('Transacciones:', { transacciones, transaccionesLoading });
  console.log('Caja Diarias:', { cajaDiarias, cajaDiariasLoading });

  const handleChange = (field: keyof DetalleCajaCreateData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!isModalOpen) return;
      if (selectedDetalleCajaId === null && formData.transaccion && formData.caja_diaria && formData.monto && formData.tipo && formData.descripcion) {
        const result = await registrarDetalleCaja({
          transaccion: formData.transaccion,
          caja_diaria: formData.caja_diaria,
          monto: formData.monto,
          tipo: formData.tipo,
          descripcion: formData.descripcion,
        });
        if (result) {
          setIsModalOpen(false);
          setFormData({
            transaccion: undefined,
            caja_diaria: undefined,
            monto: 0,
            tipo: '',
            descripcion: '',
          });
          await refetch();
          console.log('Después de refetch, detalle cajas:', detalleCajas);
        }
      } else if (selectedDetalleCajaId) {
        // Lógica para cancelar detalle caja
      }
    } catch (err) {
      console.error('Error al procesar detalle caja:', err);
    }
  };

  const handleOpenModal = (detalleCajaId: number | null, isRegister: boolean) => {
    setSelectedDetalleCajaId(detalleCajaId);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Listado de Detalle Caja</h1>
          </div>

          {detalleCajasLoading && <p className="text-gray-500">Cargando detalle cajas...</p>}
          {detalleCajasError && <p className="text-red-500 mb-4">{detalleCajasError}</p>}
          <Tabla
            columns={columns}
            data={detalleCajas || []}
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

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="flex items-center justify-center">
            <ModalContent>
              <ModalHeader>Registrar Nuevo Detalle Caja</ModalHeader>
              <ModalBody>
                <DetalleCajaForm
                  formData={formData}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={registerLoading}
                  error={registerError}
                  transaccionesLoading={transaccionesLoading}
                  cajaDiariasLoading={cajaDiariasLoading}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </CardBody>
      </Card>
    </div>
  );
}
