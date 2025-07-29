import { Select, SelectItem } from '@nextui-org/react';
import { SenaEmpresa} from '@/types/entidades/SenaEmpresa'

interface SenaEmpresaSelectorProps {
  selectedEmpresaId: number | null;
  onEmpresaChange: (empresaId: number) => void;
  empresas: SenaEmpresa[];
  isLoading?: boolean;
  error?: string;
}

export const SenaEmpresaSelector = ({
  selectedEmpresaId,
  onEmpresaChange,
  empresas,
  isLoading = false,
  error
}: SenaEmpresaSelectorProps) => {
  return (
    <Select
      label="Seleccionar Empresa SENA"
      variant="bordered"
      selectedKeys={selectedEmpresaId ? [selectedEmpresaId.toString()] : []}
      onSelectionChange={(keys) => {
        const selectedKey = Array.from(keys)[0];
        if (selectedKey) onEmpresaChange(Number(selectedKey));
      }}
      isLoading={isLoading}
      isInvalid={!!error}
      errorMessage={error}
      classNames={{
        trigger: "h-12"
      }}
    >
      {empresas.map((empresa) => (
        <SelectItem 
          key={empresa.id} 
          value={empresa.id}
          textValue={empresa.nombre}
        >
          {empresa.nombre} - {empresa.nit}
        </SelectItem>
      ))}
    </Select>
  );
};