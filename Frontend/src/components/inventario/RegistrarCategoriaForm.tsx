import { Button, Input } from '@nextui-org/react';
import { TipoCategoriaFormData } from '../../types/inventario/Categoria';

interface CategoriaFormProps {
  formData: TipoCategoriaFormData;
  onChange: (field: keyof TipoCategoriaFormData, value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export const RegistrarCategoriaForm = ({
  formData,
  onChange,
  onSubmit,
  loading,
  error,
}: CategoriaFormProps) => {
  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 p-2 rounded bg-red-50 mb-4">
          {error}
        </div>
      )}

      <Input
        label="Nombre*"
        value={formData.nombre}
        onChange={(e) => onChange('nombre', e.target.value)}
        isRequired
        className="w-full"
      />

      <div className="flex justify-end pt-4">
        <Button
          color="primary"
          onPress={onSubmit}
          isLoading={loading}
          isDisabled={loading || !formData.nombre}
          className="w-full md:w-auto"
        >
          {loading ? 'Guardando...' : 'Guardar Categoría'}
        </Button>
      </div>
    </div>
  );
};