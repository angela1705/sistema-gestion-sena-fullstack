import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { useReserva } from '../../hook/gestion_operativa/useReserva';
import { useEliminarReserva } from '../../hook/gestion_operativa/useEliminarReserva';
import Tabla from '../../components/global/Tabla';

const columns = [
  { uid: 'fecha_creacion', name: 'Fecha Creación' },
  { uid: 'persona_info', name: 'Persona', render: (data: any) => data?.first_name || 'Sin nombre' },
  { uid: 'producto_info', name: 'Producto', render: (data: any) => data?.nombre || 'Sin producto' },
  { uid: 'cantidad', name: 'Cantidad' },
  { uid: 'total', name: 'Total' },
  { uid: 'estado_display', name: 'Estado' },
  {
    uid: 'acciones',
    name: 'Acciones',
    render: (_data: any, row: any, context: { eliminarReserva: (id: number) => Promise<void>; refetch: () => Promise<void> }) => {
      if (!row || typeof row.estado === 'undefined' || !row.id || typeof row.id !== 'number') return null;
      return (
        <Button color="danger" onPress={() => handleDelete(row.id, context.eliminarReserva, context.refetch)}>Cancelar</Button>
      );
    },
  },
];

const searchableFields = ['persona_info.first_name', 'producto_info.nombre'];

export default function Reserva({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const { reservas, loading: reservasLoading, error: reservasError, refetch } = useReserva('http://localhost:8000/api/reservas/');
  const { eliminarReserva, loading: deleteLoading, error: deleteError } = useEliminarReserva();

  // Logs minimizados
  if (process.env.NODE_ENV === 'development') {
    console.log('Reservas cargadas: Conteo', reservas?.length || 0);
    console.log('eliminarReserva en Reserva:', typeof eliminarReserva === 'function' ? 'función' : eliminarReserva);
  }

  const handleDelete = async (reservaId: number, eliminarReserva: (id: number) => Promise<void>, refetch: () => Promise<void>) => {
    if (typeof eliminarReserva !== 'function') {
      console.error('eliminarReserva no es una función en handleDelete:', eliminarReserva);
      return;
    }
    try {
      console.log('Intentando eliminar reserva con ID:', reservaId);
      await eliminarReserva(reservaId);
      await refetch();
      console.log('Reserva eliminada y lista refetcheada');
    } catch (err) {
      console.error('Error al eliminar reserva:', err);
    }
  };

  if (!reservas && !reservasLoading && !reservasError) {
    return <p className="text-red-500 text-center">Error: No se pudieron cargar las reservas.</p>;
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
        isNavbarOpen ? 'ml-64' : 'ml-16'
      } flex items-center justify-center`}
    >
      <Card className="w-full max-w-5xl">
        <CardBody className="flex flex-col p-6">
          <div className="flex flex-col sm:flex-col justify-start mb-4 gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Listado de Reservas</h1>
          </div>

          {reservasLoading && <p className="text-gray-500">Cargando reservas...</p>}
          {reservasError && <p className="text-red-500 mb-4">Error al cargar reservas: {reservasError}</p>}
          {deleteError && <p className="text-red-500 mb-4">Error al eliminar reserva: {deleteError}</p>}
          {reservas?.length === 0 && !reservasLoading && !reservasError && (
            <p className="text-gray-500 mb-4">No hay reservas para mostrar.</p>
          )}
          <Tabla
            columns={columns}
            data={reservas || []}
            searchableFields={searchableFields}
            eliminarReserva={eliminarReserva}
            refetch={refetch}
          />
        </CardBody>
      </Card>
    </div>
  );
}