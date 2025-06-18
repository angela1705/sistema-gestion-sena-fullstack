
// src/components/gestion_operativa/DetalleCajaForm.tsx
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
  transaccionesLoading?: boolean;
  cajaDiariasLoading?: boolean;
}

export const DetalleCajaForm = ({
  formData,
  onChange,
  onSubmit,
  loading,
  error,
  transaccionesLoading = false,
  cajaDiariasLoading = false,
}: DetalleCajaFormProps) => {
  const { transacciones = [], loading: transLoading } = useTransaccion();
  const { cajaDiarias = [], loading: cajaLoading } = useCajaDiaria();

  const tipoOptions = [
    { value: Tipo.INGRESO, label: 'Ingreso' },
    { value: Tipo.EGRESO, label: 'Egreso' },
    { value: Tipo.VENTA, label: 'Venta' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {error && (
        <div className="col-span-2 text-red-500 p-2 rounded bg-red-50 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Transacción*</label>
          <Select
            label="Transacción"
            selectedKeys={formData.transaccion ? [formData.transaccion.toString()] : []}
            onChange={(e) => onChange('transaccion', parseInt(e.target.value))}
            className="w-full"
            isRequired
            isLoading={transaccionesLoading || transLoading}
            isDisabled={(transaccionesLoading || transLoading) || (transacciones.length === 0 && !transaccionesLoading && !transLoading)}
          >
            {Array.isArray(transacciones) && transacciones.length > 0 ? (
              transacciones.map((transaccion) => (
                <SelectItem key={transaccion.id.toString()} textValue={transaccion.descripcion || transaccion.id.toString()}>
                  {transaccion.descripcion || `Transacción ${transaccion.id}`}
                </SelectItem>
              ))
            ) : (
              <SelectItem key="no-transacciones" textValue="No hay transacciones disponibles" isDisabled>
                No hay transacciones disponibles
              </SelectItem>
            )}
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Caja Diaria*</label>
          <Select
            label="Caja Diaria"
            selectedKeys={formData.caja_diaria ? [formData.caja_diaria.toString()] : []}
            onChange={(e) => onChange('caja_diaria', parseInt(e.target.value))}
            className="w-full"
            isRequired
            isLoading={cajaDiariasLoading || cajaLoading}
            isDisabled={(cajaDiariasLoading || cajaLoading) || (cajaDiarias.length === 0 && !cajaDiariasLoading && !cajaLoading)}
          >
            {Array.isArray(cajaDiarias) && cajaDiarias.length > 0 ? (
              cajaDiarias.map((caja) => (
                <SelectItem key={caja.id.toString()} textValue={caja.descripcion || caja.id.toString()}>
                  {caja.descripcion || `Caja ${caja.id}`}
                </SelectItem>
              ))
            ) : (
              <SelectItem key="no-cajas" textValue="No hay cajas disponibles" isDisabled>
                No hay cajas disponibles
              </SelectItem>
            )}
          </Select>
        </div>

        <Input
          label="Monto*"
          value={formData.monto?.toString() || '0'}
          onChange={(e) => onChange('monto', parseFloat(e.target.value) || 0)}
          isRequired
          type="number"
          step="0.01"
          min="0"
          className="w-full"
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Tipo*</label>
          <Select
            label="Tipo"
            selectedKeys={formData.tipo ? [formData.tipo] : []}
            onChange={(e) => onChange('tipo', e.target.value as Tipo)}
            className="w-full"
            isRequired
          >
            {tipoOptions.map((option) => (
              <SelectItem key={option.value} textValue={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <Input
          label="Descripción*"
          value={formData.descripcion || ''}
          onChange={(e) => onChange('descripcion', e.target.value)}
          isRequired
          className="w-full col-span-1 md:col-span-2"
          type="textarea"
        />

        <div className="col-span-1 md:col-span-2 flex justify-end pt-4">
          <Button
            color="primary"
            onPress={onSubmit}
            isLoading={loading}
            isDisabled={loading || !formData.transaccion || !formData.caja_diaria || !formData.monto || !formData.tipo || !formData.descripcion}
            className="w-full md:w-auto"
          >
            {loading ? 'Guardando...' : 'Guardar Detalle de Caja'}
          </Button>
        </div>
      </div>
    </div>
  );
};