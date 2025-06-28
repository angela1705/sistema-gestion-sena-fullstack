import { Button, Input } from '@nextui-org/react';
import { Select, SelectItem } from '@heroui/select';
import { TransaccionCreateData } from '../../types/gestion_operativa/transaccion';
import { useProductos } from '../../hook/inventario/useProductos';

interface TransaccionFormProps {
  formData: TransaccionCreateData;
  usuarios: { id: number; first_name: string }[];
  productos: { id: number; nombre: string }[]; // Aseguramos que productos sea obligatorio
  onChange: (field: keyof TransaccionCreateData, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  usuariosLoading?: boolean;
  productosLoading?: boolean;
}

export const TransaccionForm = ({
  formData,
  usuarios = [],
  productos = [], // Valor por defecto para evitar errores
  onChange,
  onSubmit,
  loading,
  error,
  usuariosLoading = false,
  productosLoading = false,
}: TransaccionFormProps) => {
  console.log('Usuarios en formulario:', usuarios); // Depuración
  console.log('Productos en formulario:', productos); // Depuración

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 p-2 rounded bg-red-50 mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Tipo de Transacción*</label>
        <Select
          label="Tipo de Transacción"
          selectedKeys={formData.tipo ? [formData.tipo] : []}
          onChange={(e) => onChange('tipo', e.target.value)}
          className="w-full"
          isRequired
        >
          <SelectItem key="venta" textValue="Venta">Venta</SelectItem>
          <SelectItem key="compra" textValue="Compra">Compra</SelectItem>
        </Select>
      </div>

      <Input
        label="Cantidad*"
        value={formData.cantidad?.toString() || ''}
        onChange={(e) => onChange('cantidad', parseInt(e.target.value) || 1)}
        isRequired
        type="number"
        className="w-full"
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Usuario*</label>
        <Select
          label="Usuario"
          selectedKeys={formData.usuario ? [formData.usuario.toString()] : []}
          onChange={(e) => onChange('usuario', parseInt(e.target.value))}
          className="w-full"
          isRequired
          isLoading={usuariosLoading}
          isDisabled={usuariosLoading || (usuarios.length === 0 && !usuariosLoading)}
        >
          {Array.isArray(usuarios) && usuarios.length > 0 ? (
            usuarios.map((usuario) => (
              <SelectItem key={usuario.id.toString()} textValue={usuario.first_name}>
                {usuario.first_name}
              </SelectItem>
            ))
          ) : (
            <SelectItem key="no-usuarios" textValue="No hay usuarios disponibles" isDisabled>
              No hay usuarios disponibles
            </SelectItem>
          )}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Producto*</label>
        <Select
          label="Producto"
          selectedKeys={formData.producto ? [formData.producto.toString()] : []}
          onChange={(e) => onChange('producto', parseInt(e.target.value))}
          className="w-full"
          isRequired
          isLoading={productosLoading}
          isDisabled={productosLoading || (productos.length === 0 && !productosLoading)}
        >
          {Array.isArray(productos) && productos.length > 0 ? (
            productos.map((producto) => (
              <SelectItem key={producto.id.toString()} textValue={producto.nombre}>
                {producto.nombre}
              </SelectItem>
            ))
          ) : (
            <SelectItem key="no-productos" textValue="No hay productos disponibles" isDisabled>
              No hay productos disponibles
            </SelectItem>
          )}
        </Select>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          color="primary"
          onPress={onSubmit}
          isLoading={loading}
          isDisabled={loading || !formData.tipo || !formData.cantidad || !formData.usuario || !formData.producto}
          className="w-full md:w-auto"
        >
          {loading ? 'Registrando...' : 'Guardar Transacción'}
        </Button>
      </div>
    </div>
  );
}