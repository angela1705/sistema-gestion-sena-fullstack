import { Button, Input } from '@nextui-org/react';
import { Select, SelectItem } from '@heroui/select';
import { DetalleCajaCreateData, Tipo } from '../../types/gestion_operativa/detalle_caja';
import { useTransaccion } from '../../hook/gestion_operativa/useTransaccion';
import { useCajaDiaria } from '../../hook/gestion_operativa/useCajaDiaria';

interface DetalleCajaFormProps {
  formData: DetalleCajaCreateData;
  onChange: (field: keyof DetalleCajaCreateData, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export const DetalleCajaForm = ({
  formData,
  onChange,
  onSubmit,
  loading,
  error,
}: DetalleCajaFormProps) => {
  const { cajas = [], loading: cajaLoading } = useCajaDiaria();
  const { transacciones = [], loading: transLoading } = useTransaccion();

  const tipoOptions = [
    { value: Tipo.INGRESO, label: 'Ingreso' },
    { value: Tipo.EGRESO, label: 'Egreso' },
  ];

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 p-2 rounded bg-red-50 mb-4">
          {error}
        </div>
      )}

      <Select
        label="Caja Diaria*"
        selectedKeys={formData.caja ? [formData.caja.toString()] : []}
        onChange={(e) => onChange('caja', e.target.value ? parseInt(e.target.value) : null)}
        isRequired
        isLoading={cajaLoading}
        isDisabled={cajaLoading || cajas.length === 0}
      >
        {Array.isArray(cajas) && cajas.length > 0 ? (
          cajas.map((caja) => (
            <SelectItem key={caja.id.toString()} textValue={caja.id.toString()}>
              {`Caja ${caja.id}`}
            </SelectItem>
          ))
        ) : (
          <SelectItem key="no-cajas" textValue="No hay cajas disponibles" isDisabled>
            No hay cajas disponibles
          </SelectItem>
        )}
      </Select>

      <Select
        label="Transacción*"
        selectedKeys={formData.transaccion ? [formData.transaccion.toString()] : []}
        onChange={(e) => onChange('transaccion', e.target.value ? parseInt(e.target.value) : null)}
        isRequired
        isLoading={transLoading}
        isDisabled={transLoading || transacciones.length === 0}
      >
        {Array.isArray(transacciones) && transacciones.length > 0 ? (
          transacciones.map((transaccion) => (
            <SelectItem key={transaccion.id.toString()} textValue={transaccion.id.toString()}>
              {`Transacción ${transaccion.id}`}
            </SelectItem>
          ))
        ) : (
          <SelectItem key="no-transacciones" textValue="No hay transacciones disponibles" isDisabled>
            No hay transacciones disponibles
          </SelectItem>
        )}
      </Select>

      <Select
        label="Tipo*"
        selectedKeys={formData.tipo ? [formData.tipo] : []}
        onChange={(e) => onChange('tipo', e.target.value as Tipo)}
        isRequired
      >
        {tipoOptions.map((option) => (
          <SelectItem key={option.value} textValue={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </Select>

      <Input
        label="Monto*"
        value={formData.monto?.toString() || ''}
        onChange={(e) => onChange('monto', parseFloat(e.target.value) || 0)}
        isRequired
        type="number"
        step="0.01"
        min="0"
      />

      <Input
        label="Descripción*"
        value={formData.descripcion || ''}
        onChange={(e) => onChange('descripcion', e.target.value)}
        isRequired
        type="text"
      />

      <div className="flex justify-end pt-4">
        <Button
          color="primary"
          onPress={onSubmit}
          isLoading={loading}
          isDisabled={
            loading ||
            !formData.caja ||
            !formData.transaccion ||
            !formData.tipo ||
            formData.monto === undefined ||
            formData.monto < 0 ||
            !formData.descripcion
          }
          className="w-full md:w-auto"
        >
          {loading ? 'Guardando...' : 'Guardar Detalle de Caja'}
        </Button>
      </div>
    </div>
  );
};