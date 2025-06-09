
import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus } from 'react-icons/fa';
import { usePrecio } from '../../hook/inventario/usePrecio';
import { useRegistrarPrecio } from '../../hook/inventario/useRegistrarPrecio';
import { usePrecioOptions } from '../../hook/inventario/usePrecioOptions';
import { RegistrarPrecioForm } from '../../components/inventario/RegistrarPrecioForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import Tabla from '../../components/global/Tabla';
import { PrecioFormData } from '../../types/inventario/Precio';

const columns = [
  { uid: 'id', name: 'ID' },
  {
    uid: 'producto_info',
    name: 'Producto',
    render: (data: any) => data?.nombre || 'Sin producto',
  },
  {
    uid: 'cargo_info',
    name: 'Cargo',
    render: (data: any) => data?.nombre || 'Sin cargo',
  },
  { uid: 'valor', name: 'Valor' },
];

const searchableFields = ['producto_info.nombre', 'cargo_info.nombre'];

export default function Precios({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { precios, loading: preciosLoading, error: preciosError, refetch } = usePrecio();
  const { registrarPrecio, loading: registerLoading, error: registerError } = useRegistrarPrecio();
  const { productos, cargos, loading: optionsLoading, error: optionsError } = usePrecioOptions();

  console.log('Estado de precios:', { precios, preciosLoading, preciosError });
  console.log('Estado de opciones:', { productos, cargos, optionsLoading, optionsError });

  const [formData, setFormData] = useState<PrecioFormData>({
    cargo: '',
    producto: '',
    valor: '',
  });

  const handleChange = (field: keyof PrecioFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await registrarPrecio(formData);
      setIsModalOpen(false);
      setFormData({ cargo: '', producto: '', valor: '' });
      refetch();
    } catch (err) {
      console.error('Error al registrar precio:', err);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lista de Precios</h1>
          </div>

          {preciosLoading && <p className="text-gray-500">Cargando precios...</p>}
          {(preciosError || optionsError) && (
            <p className="text-red-500 mb-4">{preciosError || optionsError}</p>
          )}
          {precios?.length === 0 && !preciosLoading && !preciosError && (
            <p className="text-gray-500 mb-4">No hay precios para mostrar.</p>
          )}
          <Tabla
            columns={columns}
            data={precios || []}
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
              <ModalHeader>Registrar Nuevo Precio</ModalHeader>
              <ModalBody>
                <RegistrarPrecioForm
                  formData={formData}
                  productos={productos}
                  cargos={cargos}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={registerLoading}
                  error={registerError}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </CardBody>
      </Card>
    </div>
  );
}