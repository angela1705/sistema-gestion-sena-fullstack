
import { Button, Input } from '@nextui-org/react';
import { Select, SelectItem } from '@heroui/select';
import { UnidadProductivaFormData } from '../../types/entidades/UnidadProductiva';

interface UnidadProductivaFormProps {
  formData: UnidadProductivaFormData;
  sedes: { id: number; nombre_display: string }[];
  encargados: { id: number; nombre_completo: string }[];
  onChange: (field: keyof UnidadProductivaFormData, value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  optionsLoading: boolean;
}

export const RegistrarUnidadProductivaForm = ({
  formData,
  sedes = [],
  encargados = [],
  onChange,
  onSubmit,
  loading,
  error,
  optionsLoading,
}: UnidadProductivaFormProps) => {
  const tipoOptions = [
    { value: 'agricola', label: 'Agrícola' },
    { value: 'pecuaria', label: 'Pecuaria' },
    { value: 'industrial', label: 'Industrial' },
  ];

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 p-2 rounded bg-red-50 mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Seleccione el tipo*</label>
        <div className="flex gap-2">
          {tipoOptions.map((option) => (
            <Button
              key={option.value}
              variant={formData.tipo === option.value ? 'solid' : 'bordered'}
              color="primary"
              onPress={() => onChange('tipo', option.value)}
              className="flex-1"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <Input
        label="Nombre*"
        value={formData.nombre}
        onChange={(e) => onChange('nombre', e.target.value)}
        isRequired
        className="w-full"
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Sede*</label>
        <Select
          label="Sede"
          selectedKeys={formData.sede ? [formData.sede] : []}
          onChange={(e) => onChange('sede', e.target.value)}
          className="w-full"
          isRequired
          isLoading={optionsLoading}
          isDisabled={optionsLoading || !sedes.length}
        >
          {Array.isArray(sedes) && sedes.length > 0 ? (
            sedes.map((sede) => (
              <SelectItem key={sede.id.toString()} textValue={sede.nombre_display}>
                {sede.nombre_display}
              </SelectItem>
            ))
          ) : (
            <SelectItem key="no-sedes" textValue="No hay sedes disponibles" isDisabled>
              No hay sedes disponibles
            </SelectItem>
          )}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Encargado*</label>
        <Select
          label="Encargado"
          selectedKeys={formData.encargado ? [formData.encargado] : []}
          onChange={(e) => onChange('encargado', e.target.value)}
          className="w-full"
          isRequired
          isLoading={optionsLoading}
          isDisabled={optionsLoading || !encargados.length}
        >
          {Array.isArray(encargados) && encargados.length > 0 ? (
            encargados.map((encargado) => (
              <SelectItem key={encargado.id.toString()} textValue={encargado.nombre_completo}>
                {encargado.nombre_completo}
              </SelectItem>
            ))
          ) : (
            <SelectItem key="no-encargados" textValue="No hay encargados disponibles" isDisabled>
              No hay encargados disponibles
            </SelectItem>
          )}
        </Select>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          color="primary"
          onPress={onSubmit}
          isLoading={loading}
          isDisabled={
            loading ||
            !formData.nombre ||
            !formData.tipo ||
            !formData.sede ||
            !formData.encargado
          }
          className="w-full md:w-auto"
        >
          {loading ? 'Guardando...' : 'Guardar Unidad'}
        </Button>
      </div>
    </div>
  );
};
