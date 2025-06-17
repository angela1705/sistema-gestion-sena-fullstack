
// src/components/gestion_operativa/ReservaForm.tsx
import { Button, Input } from '@nextui-org/react';
import { Select, SelectItem } from '@heroui/select';
import { ReservaCreateData } from '../../types/gestion_operativa/reserva';

interface ReservaFormProps {
  formData: ReservaCreateData;
  personas: { id: number; first_name: string }[];
  productos: { id: number; nombre: string }[];
  onChange: (field: keyof ReservaCreateData, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  personasLoading?: boolean;
  productosLoading?: boolean;
}

export const ReservaForm = ({
  formData,
  personas = [],
  productos = [],
  onChange,
  onSubmit,
  loading,
  error,
  personasLoading = false,
  productosLoading = false,
}: ReservaFormProps) => {
  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 p-2 rounded bg-red-50 mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Persona*</label>
        <Select
          label="Persona"
          selectedKeys={formData.persona ? [formData.persona.toString()] : []}
          onChange={(e) => onChange('persona', parseInt(e.target.value))}
          className="w-full"
          isRequired
          isLoading={personasLoading}
          isDisabled={personasLoading || (personas.length === 0 && !personasLoading)}
        >
          {Array.isArray(personas) && personas.length > 0 ? (
            personas.map((persona) => (
              <SelectItem key={persona.id.toString()} textValue={persona.first_name}>
                {persona.first_name}
              </SelectItem>
            ))
          ) : (
            <SelectItem key="no-personas" textValue="No hay personas disponibles" isDisabled>
              No hay personas disponibles
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

      <Input
        label="Cantidad*"
        value={formData.cantidad?.toString() || ''}
        onChange={(e) => onChange('cantidad', parseInt(e.target.value) || 1)}
        isRequired
        type="number"
        className="w-full"
      />

      <div className="flex justify-end pt-4">
        <Button
          color="primary"
          onPress={onSubmit}
          isLoading={loading}
          isDisabled={loading || !formData.persona || !formData.producto || !formData.cantidad}
          className="w-full md:w-auto"
        >
          {loading ? 'Registrando...' : 'Registrar Reserva'}
        </Button>
      </div>
    </div>
  );
}