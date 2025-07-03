import React from 'react';
import { Button, Input, Select, SelectItem } from '@heroui/react';
import { FaPlus } from 'react-icons/fa';

interface TransaccionFormProps {
  items: { producto: number; cantidad: number; monto_venta?: number }[];
  usuarioId: number | undefined;
  usuarios: { id: number; first_name: string }[];
  productos: { id: number; nombre: string }[];
  onItemChange: (index: number, field: 'producto' | 'cantidad' | 'monto_venta', value: number) => void;
  onUsuarioChange: (value: number) => void;
  onAddItem: () => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  usuariosLoading: boolean;
  productosLoading: boolean;
}

const TransaccionForm: React.FC<TransaccionFormProps> = ({
  items,
  usuarioId,
  usuarios,
  productos,
  onItemChange,
  onUsuarioChange,
  onAddItem,
  onSubmit,
  loading,
  error,
  usuariosLoading,
  productosLoading,
}) => {
  const filteredUsuarios = usuarios.filter(u =>
    u.id.toString().includes('') || u.first_name.toLowerCase().includes(''.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500 p-2 rounded bg-red-50 mb-4">{error}</div>}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Usuario*</label>
        <Select
          label="Escribe para buscar usuario"
          selectedKeys={usuarioId ? [usuarioId.toString()] : []}
          onChange={(e) => onUsuarioChange(parseInt(e.target.value) || 0)}
          className="w-full"
          isRequired
          isLoading={usuariosLoading}
          isDisabled={usuariosLoading || (usuarios.length === 0 && !usuariosLoading)}
          placeholder="Escribe ID o nombre..."
        >
          {filteredUsuarios.length > 0 ? (
            filteredUsuarios.map((usuario) => (
              <SelectItem key={usuario.id.toString()} textValue={`${usuario.id} - ${usuario.first_name}`}>
                {`${usuario.id} - ${usuario.first_name}`}
              </SelectItem>
            ))
          ) : (
            <SelectItem key="no-usuarios" textValue="No hay usuarios disponibles" isDisabled>
              No hay usuarios disponibles
            </SelectItem>
          )}
        </Select>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Producto {index + 1}*</label>
            <Select
              label="Producto"
              selectedKeys={item.producto ? [item.producto.toString()] : []}
              onChange={(e) => onItemChange(index, 'producto', parseInt(e.target.value) || 0)}
              className="w-full"
              isRequired
              isLoading={productosLoading}
              isDisabled={productosLoading || (productos.length === 0 && !productosLoading)}
            >
              {productos.length > 0 ? (
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
          <div className="w-1/4">
            <label className="text-sm font-medium">Cantidad*</label>
            <Input
              value={item.cantidad?.toString() || ''}
              onChange={(e) => onItemChange(index, 'cantidad', parseInt(e.target.value) || 1)}
              isRequired
              type="number"
              className="w-full"
            />
          </div>
          <div className="w-1/4">
            <label className="text-sm font-medium">Monto Venta*</label>
            <Input
              value={item.monto_venta?.toString() || ''}
              onChange={(e) => onItemChange(index, 'monto_venta', parseFloat(e.target.value) || 0)}
              isRequired
              type="number"
              step="0.01"
              className="w-full"
            />
          </div>
        </div>
      ))}
      <Button
        color="primary"
        onPress={onAddItem}
        startContent={<FaPlus />}
        className="w-full mt-2"
      >
        Agregar otro producto
      </Button>
      <Button
        color="primary"
        onPress={onSubmit}
        isLoading={loading}
        isDisabled={loading || !usuarioId || items.some(i => !i.producto || !i.cantidad || !i.monto_venta)}
        className="w-full mt-4"
      >
        {loading ? 'Registrando...' : 'Guardar Venta'}
      </Button>
    </div>
  );
};

export default TransaccionForm;