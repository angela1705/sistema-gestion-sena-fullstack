import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus } from 'react-icons/fa';
import { useProductos } from '../../hook/inventario/useProductos';
import { useRegistrarProducto } from '../../hook/inventario/useRegistrarProducto';
import { useProductoOptions } from '../../hook/inventario/useProductoOptions';
import { RegistrarProductoForm } from '../../components/inventario/RegistrarProductoForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import Tabla from '../../components/global/Tabla';
import { ProductoFormData } from '../../types/inventario/Producto';

const columns = [
  { uid: 'id', name: 'ID' },
  { uid: 'nombre', name: 'Nombre' },
  { uid: 'descripcion', name: 'Descripción' },
  {
    uid: 'categoria_info',
    name: 'Categoría',
    render: (data: any) => data?.nombre || 'Sin categoría',
  },
  {
    uid: 'unidadP_info',
    name: 'Unidad Productiva',
    render: (data: any) => data?.nombre || 'Sin unidad productiva',
  },
  {
    uid: 'estado_display',
    name: 'Estado',
  },
  {
    uid: 'precio_final',
    name: 'Precio Final',
  },
  {
    uid: 'disponible_para_reservas',
    name: 'Reservas',
    render: (data: boolean) => (data ? 'Sí' : 'No'),
  },
];

const searchableFields = ['nombre', 'descripcion', 'categoria_info.nombre', 'unidadP_info.nombre', 'estado_display'];

export default function Productos({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { productos, loading: productosLoading, error: productosError, refetch } = useProductos();
  const { registrarProducto, loading: registerLoading, error: registerError } = useRegistrarProducto();
  const { categorias, unidades, loading: optionsLoading, error: optionsError } = useProductoOptions();

  console.log('Estado de productos:', { productos, productosLoading, productosError });
  console.log('Estado de opciones:', { categorias, unidades, optionsLoading, optionsError });

  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: '',
    descripcion: '',
    categoria: '',
    unidadP: '',
    estado: 'disponible',
    stock: false,
    reservas: false,
    hora_limite_reserva: '',
    stock_actual: undefined,
    max_reservas: undefined,
    precio_compra: '',
    tiene_descuento: false,
    porcentaje_descuento: '',
    tiene_comision: false,
    comision: '',
    unidad_comision_destino: '',
    imagen: null,
    unidad_medida_base: 'unidad',
  });

  const handleChange = (field: keyof ProductoFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await registrarProducto(formData);
      setIsModalOpen(false);
      setFormData({
        nombre: '',
        descripcion: '',
        categoria: '',
        unidadP: '',
        estado: 'disponible',
        stock: false,
        reservas: false,
        hora_limite_reserva: '',
        stock_actual: undefined,
        max_reservas: undefined,
        precio_compra: '',
        tiene_descuento: false,
        porcentaje_descuento: '',
        tiene_comision: false,
        comision: '',
        unidad_comision_destino: '',
        imagen: null,
        unidad_medida_base: 'unidad',
      });
      refetch();
    } catch (err) {
      console.error('Error al registrar producto:', err);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lista de Productos</h1>
          </div>

          {productosLoading && <p className="text-gray-500">Cargando productos...</p>}
          {(productosError || optionsError) && (
            <p className="text-red-500 mb-4">{productosError || optionsError}</p>
          )}
          {productos?.length === 0 && !productosLoading && !productosError && (
            <p className="text-gray-500 mb-4">No hay productos para mostrar.</p>
          )}
          <Tabla
            columns={columns}
            data={productos || []}
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
              <ModalHeader>Registrar Nuevo Producto</ModalHeader>
              <ModalBody>
                <RegistrarProductoForm
                  formData={formData}
                  categorias={categorias}
                  unidades={unidades}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={registerLoading}
                  error={registerError}
                  optionsLoading={optionsLoading}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </CardBody>
      </Card>
    </div>
  );
}