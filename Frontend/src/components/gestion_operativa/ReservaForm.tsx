// components/gestion_operativa/ReservaForm.tsx
import { Button, Input } from '@nextui-org/react';
import { Select, SelectItem } from '@heroui/select';
import { ReservaCreateData } from '../../types/gestion_operativa/reserva';
import { PersonaOption, ProductoOption } from '../../hook/gestion_operativa/useReservaOptions';

interface ReservaFormProps {
  formData: ReservaCreateData;
  personas: PersonaOption[];
  productos: ProductoOption[];
  onChange: (field: keyof ReservaCreateData, value: string | number | undefined) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  optionsLoading: boolean;
  isRegister?: boolean;
}

export const ReservaForm = ({
  formData,
  personas = [],
  productos = [],
  onChange,
  onSubmit,
  loading,
  error,
  optionsLoading,
  isRegister = true,
}: ReservaFormProps) => {
  console.log('ReservaForm - Personas:', personas);
  console.log('ReservaForm - Productos:', productos);
  console.log('ReservaForm - FormData:', formData);
  console.log('ReservaForm - OptionsLoading:', optionsLoading);
  console.log('ReservaForm - Error:', error);

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 p-2 rounded bg-red-50 mb-4">
          {error}
        </div>
      )}

      {isRegister && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Persona*</label>
            <Select
              label="Seleccione una Persona"
              selectedKeys={formData.persona ? [formData.persona.toString()] : []}
              onChange={(e) => {
                console.log('Select Persona onChange - Value:', e.target.value);
                onChange('persona', e.target.value ? parseInt(e.target.value) : undefined);
              }}
              className="w-full"
              isRequired
              isLoading={optionsLoading}
              isDisabled={optionsLoading || personas.length === 0}
              placeholder={personas.length === 0 ? 'No hay personas disponibles' : 'Elija una persona'}
            >
              {personas.length > 0 ? (
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
            {personas.length === 0 && !optionsLoading && (
              <p className="text-red-500 text-sm mt-1">
                No hay personas disponibles. Verifique la conexión con el servidor o añada personas en el sistema.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Producto*</label>
            <Select
              label="Seleccione un Producto"
              selectedKeys={formData.producto ? [formData.producto.toString()] : []}
              onChange={(e) => {
                console.log('Select Producto onChange - Value:', e.target.value);
                onChange('producto', e.target.value ? parseInt(e.target.value) : undefined);
              }}
              className="w-full"
              isRequired
              isLoading={optionsLoading}
              isDisabled={optionsLoading || productos.length === 0}
              placeholder={productos.length === 0 ? 'No hay productos disponibles' : 'Elija un producto'}
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
            {productos.length === 0 && !optionsLoading && (
              <p className="text-red-500 text-sm mt-1">
                No hay productos disponibles. Verifique la conexión con el servidor o añada productos en el sistema.
              </p>
            )}
          </div>

          <Input
            label="Cantidad*"
            value={formData.cantidad?.toString() || ''}
            onChange={(e) => onChange('cantidad', e.target.value ? parseInt(e.target.value) : undefined)}
            isRequired
            type="number"
            min="1"
            className="w-full"
            placeholder="1"
          />
        </>
      )}

      <div className="flex justify-end pt-4">
        <Button
          color="primary"
          onPress={onSubmit}
          isLoading={loading}
          isDisabled={loading || !formData.persona || !formData.producto || !formData.cantidad || formData.cantidad <= 0}
          className="w-full md:w-auto"
        >
          {loading ? 'Registrando...' : 'Registrar Reserva'}
        </Button>
      </div>
    </div>
  );
};