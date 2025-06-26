import React from 'react';
import { Button, Input, Select, SelectItem } from '@nextui-org/react';
import { ReservaCreateData } from '../../types/gestion_operativa/reserva';

interface ReservaFormProps {
  formData: ReservaCreateData;
  personas: { id: number; first_name: string }[];
  productos: { id: number; nombre: string }[];
  onChange: (field: keyof ReservaCreateData, value: number | undefined) => void;
  onSubmit: () => void;
  loading: boolean;
  error?: string | null;
  personasLoading: boolean;
  productosLoading: boolean;
  selectedReservaId?: number | null;
}

const ReservaForm: React.FC<ReservaFormProps> = ({
  formData,
  personas,
  productos,
  onChange,
  onSubmit,
  loading,
  error,
  personasLoading,
  productosLoading,
  selectedReservaId,
}) => {
  const isCancelMode = selectedReservaId !== null && selectedReservaId !== undefined;

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      {!isCancelMode && ( // Solo muestra campos si no es modo cancelar
        <>
          <Select
            label="Persona"
            placeholder="Selecciona una persona"
            selectedKeys={formData.persona ? [formData.persona.toString()] : []}
            onChange={(e) => onChange('persona', parseInt(e.target.value) || undefined)}
            isLoading={personasLoading}
            isDisabled={loading}
          >
            {personas.map((persona) => (
              <SelectItem key={persona.id.toString()} value={persona.id}>
                {persona.first_name}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Producto"
            placeholder="Selecciona un producto"
            selectedKeys={formData.producto ? [formData.producto.toString()] : []}
            onChange={(e) => onChange('producto', parseInt(e.target.value) || undefined)}
            isLoading={productosLoading}
            isDisabled={loading}
          >
            {productos.map((producto) => (
              <SelectItem key={producto.id.toString()} value={producto.id}>
                {producto.nombre}
              </SelectItem>
            ))}
          </Select>

          <Input
            type="number"
            label="Cantidad"
            value={formData.cantidad?.toString() || ''}
            onChange={(e) => onChange('cantidad', parseInt(e.target.value) || undefined)}
            isDisabled={loading}
            min={1}
          />
        </>
      )}

      <Button
        color="primary"
        onPress={onSubmit}
        isLoading={loading}
        disabled={!formData.persona || !formData.producto || !formData.cantidad || formData.cantidad <= 0}
      >
        Registrar Reserva
      </Button>
    </form>
  );
};

export default ReservaForm; // Exportación por defecto