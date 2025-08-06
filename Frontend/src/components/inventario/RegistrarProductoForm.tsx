// components/inventario/RegistrarProductoForm.tsx
import { Input, Checkbox } from '@nextui-org/react';
import Formulario from '@/components/global/Formulario';
import { ProductoFormData } from '@/types/inventario/Producto';
import { Button } from '@nextui-org/react';

interface Props {
  formData: ProductoFormData;
  categorias: any[];
  unidades: any[];
  onChange: (field: keyof ProductoFormData, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  optionsLoading: boolean;
}

export const RegistrarProductoForm = ({
  formData,
  categorias,
  unidades,
  onChange,
  onSubmit,
  loading,
  error,
  optionsLoading,
}: Props) => {
  return (
    <Formulario title="Formulario de Producto" onSubmit={onSubmit}>
      <Input label="Nombre" value={formData.nombre} onChange={(e) => onChange('nombre', e.target.value)} />
      <Input label="Descripción" value={formData.descripcion} onChange={(e) => onChange('descripcion', e.target.value)} />

      {/* Select nativo: Categoría */}
      <label className="block text-sm font-medium text-gray-700">Categoría</label>
      <select
        value={formData.categoria}
        onChange={(e) => onChange('categoria', e.target.value)}
        disabled={optionsLoading}
        className="w-full border rounded p-2"
      >
        <option value="">Selecciona una categoría</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nombre}
          </option>
        ))}
      </select>

      {/* Select nativo: Unidad Productiva */}
      <label className="block text-sm font-medium text-gray-700">Unidad Productiva</label>
      <select
        value={formData.unidadP}
        onChange={(e) => onChange('unidadP', e.target.value)}
        disabled={optionsLoading}
        className="w-full border rounded p-2"
      >
        <option value="">Selecciona una unidad productiva</option>
        {unidades.map((up) => (
          <option key={up.id} value={up.id}>
            {up.tipo_display}
          </option>
        ))}
      </select>

      {/* Estado */}
      <label className="block text-sm font-medium text-gray-700">Estado</label>
      <select
        value={formData.estado}
        onChange={(e) => onChange('estado', e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="disponible">Disponible</option>
        <option value="no_disponible">No disponible</option>
      </select>

      <Input
        label="Precio de Compra"
        type="number"
        value={formData.precio_compra}
        onChange={(e) => onChange('precio_compra', e.target.value)}
      />

      <Checkbox isSelected={formData.tiene_descuento} onValueChange={(v) => onChange('tiene_descuento', v)}>
        ¿Tiene Descuento?
      </Checkbox>
      {formData.tiene_descuento && (
        <Input
          label="Porcentaje Descuento"
          type="number"
          value={formData.porcentaje_descuento || ''}
          onChange={(e) => onChange('porcentaje_descuento', e.target.value)}
        />
      )}

      <Checkbox isSelected={formData.stock} onValueChange={(v) => onChange('stock', v)}>
        ¿Maneja Stock?
      </Checkbox>
      {formData.stock && (
        <Input
          label="Stock Actual"
          type="number"
          value={formData.stock_actual?.toString() || ''}
          onChange={(e) => onChange('stock_actual', parseInt(e.target.value))}
        />
      )}

      <Checkbox isSelected={formData.reservas} onValueChange={(v) => onChange('reservas', v)}>
        ¿Permite Reservas?
      </Checkbox>
      {formData.reservas && (
        <>
          <Input
            label="Hora Límite"
            type="time"
            value={formData.hora_limite_reserva || ''}
            onChange={(e) => onChange('hora_limite_reserva', e.target.value)}
          />
          <Input
            label="Máx Reservas"
            type="number"
            value={formData.max_reservas?.toString() || ''}
            onChange={(e) => onChange('max_reservas', parseInt(e.target.value))}
          />
        </>
      )}

      <Checkbox isSelected={formData.tiene_comision} onValueChange={(v) => onChange('tiene_comision', v)}>
        ¿Tiene Comisión?
      </Checkbox>
      {formData.tiene_comision && (
        <>
          <Input
            label="Comisión (%)"
            type="number"
            value={formData.comision || ''}
            onChange={(e) => onChange('comision', e.target.value)}
          />
          <label className="block text-sm font-medium text-gray-700">Unidad que recibe la comisión</label>
          <select
            value={formData.unidad_comision_destino}
            onChange={(e) => onChange('unidad_comision_destino', e.target.value)}
            disabled={optionsLoading}
            className="w-full border rounded p-2"
          >
            <option value="">Selecciona una unidad</option>
            {unidades.map((up) => (
              <option key={up.id} value={up.id}>
                {up.nombre}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Imagen */}
      <label className="block text-sm font-medium text-gray-700">Imagen</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange('imagen', e.target.files?.[0] || null)}
        className="w-full border rounded p-2"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" isLoading={loading} color="primary" fullWidth>
        Guardar
      </Button>
    </Formulario>
  );
};
