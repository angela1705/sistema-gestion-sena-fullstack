import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnidades } from '@/hook/entidades/useUnidadesProductivas';
import { useManageUnidad } from '@/hook/entidades/useManageUnidad';
import { Button, Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Spinner, Image } from '@nextui-org/react';
import { FaPlus, FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { UnidadProductivaForm } from '@/components/entidades/UnidadProductivaForm';
import { UnidadProductiva } from '@/types/entidades/UnidadProductiva';

interface UnidadesProps {
  isNavbarOpen: boolean;
}

const UnidadesPage: React.FC<UnidadesProps> = ({ isNavbarOpen }) => {
  const navigate = useNavigate();
  const { unidades, isLoading, error, retry } = useUnidades('http://localhost:8000/api/unidad-productiva/');
  const { 
    success, 
    error: manageError, 
    loading: manageLoading, 
    toggleActiva, 
    createUpdateUnidad, 
    reset 
  } = useManageUnidad('http://localhost:8000/api/unidad-productiva/');
  
  const [selectedUnidad, setSelectedUnidad] = useState<UnidadProductiva | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (error?.includes('No tienes permisos')) {
      navigate('/login');
    }
  }, [error, navigate]);

  useEffect(() => {
    if (success) {
      setIsFormOpen(false);
      setSelectedUnidad(null);
      reset();
      retry();
    }
  }, [success, reset, retry]);

  const handleToggleActiva = async (id: number, currentStatus: boolean) => {
    await toggleActiva(id, currentStatus);
    retry();
  };

  const handleSubmit = async (data: FormData) => {
    try {
      await createUpdateUnidad(data, !!selectedUnidad?.id, selectedUnidad?.id);
    } catch (err) {
      console.error('Error al guardar unidad:', err);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 pt-16 ${isNavbarOpen ? 'ml-64' : 'ml-16'} flex items-center justify-center`}>
      <Card className="w-full max-w-6xl mx-auto">
        <CardBody className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Unidades Productivas</h1>
            <Button
              color="primary"
              startContent={<FaPlus />}
              onPress={() => {
                setSelectedUnidad(null);
                setIsFormOpen(true);
              }}
            >
              Nueva Unidad
            </Button>
          </div>

          {isLoading && <Spinner className="my-4" />}
          {error && <div className="text-red-500 mb-4">{error}</div>}

          {unidades.length > 0 ? (
            <div className="mt-10">
              <Table aria-label="Tabla de unidades productivas">
                <TableHeader>
                  <TableColumn>LOGO</TableColumn>
                  <TableColumn>TIPO</TableColumn>
                  <TableColumn>SEDE</TableColumn>
                  <TableColumn>ENCARGADO</TableColumn>
                  <TableColumn>DESCRIPCIÓN</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn>HORARIO</TableColumn>
                  <TableColumn>ACCIONES</TableColumn>
                  
                </TableHeader>

                <TableBody>
                  {unidades.map((unidad) => (
                    <TableRow key={unidad.id}>
                      <TableCell>
                        {unidad.logo_url && (
                          <Image
                            src={unidad.logo_url}
                            alt="Logo"
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        )}
                      </TableCell>
                      <TableCell>{unidad.tipo_display}</TableCell>
                      <TableCell>{unidad.sede_info?.nombre}</TableCell>
                      <TableCell>
                        {unidad.encargado_info
                          ? `${unidad.encargado_info.first_name} ${unidad.encargado_info.last_name}`: '-'}
                       </TableCell>
                      <TableCell>{unidad.descripcion || '-'}</TableCell>
                      <TableCell>
                        <Chip color={unidad.activa ? 'success' : 'danger'}>
                          {unidad.activa ? 'Activa' : 'Inactiva'}
                        </Chip>
                      </TableCell>
                      <TableCell>{unidad.horario_atencion || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            isIconOnly
                            onPress={() => {
                              setSelectedUnidad(unidad);
                              setIsFormOpen(true);
                            }}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            isIconOnly
                            color={unidad.activa ? 'warning' : 'success'}
                            onPress={() => handleToggleActiva(unidad.id, unidad.activa)}
                            isLoading={manageLoading}
                          >
                            {unidad.activa ? <FaToggleOff /> : <FaToggleOn />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            !isLoading && <p className="text-gray-500">No hay unidades productivas registradas</p>
          )}
        </CardBody>
      </Card>

      <UnidadProductivaForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={manageLoading}
        unidad={selectedUnidad}
        error={manageError}
      />
    </div>
  );
};

export default UnidadesPage;