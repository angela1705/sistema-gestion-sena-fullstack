import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSedes } from '@/hook/entidades/useSedes';
import { useManageSede } from '@/hook/entidades/useManageSede';
import { Button, Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Spinner } from '@nextui-org/react';
import { FaPlus, FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { SedeForm } from '@/components/entidades/SedeForm';
import { Sede } from '@/types/entidades/sede';

interface SedesProps {
  isNavbarOpen: boolean;
}

const Sedes: React.FC<SedesProps> = ({ isNavbarOpen }) => {
  const navigate = useNavigate();
  const { sedes, isLoading, error, retry } = useSedes('http://localhost:8000/api/sedes/');
  const { 
    success, 
    error: manageError, 
    loading: manageLoading, 
    toggleActiva, 
    createUpdateSede, 
    reset 
  } = useManageSede('http://localhost:8000/api/sedes/');
  
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (error?.includes('No tienes permisos')) {
      navigate('/login');
    }
  }, [error, navigate]);

  useEffect(() => {
    if (success) {
      setIsFormOpen(false);
      setSelectedSede(null);
      reset();
      retry();
    }
  }, [success, reset, retry]);

  const handleToggleActiva = async (id: number, currentStatus: boolean) => {
    await toggleActiva(id, currentStatus);
    retry(); // Actualizar la lista después del cambio
  };

  const handleSubmit = async (data: Sede) => {
    try {
      await createUpdateSede(data, !!selectedSede?.id);
    } catch (err) {
      console.error('Error al guardar sede:', err);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${isNavbarOpen ? 'ml-64' : 'ml-16'}`}>
      <Card className="w-full max-w-6xl mx-auto">
        <CardBody className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Sedes</h1>
            <Button
              color="primary"
              startContent={<FaPlus />}
              onPress={() => {
                setSelectedSede(null);
                setIsFormOpen(true);
              }}
            >
              Nueva Sede
            </Button>
          </div>

          {isLoading && <Spinner className="my-4" />}
          {error && <div className="text-red-500 mb-4">{error}</div>}

          {sedes.length > 0 ? (
            <Table aria-label="Tabla de sedes">
              <TableHeader>
                <TableColumn>NOMBRE</TableColumn>
                <TableColumn>EMPRESA</TableColumn>
                <TableColumn>DIRECCIÓN</TableColumn>
                <TableColumn>RESPONSABLE</TableColumn>
                <TableColumn>ESTADO</TableColumn>
                <TableColumn>ACCIONES</TableColumn>
              </TableHeader>
              <TableBody>
                {sedes.map((sede) => (
                  <TableRow key={sede.id}>
                    <TableCell>{sede.nombre}</TableCell>
                    <TableCell>{sede.sena_empresa_info?.nombre || 'Sin empresa'}</TableCell>
                    <TableCell>{sede.direccion}</TableCell>
                    <TableCell>{sede.responsable || '-'}</TableCell>
                    <TableCell>
                      <Chip color={sede.activa ? 'success' : 'danger'}>
                        {sede.activa ? 'Activa' : 'Inactiva'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          isIconOnly
                          onPress={() => {
                            setSelectedSede(sede);
                            setIsFormOpen(true);
                          }}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          isIconOnly
                          color={sede.activa ? 'warning' : 'success'}
                          onPress={() => handleToggleActiva(sede.id!, sede.activa)}
                          isLoading={manageLoading}
                        >
                          {sede.activa ? <FaToggleOff /> : <FaToggleOn />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !isLoading && <p className="text-gray-500">No hay sedes registradas</p>
          )}
        </CardBody>
      </Card>

      <SedeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={manageLoading}
        sede={selectedSede}
        error={manageError}
      />
    </div>
  );
};

export default Sedes;