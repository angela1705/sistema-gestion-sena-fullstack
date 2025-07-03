
// src/components/gestion_operativa/caja_diaria/CajaDiariaForm.tsx
import { Button, Input } from '@nextui-org/react';
import { Select, SelectItem } from '@heroui/select';
import { CajaDiariaFormData} from '../../types/gestion_operativa/caja_diaria';

interface CajaDiariaFormProps {
  formData: CajaDiariaFormData;
  unidades: { id: number; nombre: string }[];
  onChange: (field: keyof CajaDiariaFormData, value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  optionsLoading: boolean;
  isRegister?: boolean;
}

export const CajaDiariaForm = ({
  formData,
  unidades = [],
  onChange,
  onSubmit,
  loading,
  error,
  optionsLoading,
  isRegister = false,
}: CajaDiariaFormProps) => {
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
            <label className="text-sm font-medium">Unidad Productiva*</label>
            <Select
              label="Unidad Productiva"
              selectedKeys={formData.unidadProductiva ? [formData.unidadProductiva] : []}
              onChange={(e) => onChange('unidadProductiva', e.target.value)}
              className="w-full"
              isRequired
              isLoading={optionsLoading}
              isDisabled={optionsLoading || !unidades.length}
            >
              {Array.isArray(unidades) && unidades.length > 0 ? (
                unidades.map((unidad) => (
                  <SelectItem key={unidad.id.toString()} textValue={unidad.nombre}>
                    {unidad.nombre}
                  </SelectItem>
                ))
              ) : (
                <SelectItem key="no-unidades" textValue="No hay unidades disponibles" isDisabled>
                  No hay unidades disponibles
                </SelectItem>
              )}
            </Select>
          </div>

          <Input
            label="Saldo Inicial*"
            value={formData.saldo_inicial || ''}
            onChange={(e) => onChange('saldo_inicial', e.target.value)}
            isRequired
            type="number"
            className="w-full"
          />
        </>
      )}

      {!isRegister && (
        <Input
          label="Saldo Final*"
          value={formData.saldo_final.toString() || ''}
          onChange={(e) => onChange('saldo_final', e.target.value)}
          isRequired
          type="number"
          className="w-full"
        />
      )}

      <Input
        label="Observaciones"
        value={formData.observaciones}
        onChange={(e) => onChange('observaciones', e.target.value)}
        className="w-full"
      />

      <div className="flex justify-end pt-4">
        <Button
          color="primary"
          onPress={onSubmit}
          isLoading={loading}
          isDisabled={loading || (isRegister ? (!formData.unidadProductiva || !formData.saldo_inicial) : !formData.saldo_final)}
          className="w-full md:w-auto"
        >
          {loading ? (isRegister ? 'Registrando...' : 'Cerrando...') : (isRegister ? 'Registrar Caja' : 'Cerrar Caja')}
        </Button>
      </div>
    </div>
  );
};