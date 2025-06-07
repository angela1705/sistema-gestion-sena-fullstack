
import { Button, Input,  Switch } from '@nextui-org/react';
import {Select, SelectItem} from "@heroui/select";
import { SedeFormData } from '../../types/entidades/sede';

interface SedeFormProps {
  formData: SedeFormData;
  senaEmpresas: {id: number, nombre: string}[];
  onChange: (field: keyof SedeFormData, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  empresasLoading: boolean;
}

export const SedeForm = ({
  formData,
  senaEmpresas = [],
  onChange,
  onSubmit,
  loading,
  error,
  empresasLoading
}: SedeFormProps) => {
  // Opciones de sede como botones (como solicitaste)
  const sedeOptions = [
    { value: "centro", label: "Centro" },
    { value: "yamboro", label: "Yamboro" }
  ];
 
  return (
    
    <div className="space-y-4">
      
      {/* Mostrar errores */}
      {error && (
        <div className="text-red-500 p-2 rounded bg-red-50 mb-4">
          {error}
        </div>
      )}

      {/* Selección de sede con botones */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Seleccione la sede*</label>
        <div className="flex gap-2">
          {sedeOptions.map((option) => (
            <Button
              key={option.value}
              variant={formData.nombre === option.value ? "solid" : "bordered"}
              color="primary"
              onPress={() => onChange("nombre", option.value)}
              className="flex-1"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Select de empresas SENA */}
     
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Seleccione la empresa*</label>
        <Select
          label="Empresa SENA"
          selectedKeys={formData.sena_empresa ? [formData.sena_empresa] : []}
          onChange={(e) => onChange("sena_empresa", e.target.value)}
          className="w-full"
          isRequired
          isLoading={empresasLoading}
          isDisabled={empresasLoading}
        >
          {senaEmpresas.map((empresa) => (
            <SelectItem key={empresa.id.toString()} >
              {empresa.nombre }
            </SelectItem>
          ))}
          
        </Select>
        
      </div>

      {/* Resto del formulario */}
      <Input
        label="Dirección*"
        value={formData.direccion}
        onChange={(e) => onChange("direccion", e.target.value)}
        isRequired
        className="w-full"
      />

      <Input
        label="Teléfono*"
        value={formData.telefono}
        onChange={(e) => onChange("telefono", e.target.value)}
        isRequired
        className="w-full"
      />

      <Input
        label="Responsable"
        value={formData.responsable}
        onChange={(e) => onChange("responsable", e.target.value)}
        className="w-full"
      />

      <Switch
        isSelected={formData.activa}
        onValueChange={(value) => onChange("activa", value)}
        className="w-full"
      >
        Sede activa
      </Switch>

      <div className="flex justify-end pt-4">
        <Button
          color="primary"
          onPress={onSubmit}
          isLoading={loading}
          isDisabled={
            loading || 
            !formData.nombre || 
            !formData.sena_empresa || 
            !formData.direccion || 
            !formData.telefono
          }
          className="w-full md:w-auto"
        >
          {loading ? "Guardando..." : "Guardar Sede"}
        </Button>
      </div>
    </div>
  );
};