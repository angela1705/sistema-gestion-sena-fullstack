
import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus } from 'react-icons/fa';
import { useCategories } from '../../hook/inventario/useCategories';
import { useRegistrarCategoria } from '../../hook/inventario/useRegistrarCategoria';
import { RegistrarCategoriaForm } from '../../components/inventario/RegistrarCategoriaForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import Tabla from '../../components/global/Tabla';
import { TipoCategoriaFormData } from '../../types/inventario/Categoria';

const columns = [
  { uid: 'id', name: 'ID' },
  { uid: 'nombre', name: 'Nombre' },
];

const searchableFields = ['nombre'];

export default function Categorias({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { categorias, loading: categoriasLoading, error: categoriasError, refetch } = useCategories();
  const { registrarCategoria, loading: registerLoading, error: registerError } = useRegistrarCategoria();

  console.log('Estado de categorías:', { categorias, categoriasLoading, categoriasError });

  const [formData, setFormData] = useState<TipoCategoriaFormData>({
    nombre: '',
  });

  const handleChange = (field: keyof TipoCategoriaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await registrarCategoria(formData);
      setIsModalOpen(false);
      setFormData({ nombre: '' });
      refetch();
    } catch (err) {
      console.error('Error al registrar categoría:', err);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lista de Categorías</h1>
          </div>

          {categoriasLoading && <p className="text-gray-500">Cargando categorías...</p>}
          {categoriasError && <p className="text-red-500 mb-4">{categoriasError}</p>}
          {categorias?.length === 0 && !categoriasLoading && !categoriasError && (
            <p className="text-gray-500 mb-4">No hay categorías para mostrar.</p>
          )}
          <Tabla
            columns={columns}
            data={categorias || []}
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
              <ModalHeader>Registrar Nueva Categoría</ModalHeader>
              <ModalBody>
                <RegistrarCategoriaForm
                  formData={formData}
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