
// src/components/gestion_operativa/caja_diaria/CajaDiariaForm.tsx
import { Button, Input, Select, SelectItem } from '@nextui-org/react';
import { CajaDiariaCierreData } from '../../types/gestion_operativa/caja_diaria';

interface CajaDiariaFormProps {
  formData: CajaDiariaCierreData & { unidadProductiva?: number; saldo_inicial?: number };
  unidadProductivas: { id: number; nombre: string }[];
  onChange: (field: keyof (CajaDiariaCierreData & { unidadProductiva?: number; saldo_inicial?: number }), value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  isRegister?: boolean; // Modo registro o cierre
  unidadesLoading?: boolean;
}

export const CajaDiariaForm = ({
  formData,
  unidadProductivas = [],
  onChange,
  onSubmit,
  loading,
  error,
  isRegister = false,
  unidadesLoading = false,
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
              selectedKeys={formData.unidadProductiva ? [formData.unidadProductiva.toString()] : []}
              onChange={(e) => onChange('unidadProductiva', parseInt(e.target.value))}
              className="w-full"
              isRequired
              isLoading={unidadesLoading}
              isDisabled={unidadesLoading}
            >
              {unidadProductivas.map((unidad) => (
                <SelectItem key={unidad.id.toString()} value={unidad.id}>
                  {unidad.nombre}
                </SelectItem>
              ))}
            </Select>
          </div>

          <Input
            label="Saldo Inicial*"
            value={formData.saldo_inicial?.toString() || ''}
            onChange={(e) => onChange('saldo_inicial', parseFloat(e.target.value) || 0)}
            isRequired
            type="number"
            className="w-full"
          />
        </>
      )}

      {!isRegister && (
        <Input
          label="Saldo Final*"
          value={formData.saldo_final?.toString() || ''}
          onChange={(e) => onChange('saldo_final', parseFloat(e.target.value) || 0)}
          isRequired
          type="number"
          className="w-full"
        />
      )}

      <Input
        label="Observaciones"
        value={formData.observaciones || ''}
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