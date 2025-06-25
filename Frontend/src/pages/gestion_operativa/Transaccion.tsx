import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus } from 'react-icons/fa';
import { useTransaccion } from '../../hook/gestion_operativa/useTransaccion';
import { useRegistrarTransaccion } from '../../hook/gestion_operativa/useRegistrarTransaccion';
import { useUsuarios } from '../../hook/usuarios/useUsuarios';
import { useProductos } from '../../hook/inventario/useProductos';
import { TransaccionForm } from '../../components/gestion_operativa/TransaccionForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import Tabla from '../../components/global/Tabla';
import { TransaccionCreateData } from '../../types/gestion_operativa/transaccion';

const columns = [
  { uid: 'fecha', name: 'Fecha' },
  { uid: 'tipo_display', name: 'Tipo de Transacción' },
  { uid: 'cantidad', name: 'Cantidad' },
  { uid: 'usuario_info.first_name', name: 'Usuario', render: (data: any) => data?.usuario_info?.first_name || 'Sin usuario' },
  { uid: 'producto_info.nombre', name: 'Producto', render: (data: any) => data?.producto_info?.nombre || 'Sin producto' },
  { uid: 'estado', name: 'Estado' },
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

const searchableFields = ['tipo_display', 'usuario_info.first_name', 'producto_info.nombre'];

export default function Transaccion({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { transacciones, loading: transaccionesLoading, error: transaccionesError, refetch } = useTransaccion();
  const { registrarTransaccion, loading: registerLoading, error: registerError } = useRegistrarTransaccion();
  const { usuarios, loading: usuariosLoading, error: usuariosError } = useUsuarios();
  const { productos, loading: productosLoading, error: productosError } = useProductos();
  const [selectedTransaccionId, setSelectedTransaccionId] = useState<number | null>(null);
  const [formData, setFormData] = useState<TransaccionCreateData>({
    tipo: '',
    cantidad: undefined,
    usuario: undefined,
    producto: undefined,
  });

  console.log('Transacciones:', transacciones);
  console.log('Error de transacciones:', transaccionesError);
  console.log('Usuarios:', usuarios);
  console.log('Productos:', productos);

  const handleChange = (field: keyof TransaccionCreateData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!isModalOpen) return;
      if (selectedTransaccionId === null && formData.tipo && formData.cantidad !== undefined && formData.usuario !== undefined && formData.producto !== undefined) {
        const newTransaccion = await registrarTransaccion({
          tipo: formData.tipo,
          cantidad: formData.cantidad,
          usuario: formData.usuario,
          producto: formData.producto,
        });
        if (newTransaccion) {
          refetch(); // Refrescamos la lista
        }
      } else if (selectedTransaccionId) {
        // Lógica para cancelar transacción
      }
      setIsModalOpen(false);
      setFormData({
        tipo: '',
        cantidad: undefined,
        usuario: undefined,
        producto: undefined,
      });
    } catch (err) {
      console.error('Error al procesar transacción:', err);
    }
  };

  const handleOpenModal = (transaccionId: number | null, isRegister: boolean) => {
    setSelectedTransaccionId(transaccionId);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Listado de Transacciones</h1>
          </div>

          {transaccionesLoading && <p className="text-gray-500">Cargando transacciones...</p>}
          {transaccionesError && <p className="text-red-500 mb-4">{transaccionesError}</p>}
          {usuariosError && <p className="text-red-500 mb-4">{usuariosError}</p>}
          {productosError && <p className="text-red-500 mb-4">{productosError}</p>}
          {transacciones && transacciones.length === 0 && !transaccionesLoading && !transaccionesError && (
            <p className="text-gray-500 mb-4">No hay transacciones para mostrar o hubo un error al cargarlas.</p>
          )}
          <Tabla
            columns={columns}
            data={transacciones || []}
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
              <ModalHeader>Registrar Nueva Transacción</ModalHeader>
              <ModalBody>
                <TransaccionForm
                  formData={formData}
                  usuarios={usuarios}
                  productos={productos}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={registerLoading}
                  error={registerError || transaccionesError || usuariosError || productosError}
                  usuariosLoading={usuariosLoading}
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