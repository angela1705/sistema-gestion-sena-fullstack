import { SenaEmpresa } from '@/types/entidades/SenaEmpresa';

interface SenaEmpresaSelectorProps {
  selectedEmpresaId: number | null | undefined;
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
  error,
}: SenaEmpresaSelectorProps) => {


  return (
    <div className="flex flex-col gap-2 w-full">
      <label
        htmlFor="empresa-select"
        className="text-sm font-medium text-default-700 dark:text-default-300"
      >
        Seleccionar Empresa SENA
      </label>
      <select
        id="empresa-select"
        value={selectedEmpresaId ?? ''}
        onChange={(e) => {
          const selectedId = e.target.value;
          console.log('Selected ID:', selectedId);
          if (selectedId) {
            onEmpresaChange(Number(selectedId));
          }
        }}
        disabled={isLoading || empresas.length === 0}
        className={`
          w-full h-12 px-4 py-2 bg-default-50 dark:bg-default-100
          border-2 border-default-200 dark:border-default-300
          rounded-md text-sm text-default-900 dark:text-default-900
          focus:ring-2 focus:ring-primary focus:border-primary
          transition-all duration-200
          ${error ? 'border-danger' : ''}
          ${isLoading || empresas.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label="Seleccionar Empresa SENA"
      >
        <option value="" disabled>
          {isLoading
            ? 'Cargando...'
            : empresas.length === 0
            ? 'No hay empresas disponibles'
            : 'Seleccione una empresa'}
        </option>
        {empresas.map((empresa) => (
          <option key={empresa.id} value={empresa.id}>
            {empresa.nombre} - {empresa.nit}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-danger text-sm mt-1">{error}</span>
      )}
    </div>
  );
};