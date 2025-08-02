import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from '@nextui-org/react';
import { useForm } from 'react-hook-form';
import { TipoCategoria } from '@/types/inventario/Categoria';

interface TipoCategoriaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
  categoria?: TipoCategoria | null;
  error?: string | null;
}

export const TipoCategoriaForm = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  categoria,
  error
}: TipoCategoriaFormProps) => {
  const { register, handleSubmit, reset } = useForm<{ nombre: string }>({
    defaultValues: {
      nombre: categoria?.nombre || ''
    }
  });

  React.useEffect(() => {
    reset({ nombre: categoria?.nombre || '' });
  }, [categoria, reset]);

  const onFormSubmit = (values: { nombre: string }) => {
    const formData = new FormData();
    formData.append('nombre', values.nombre.trim());
    if (categoria?.id) {
      formData.append('id', categoria.id.toString());
    }
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>
          {categoria ? 'Editar Tipo de Categoría' : 'Nueva Tipo de Categoría'}
        </ModalHeader>
        <ModalBody>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Input label="Nombre" {...register('nombre')} />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>Cancelar</Button>
          <Button color="primary" isLoading={isSubmitting} onClick={handleSubmit(onFormSubmit)}>
            {categoria ? 'Guardar Cambios' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};