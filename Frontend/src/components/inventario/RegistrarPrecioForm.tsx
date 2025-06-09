
import { Button, Input } from '@nextui-org/react';
import { Select, SelectItem } from '@heroui/select';
import { PrecioFormData } from '../../types/inventario/Precio';

interface PrecioFormProps {
  formData: PrecioFormData;
  productos: { id: number; nombre: string }[];
  cargos: { id: number; nombre: string }[];
  onChange: (field: keyof PrecioFormData, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  optionsLoading: boolean;
}

export const RegistrarPrecioForm = ({
  formData,
  productos = [],
  cargos = [],
  onChange,
  onSubmit,
  loading,
  error,
  optionsLoading,
}: PrecioFormProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {error && (
        <div className="col-span-2 text-red-500 p-2 rounded bg-red-50 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Producto*</label>
          <Select
            label="Producto"
            selectedKeys={formData.producto ? [formData.producto] : []}
            onChange={(e) => onChange('producto', e.target.value)}
            className="w-full"
            isRequired
            isLoading={optionsLoading}
            isDisabled={optionsLoading || !productos.length}
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

        {/* Columna derecha */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Cargo*</label>
          <Select
            label="Cargo"
            selectedKeys={formData.cargo ? [formData.cargo] : []}
            onChange={(e) => onChange('cargo', e.target.value)}
            className="w-full"
            isRequired
            isLoading={optionsLoading}
            isDisabled={optionsLoading || !cargos.length}
          >
            {cargos.length > 0 ? (
              cargos.map((cargo) => (
                <SelectItem key={cargo.id.toString()} textValue={cargo.nombre}>
                  {cargo.nombre}
                </SelectItem>
              ))
            ) : (
              <SelectItem key="no-cargos" textValue="No hay cargos disponibles" isDisabled>
                No hay cargos disponibles
              </SelectItem>
            )}
          </Select>
        </div>

        <Input
          label="Valor*"
          type="number"
          value={formData.valor}
          onChange={(e) => onChange('valor', e.target.value)}
          isRequired
          className="w-full"
          min="0.01"
          step="0.01"
        />

        {/* Botón abarca ambas columnas */}
        <div className="col-span-1 md:col-span-2 flex justify-end pt-4">
          <Button
            color="primary"
            onPress={onSubmit}
            isLoading={loading}
            isDisabled={
              loading || !formData.cargo || !formData.producto || !formData.valor
            }
            className="w-full md:w-auto"
          >
            {loading ? 'Guardando...' : 'Guardar Precio'}
          </Button>
        </div>
      </div>
    </div>
  );
};