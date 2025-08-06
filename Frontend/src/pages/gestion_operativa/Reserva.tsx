import { useState } from 'react';
import ReuModal from '../../components/global/ReuModal';
import { useUnidades } from '@/hook/entidades/useUnidadesProductivas'
import { useProductos } from '../../hook/inventario/useProductos';
import { Button, Card, CardBody } from '@nextui-org/react';
import { useReserva } from '../../hook/gestion_operativa/useReserva';
import { useEliminarReserva } from '../../hook/gestion_operativa/useEliminarReserva';
import Tabla from '../../components/global/Tabla';

export default function Reserva({ isNavbarOpen }: { isNavbarOpen: boolean }) {
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

  const [modalOpen, setModalOpen] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [unidadProductiva, setUnidadProductiva] = useState("");
  const [producto, setProducto] = useState("");
  const [descargando, setDescargando] = useState(false);

  const { unidades, loading: loadingUnidades } = useUnidades();
  const { productos, loading: loadingProductos } = useProductos();

  const handleDescargarPDF = async () => {
    if (!fechaInicio || !fechaFin || !unidadProductiva || !producto) {
      alert("Debes completar todos los filtros para descargar el reporte PDF.");
      return;
    }
    setDescargando(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No se encontró el token de autenticación');
        setDescargando(false);
        return;
      }
      const url = `http://localhost:8000/api/reservas/reporte_pdf/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&unidad_productiva=${unidadProductiva}&producto=${producto}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        alert('Error al generar el PDF');
        setDescargando(false);
        return;
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setModalOpen(false);
    } finally {
      setDescargando(false);
    }
  };
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
            <Button color="primary" onPress={() => setModalOpen(true)} className="w-fit">Descargar PDF</Button>
          </div>

          <ReuModal
            isOpen={modalOpen}
            onOpenChange={setModalOpen}
            title="Descargar reporte de reservas en PDF"
            onConfirm={handleDescargarPDF}
          >
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium">Fecha inicio</label>
                <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="border rounded px-2 py-1 w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium">Fecha fin</label>
                <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="border rounded px-2 py-1 w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium">Unidad productiva</label>
                <select value={unidadProductiva} onChange={e => setUnidadProductiva(e.target.value)} className="border rounded px-2 py-1 w-full">
                  <option value="">Selecciona una unidad productiva</option>
                  {loadingUnidades ? (
                    <option disabled>Cargando...</option>
                  ) : (
                    unidades.map((u) => (
                      <option key={u.id} value={u.id}>{u.nombre}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Producto</label>
                <select value={producto} onChange={e => setProducto(e.target.value)} className="border rounded px-2 py-1 w-full">
                  <option value="">Selecciona un producto</option>
                  {loadingProductos ? (
                    <option disabled>Cargando...</option>
                  ) : (
                    productos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </ReuModal>

          {/* ...existing code... */}
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