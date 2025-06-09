
import { Button, Input, Switch } from '@nextui-org/react';
import { Select, SelectItem } from '@heroui/select';
import { ProductoFormData } from '../../types/inventario/Producto';

interface ProductoFormProps {
  formData: ProductoFormData;
  categorias: { id: number; nombre: string }[];
  unidades: { id: number; nombre: string }[];
  onChange: (field: keyof ProductoFormData, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  optionsLoading: boolean;
}

const estadoOptions = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'no_disponible', label: 'No disponible' },
];

const tipoGestionOptions = [
  { value: 'stock', label: 'Gestión por stock' },
  { value: 'produccion', label: 'Producción diaria (almuerzos)' },
];

const unidadMedidaOptions = [
  { value: 'unidad', label: 'Unidades' },
  { value: 'gramos', label: 'Gramos' },
  { value: 'ml', label: 'Mililitros' },
  { value: 'kg', label: 'Kilogramos' },
  { value: 'litro', label: 'Litros' },
];

export const RegistrarProductoForm = ({
  formData,
  categorias = [],
  unidades = [],
  onChange,
  onSubmit,
  loading,
  error,
  optionsLoading,
}: ProductoFormProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange('imagen', file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {error && (
        <div className="col-span-2 text-red-500 p-2 rounded bg-red-50 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Columna izquierda */}
        <Input
          label="Nombre*"
          value={formData.nombre}
          onChange={(e) => onChange('nombre', e.target.value)}
          isRequired
          className="w-full"
        />

        {/* Columna derecha */}
        <Input
          label="Descripción*"
          value={formData.descripcion}
          onChange={(e) => onChange('descripcion', e.target.value)}
          isRequired
          className="w-full"
          type="textarea"
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Categoría*</label>
          <Select
            label="Categoría"
            selectedKeys={formData.categoria ? [formData.categoria] : []}
            onChange={(e) => onChange('categoria', e.target.value)}
            className="w-full"
            isRequired
            isLoading={optionsLoading}
            isDisabled={optionsLoading || !categorias.length}
          >
            {categorias.length > 0 ? (
              categorias.map((categoria) => (
                <SelectItem key={categoria.id.toString()} textValue={categoria.nombre}>
                  {categoria.nombre}
                </SelectItem>
              ))
            ) : (
              <SelectItem key="no-categorias" textValue="No hay categorías disponibles" isDisabled>
                No hay categorías disponibles
              </SelectItem>
            )}
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Unidad Productiva*</label>
          <Select
            label="Unidad Productiva"
            selectedKeys={formData.unidadP ? [formData.unidadP] : []}
            onChange={(e) => onChange('unidadP', e.target.value)}
            className="w-full"
            isRequired
            isLoading={optionsLoading}
            isDisabled={optionsLoading || !unidades.length}
          >
            {unidades.length > 0 ? (
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

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Estado*</label>
          <Select
            label="Estado"
            selectedKeys={formData.estado ? [formData.estado] : []}
            onChange={(e) => onChange('estado', e.target.value)}
            className="w-full"
            isRequired
          >
            {estadoOptions.map((option) => (
              <SelectItem key={option.value} textValue={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Tipo de Gestión*</label>
          <Select
            label="Tipo de Gestión"
            selectedKeys={formData.tipo_gestion ? [formData.tipo_gestion] : []}
            onChange={(e) => onChange('tipo_gestion', e.target.value)}
            className="w-full"
            isRequired
          >
            {tipoGestionOptions.map((option) => (
              <SelectItem key={option.value} textValue={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <Switch
          isSelected={formData.reservas}
          onValueChange={(value) => onChange('reservas', value)}
          className="w-full"
        >
          Permitir reservas
        </Switch>

        {formData.reservas && (
          <Input
            label="Hora Límite Reserva"
            type="time"
            value={formData.hora_limite_reserva || ''}
            onChange={(e) => onChange('hora_limite_reserva', e.target.value)}
            className="w-full"
          />
        )}

        {formData.tipo_gestion === 'stock' && (
          <Input
            label="Stock Actual*"
            type="number"
            value={formData.stock_actual?.toString() || ''}
            onChange={(e) => onChange('stock_actual', parseInt(e.target.value))}
            isRequired
            className="w-full"
            min="0"
          />
        )}

        {formData.tipo_gestion === 'produccion' && (
          <Input
            label="Capacidad Diaria*"
            type="number"
            value={formData.capacidad_diaria?.toString() || ''}
            onChange={(e) => onChange('capacidad_diaria', parseInt(e.target.value))}
            isRequired
            className="w-full"
            min="0"
          />
        )}

        <Input
          label="Precio Compra*"
          type="number"
          value={formData.precio_compra}
          onChange={(e) => onChange('precio_compra', e.target.value)}
          isRequired
          className="w-full"
          step="0.01"
          min="0.01"
        />

        {formData.tiene_descuento && (
          <Input
            label="Porcentaje Descuento*"
            type="number"
            value={formData.porcentaje_descuento?.toString() || ''}
            onChange={(e) => onChange('porcentaje_descuento', e.target.value)}
            isRequired
            className="w-full"
            min="0"
            max="100"
            step="0.01"
          />
        )}

        <Switch
          isSelected={formData.tiene_descuento}
          onValueChange={(value) => onChange('tiene_descuento', value)}
          className="w-full"
        >
          Aplicar descuento
        </Switch>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Unidad de Medida*</label>
          <Select
            label="Unidad de Medida"
            selectedKeys={formData.unidad_medida_base ? [formData.unidad_medida_base] : []}
            onChange={(e) => onChange('unidad_medida_base', e.target.value)}
            className="w-full"
            isRequired
          >
            {unidadMedidaOptions.map((option) => (
              <SelectItem key={option.value} textValue={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Imagen</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
        </div>

        {/* Botón abarca ambas columnas */}
        <div className="col-span-1 md:col-span-2 flex justify-end pt-4">
          <Button
            color="primary"
            onPress={onSubmit}
            isLoading={loading}
            isDisabled={
              loading ||
              !formData.nombre ||
              !formData.descripcion ||
              !formData.categoria ||
              !formData.unidadP ||
              !formData.estado ||
              !formData.tipo_gestion ||
              !formData.precio_compra ||
              (formData.tipo_gestion === 'stock' && formData.stock_actual == null) ||
              (formData.tipo_gestion === 'produccion' && formData.capacidad_diaria == null) ||
              (formData.tiene_descuento && !formData.porcentaje_descuento)
            }
            className="w-full md:w-auto"
          >
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </Button>
        </div>
      </div>
    </div>
  );
};