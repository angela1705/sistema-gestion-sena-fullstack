import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSenaEmpresas } from '@/hook/entidades/useSenaEmpresas';
import { useManageSenaEmpresa } from '@/hook/entidades/useManageSenaEmpresa';
import { Button, Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Spinner, Image } from '@nextui-org/react';
import { FaPlus, FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { SenaEmpresaForm } from '@/components/entidades/SenaEmpresaForm';
import { SenaEmpresa} from '@/types/entidades/SenaEmpresa'


interface SenaEmpresasProps {
  isNavbarOpen: boolean;
}

const SenaEmpresas: React.FC<SenaEmpresasProps> = ({ isNavbarOpen }) => {
  const navigate = useNavigate();
  const { empresas, loading, error, refetch } = useSenaEmpresas();
  const { 
    createUpdateEmpresa, 
    toggleActiva, 
    loading: manageLoading, 
    error: manageError, 
    success,
    reset 
  } = useManageSenaEmpresa();
  
  const [selectedEmpresa, setSelectedEmpresa] = useState<SenaEmpresa | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (success) {
      setIsFormOpen(false);
      setSelectedEmpresa(null);
      reset();
      refetch();
    }
  }, [success, reset, refetch]);

  const handleToggleActiva = async (id: number, currentStatus: boolean) => {
    await toggleActiva(id, currentStatus);
    refetch();
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 pt-16 flex items-center justify-center ${isNavbarOpen ? 'ml-64' : 'ml-16'}`}> 
      <Card className="w-full max-w-6xl mx-auto">
        <CardBody className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Empresas SENA</h1>
            <Button
              color="primary"
              startContent={<FaPlus />}
              onPress={() => {
                setSelectedEmpresa(null);
                setIsFormOpen(true);
              }}
            >
              Nueva Empresa
            </Button>
          </div>

          {loading && <Spinner className="my-4" />}
          {error && <div className="text-red-500 mb-4">{error}</div>}

          {empresas.length > 0 ? (
            <Table aria-label="Tabla de empresas SENA">
              <TableHeader>
                <TableColumn>NOMBRE</TableColumn>
                <TableColumn>NIT</TableColumn>
                <TableColumn>LOGO</TableColumn>
                <TableColumn>ESTADO</TableColumn>
                <TableColumn>ACCIONES</TableColumn>
              </TableHeader>
              <TableBody>
                {empresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell>{empresa.nombre}</TableCell>
                    <TableCell>{empresa.nit}</TableCell>
                    <TableCell>
                      {empresa.logo_url && (
                        <Image
                          src={empresa.logo_url}
                          alt={`Logo ${empresa.nombre}`}
                          width={40}
                          height={40}
                          className="max-h-10"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip color={empresa.activa ? 'success' : 'danger'}>
                        {empresa.activa ? 'Activa' : 'Inactiva'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          isIconOnly
                          onPress={() => {
                            setSelectedEmpresa(empresa);
                            setIsFormOpen(true);
                          }}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          isIconOnly
                          color={empresa.activa ? 'warning' : 'success'}
                          onPress={() => handleToggleActiva(empresa.id, empresa.activa)}
                          isLoading={manageLoading}
                        >
                          {empresa.activa ? <FaToggleOff /> : <FaToggleOn />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !loading && <p>No hay empresas registradas</p>
          )}
        </CardBody>
      </Card>

      <SenaEmpresaForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={async (data) => {
          await createUpdateEmpresa(data, !!selectedEmpresa);
        }}
        isSubmitting={manageLoading}
        empresa={selectedEmpresa}
        error={manageError}
      />
    </div>
  );
};

export default SenaEmpresas;