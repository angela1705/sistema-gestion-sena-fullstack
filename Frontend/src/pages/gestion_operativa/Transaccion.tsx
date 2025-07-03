import { useState, useEffect } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { FaPlus } from 'react-icons/fa';
import { useTransaccion } from '../../hook/gestion_operativa/useTransaccion';
import { useRegistrarTransaccion } from '../../hook/gestion_operativa/useRegistrarTransaccion';
import { useUsuarios } from '../../hook/usuarios/useUsuarios';
import { useProductos } from '../../hook/inventario/useProductos';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import Tabla from '../../components/global/Tabla';
import { TransaccionCreateData, TipoTransaccion } from '../../types/gestion_operativa/transaccion';
import TransaccionForm from '../../components/gestion_operativa/TransaccionForm';

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
  const [items, setItems] = useState<{ producto: number; cantidad: number; monto_venta?: number }[]>([{ producto: 0, cantidad: 0, monto_venta: 0 }]);
  const [usuarioId, setUsuarioId] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  console.log('Transacciones recibidas:', transacciones);
  console.log('Usuarios:', usuarios);
  console.log('Productos:', productos);
  console.log('Items a registrar:', items);

  const handleUsuarioChange = (value: number) => {
    setUsuarioId(value);
  };

  const handleItemChange = (index: number, field: 'producto' | 'cantidad' | 'monto_venta', value: number) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { producto: 0, cantidad: 0, monto_venta: 0 }]);
  };

  const handleSubmit = async () => {
    try {
      if (!isModalOpen || !usuarioId) {
        setErrorMessage('Debes seleccionar un usuario.');
        return;
      }
      if (items.some(item => !item.producto || !item.cantidad || !item.monto_venta)) {
        setErrorMessage('Todos los productos deben tener cantidad y monto de venta.');
        return;
      }
      setErrorMessage(null);
      const promises = items.map(item =>
        registrarTransaccion({
          tipo: TipoTransaccion.VENTA,
          producto: item.producto,
          cantidad: item.cantidad,
          usuario: userId,
          monto_venta: item.monto_venta || 0,
        })
      );
      const results = await Promise.all(promises);
      if (results.every(r => r !== null)) {
        refetch();
        setIsModalOpen(false);
        setItems([{ producto: 0, cantidad: 0, monto_venta: 0 }]);
        setUsuarioId(undefined);
      } else {
        setErrorMessage('Error al registrar una o más transacciones.');
      }
    } catch (err) {
      setErrorMessage('Error en la solicitud. Verifica los datos.');
      console.error('Error al procesar transacciones:', err);
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
            <p className="text-gray-500 mb-4">No hay transacciones para mostrar.</p>
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
                  Registrar Venta
                </Button>
              </div>
            }
          />

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="flex items-center justify-center">
            <ModalContent>
              <ModalHeader>Registrar Venta</ModalHeader>
              <ModalBody>
                <TransaccionForm
                  items={items}
                  usuarioId={usuarioId}
                  usuarios={usuarios}
                  productos={productos}
                  onItemChange={handleItemChange}
                  onUsuarioChange={handleUsuarioChange}
                  onAddItem={addItem}
                  onSubmit={handleSubmit}
                  loading={registerLoading}
                  error={errorMessage || registerError}
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