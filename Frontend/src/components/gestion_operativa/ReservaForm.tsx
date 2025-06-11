
// src/components/gestion_operaciones/reserva/ReservaForm.tsx
import { Button, Input, Select, SelectItem } from '@nextui-org/react';
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
          isDisabled={personasLoading}
        >
          {personas.map((persona) => (
            <SelectItem key={persona.id.toString()} value={persona.id}>
              {persona.first_name}
            </SelectItem>
          ))}
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
          isDisabled={productosLoading}
        >
          {productos.map((producto) => (
            <SelectItem key={producto.id.toString()} value={producto.id}>
              {producto.nombre}
            </SelectItem>
          ))}
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
};