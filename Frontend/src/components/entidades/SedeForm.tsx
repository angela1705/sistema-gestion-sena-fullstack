import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Switch } from '@nextui-org/react';
import { useForm } from 'react-hook-form';
import { Sede } from '@/types/entidades/sede';
import { SenaEmpresaSelector } from './SenaEmpresaSelector';
import { useSenaEmpresas } from '@/hook/entidades/useSenaEmpresas';

interface SedeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Sede) => void;
  isSubmitting: boolean;
  sede?: Sede | null;
  error?: string | null;
}

export const SedeForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting,
  sede,
  error
}: SedeFormProps) => {
  const { empresas, loading: loadingEmpresas, error: empresasError } = useSenaEmpresas();
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors },
    reset
  } = useForm<Sede>({
    defaultValues: sede || {
      nombre: '',
      sena_empresa: undefined,
      direccion: '',
      telefono: '',
      responsable: '',
      activa: true
    }
  });

  React.useEffect(() => {
    register('sena_empresa', { 
      required: 'Debe seleccionar una empresa SENA' 
    });
    
    // Resetear formulario cuando cambia el modo (crear/editar)
    reset(sede || {
      nombre: '',
      sena_empresa: undefined,
      direccion: '',
      telefono: '',
      responsable: '',
      activa: true
    });
  }, [register, reset, sede]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="border-b">
            {sede ? 'Editar Sede' : 'Crear Nueva Sede'}
          </ModalHeader>
          <ModalBody className="py-6 gap-4">
            {error && (
              <div className="px-4 py-2 bg-danger-100 text-danger-700 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Nombre de la Sede"
              {...register('nombre', { required: 'Este campo es requerido' })}
              isInvalid={!!errors.nombre}
              errorMessage={errors.nombre?.message}
              variant="bordered"
            />

            <SenaEmpresaSelector
              selectedEmpresaId={watch('sena_empresa')}
              onEmpresaChange={(id) => setValue('sena_empresa', id)}
              empresas={empresas}
              isLoading={loadingEmpresas}
              error={empresasError || errors.sena_empresa?.message}
            />

            <Input
              label="Dirección"
              {...register('direccion', { required: 'Este campo es requerido' })}
              isInvalid={!!errors.direccion}
              errorMessage={errors.direccion?.message}
              variant="bordered"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Teléfono"
                {...register('telefono')}
                variant="bordered"
              />
              <Input
                label="Responsable"
                {...register('responsable')}
                variant="bordered"
              />
            </div>

            <Switch
              isSelected={watch('activa') ?? true}
              onValueChange={(val) => setValue('activa', val)}
              classNames={{
                base: "mt-2"
              }}
            >
              Sede activa
            </Switch>
          </ModalBody>
          <ModalFooter className="border-t">
            <Button 
              color="danger" 
              variant="light" 
              onPress={onClose}
              isDisabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              color="primary" 
              type="submit"
              isLoading={isSubmitting}
            >
              {sede ? 'Guardar Cambios' : 'Crear Sede'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}; 