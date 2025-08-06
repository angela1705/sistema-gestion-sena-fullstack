import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus, FaEdit } from 'react-icons/fa';
import { useProductos } from '@/hook/inventario/useProductos';
import { useRegistrarProducto } from '@/hook/inventario/useRegistrarProducto';
import { useProductoOptions } from '@/hook/inventario/useProductoOptions';
import { RegistrarProductoForm } from '@/components/inventario/RegistrarProductoForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import Tabla from '@/components/global/Tabla';
import { Producto, ProductoFormData } from '@/types/inventario/Producto';

const searchableFields = [
  'nombre',
  'descripcion',
  'categoria_info.nombre',
  'unidadP_info.nombre',
  'estado_display',
];

export default function Productos({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const { productos, loading: productosLoading, error: productosError, refetch } = useProductos();
  const { registrarProducto, loading: registerLoading, error: registerError } = useRegistrarProducto();
  const { categorias, unidades, loading: optionsLoading, error: optionsError } = useProductoOptions();

  const defaultFormData: ProductoFormData = {
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
  };

  const [formData, setFormData] = useState<ProductoFormData>(defaultFormData);

  const handleChange = (field: keyof ProductoFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await registrarProducto(formData, !!editando?.id, editando?.id); // ← soporte para editar
      setIsModalOpen(false);
      setFormData(defaultFormData);
      setEditando(null);
      refetch();
    } catch (err) {
      console.error('Error al registrar producto:', err);
    }
  };

  const handleEdit = (producto: Producto) => {
  setEditando(producto);

  setFormData({
    nombre: producto.nombre || '',
    descripcion: producto.descripcion || '',
    categoria: producto.categoria_info?.id.toString() || '',
    unidadP: producto.unidadP_info?.id.toString() || '',
    estado: producto.estado || 'disponible',
    stock: producto.stock || false,
    reservas: producto.reservas || false,
    hora_limite_reserva: producto.hora_limite_reserva || '',
    stock_actual: producto.stock_actual ?? undefined,
    max_reservas: producto.max_reservas ?? undefined,
    precio_compra: producto.precio_compra.toString() || '',
    tiene_descuento: producto.tiene_descuento || false,
    porcentaje_descuento: producto.porcentaje_descuento?.toString() || '',
    tiene_comision: producto.tiene_comision || false,
    comision: producto.comision?.toString() || '',
    unidad_comision_destino: producto.unidad_comision_destino?.toString() || '',
    imagen: null, // no se edita imagen por defecto
    unidad_medida_base: producto.unidad_medida_base || 'unidad',
  });

  setIsModalOpen(true);
};
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
    {
      uid: 'imagen_url',
      name: 'Imagen',
      render: (url: string) =>
      url ? <img src={url} alt="Producto" className="h-10 w-10 object-cover rounded" /> : 'Sin imagen',
},

    {
      uid: 'acciones',
      name: 'Acciones',
      render: (_: any, row: Producto) => (
        <Button isIconOnly size="sm" onPress={() => handleEdit(row)}>
          <FaEdit />
        </Button>
      ),
    },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
      isNavbarOpen ? 'ml-64' : 'ml-16'
    } flex items-center justify-center`}>
      <Card className="w-full max-w-6xl">
        <CardBody className="flex flex-col p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lista de Productos</h1>
            <Button
              onPress={() => {
                setFormData(defaultFormData);
                setEditando(null);
                setIsModalOpen(true);
              }}
              color="primary"
              startContent={<FaPlus />}
            >
              Registrar
            </Button>
          </div>

          {productosLoading && <p className="text-gray-500">Cargando productos...</p>}
          {(productosError || optionsError) && <p className="text-red-500 mb-4">{productosError || optionsError}</p>}
          {productos?.length === 0 && !productosLoading && !productosError && (
            <p className="text-gray-500 mb-4">No hay productos para mostrar.</p>
          )}

          {productos && (
            <Tabla
              columns={columns}
              data={productos}
              searchableFields={searchableFields}
              extraControls={null}
            />
          )}

          <Modal isOpen={isModalOpen} onClose={() => {
            setIsModalOpen(false);
            setEditando(null);
            setFormData(defaultFormData);
          }}>
            <ModalContent>
              <ModalHeader>{editando ? 'Editar Producto' : 'Registrar Producto'}</ModalHeader>
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
