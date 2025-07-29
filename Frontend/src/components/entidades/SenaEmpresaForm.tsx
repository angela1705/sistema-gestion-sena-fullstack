import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Switch, Image } from '@nextui-org/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SenaEmpresa } from '@/types/entidades/SenaEmpresa';

interface SenaEmpresaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<SenaEmpresa>) => void;
  isSubmitting: boolean;
  empresa?: SenaEmpresa | null;
  error?: string | null;
}

export const SenaEmpresaForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting, 
  empresa,
  error 
}: SenaEmpresaFormProps) => {
  const { register, handleSubmit, watch, setValue, reset } = useForm<Partial<SenaEmpresa>>({
    defaultValues: empresa || {
      nombre: '',
      nit: '',
      direccion_principal: '',
      telefono_contacto: '',
      email_contacto: '',
      activa: true
    }
  });

  const logoPreview = watch('logo_url') || (empresa?.logo_url && !watch('logo') ? empresa.logo_url : null);

  useEffect(() => {
    reset(empresa || {
      nombre: '',
      nit: '',
      direccion_principal: '',
      telefono_contacto: '',
      email_contacto: '',
      activa: true
    });
  }, [empresa, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setValue('logo', e.target.files[0]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>{empresa ? 'Editar Empresa' : 'Crear Empresa'}</ModalHeader>
          <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {error && <div className="col-span-2 text-red-500">{error}</div>}
            
            <Input
              label="Nombre"
              {...register('nombre', { required: true })}
              isRequired
            />
            
            <Input
              label="NIT"
              {...register('nit', { required: true })}
              isRequired
            />
            
            <Input
              label="Teléfono"
              {...register('telefono_contacto', { required: true })}
              isRequired
            />
            
            <Input
              label="Email"
              type="email"
              {...register('email_contacto', { required: true })}
              isRequired
            />
            
            <div className="md:col-span-2">
              <Input
                label="Dirección Principal"
                {...register('direccion_principal', { required: true })}
                isRequired
              />
            </div>
            
            <div className="flex items-center gap-4">
              <Switch
                isSelected={watch('activa') ?? true}
                onValueChange={(val) => setValue('activa', val)}
              >
                Activa
              </Switch>
              
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="logo-upload" className="cursor-pointer text-sm text-blue-500">
                {logoPreview ? 'Cambiar logo' : 'Subir logo'}
              </label>
            </div>
            
            {logoPreview && (
              <div className="md:col-span-2">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  width={100}
                  height={100}
                  className="max-h-32 object-contain"
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button 
              color="primary" 
              type="submit"
              isLoading={isSubmitting}
            >
              {empresa ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};