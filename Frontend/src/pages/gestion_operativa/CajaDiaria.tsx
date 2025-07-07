import { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { FaPlus } from 'react-icons/fa';
import { useCajaDiaria } from '../../hook/gestion_operativa/useCajaDiaria';
import { useRegistrarCaja } from '../../hook/gestion_operativa/useRegistrarCaja';
import { useCerrarCaja } from '../../hook/gestion_operativa/useCerrarCaja';
import { useCajaDiariaOptions } from '../../hook/gestion_operativa/useCajaDiariaOptions';
import { CajaDiariaForm } from '../../components/gestion_operativa/CajaDiariaForm';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import Tabla from '../../components/global/Tabla';
import { type CajaDiaria, CajaDiariaFormData } from '../../types/gestion_operativa/caja_diaria';
import { ReactNode } from 'react';
import { SedeOption } from '../../types/entidades/Options';

interface Column {
  uid: string;
  name: string;
  render?: (data: any, row: CajaDiaria, options: SedeOption[]) => ReactNode;
}

export default function CajaDiaria({ isNavbarOpen }: { isNavbarOpen: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCajaId, setSelectedCajaId] = useState<number | null>(null);
  const { cajas, loading: cajasLoading, error: cajasError, refetch } = useCajaDiaria();
  const { registrarCaja, loading: registerLoading, error: registerError } = useRegistrarCaja();
  const { cerrarCaja, loading: cerrarLoading, error: cerrarError } = useCerrarCaja(selectedCajaId);
  const { unidades, loading: unidadesLoading, error: unidadesError } = useCajaDiariaOptions();

  const [formData, setFormData] = useState<CajaDiariaFormData>({
    unidadProductiva: '',
    saldo_inicial: '',
    saldo_final: '',
    observaciones: '',
  });

  const handleChange = (field: keyof CajaDiariaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!isModalOpen) return;
      if (selectedCajaId === null) {
        await registrarCaja({
          unidadProductiva: formData.unidadProductiva,
          saldo_inicial: formData.saldo_inicial,
          observaciones: formData.observaciones,
          saldo_final: '',
        });
      } else {
        await cerrarCaja({
          saldo_final: formData.saldo_final,
          observaciones: formData.observaciones,
        });
      }
      setIsModalOpen(false);
      setFormData({
        unidadProductiva: '',
        saldo_inicial: '',
        saldo_final: '',
        observaciones: '',
      });
      setSelectedCajaId(null);
      await refetch();
    } catch (err) {
      console.error('Error al procesar caja:', err);
    }
  };

  const handleOpenModal = (cajaId: number | null) => {
    setSelectedCajaId(cajaId);
    setIsModalOpen(true);
    // Pre-seleccionar la primera unidad si solo hay una disponible
    const initialFormData: CajaDiariaFormData = {
      unidadProductiva: unidades.length === 1 ? unidades[0].id.toString() : '',
      saldo_inicial: '',
      saldo_final: '',
      observaciones: '',
    };
    setFormData(initialFormData);
  };

  const columns: Column[] = [
    { uid: 'fecha_apertura', name: 'Fecha Apertura' },
    {
      uid: 'unidadProductiva_info.nombre',
      name: 'Unidad Productiva',
      render: (_data, row: CajaDiaria) => row.unidadProductiva_info?.nombre || 'N/A',
    },
    { uid: 'saldo_inicial', name: 'Saldo Inicial' },
    {
      uid: 'esta_abierta',
      name: 'Estado',
      render: (_data, row: CajaDiaria) => (row.esta_abierta ? 'Abierta' : 'Cerrada'),
    },
    {
      uid: 'duracion',
      name: 'Duración',
      render: (_data, row: CajaDiaria) => row.duracion || 'N/A',
    },
    {
      uid: 'acciones',
      name: 'Acciones',
      render: (_data, row: CajaDiaria) =>
        row.esta_abierta ? (
          <Button color="danger" onPress={() => handleOpenModal(row.id)}>
            Cerrar Caja
          </Button>
        ) : null,
    },
  ];

  const searchableFields = ['fecha_apertura', 'unidadProductiva_info.nombre', 'saldo_inicial', 'duracion'];

  // Depuración para verificar unidades y cajas
  console.log('CajaDiaria - Unidades:', unidades, 'UnidadesLoading:', unidadesLoading, 'UnidadesError:', unidadesError);
  console.log('CajaDiaria - Cajas:', cajas);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 p-4 ${
        isNavbarOpen ? 'ml-64' : 'ml-16'
      } flex items-center justify-center`}
    >
      <Card className="w-full max-w-5xl">
        <CardBody className="flex flex-col p-6">
          <div className="flex flex-col sm:flex-col justify-start mb-4 gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lista de Cajas Diarias</h1>
          </div>

          {cajasLoading && <p className="text-gray-500">Cargando cajas...</p>}
          {(cajasError || unidadesError) && (
            <p className="text-red-500 mb-4">{cajasError || unidadesError}</p>
          )}
          {cajas && cajas.length === 0 && !cajasLoading && !cajasError && (
            <p className="text-gray-500 mb-4">No hay cajas para mostrar.</p>
          )}
          <Tabla
            columns={columns}
            data={cajas || []}
            searchableFields={searchableFields}
            extraControls={
              <div className="flex items-center gap-4">
                <Button
                  onPress={() => handleOpenModal(null)}
                  color="primary"
                  startContent={<FaPlus />}
                >
                  Registrar
                </Button>
              </div>
            }
            senaEmpresas={unidades.map((u) => ({ id: u.id, nombre_display: u.nombre }))}
          />
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <ModalContent>
              <ModalHeader>{selectedCajaId ? 'Cerrar Caja' : 'Registrar Nueva Caja'}</ModalHeader>
              <ModalBody>
                <CajaDiariaForm
                  formData={formData}
                  unidades={unidades}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  loading={selectedCajaId ? cerrarLoading : registerLoading}
                  error={selectedCajaId ? cerrarError : registerError || unidadesError}
                  optionsLoading={unidadesLoading}
                  isRegister={selectedCajaId === null}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </CardBody>
      </Card>
    </div>
  );
}