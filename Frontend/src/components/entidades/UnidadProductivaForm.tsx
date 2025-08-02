import React from 'react';
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Textarea, Image, Switch
} from '@nextui-org/react';
import { useForm } from 'react-hook-form';
import { UnidadProductiva } from '@/types/entidades/UnidadProductiva';
import { useUnidadOpciones } from '@/hook/entidades/useUnidadProductivaOptions';
import { useSedeOptions } from '@/hook/entidades/useSedeOptions';

interface UnidadProductivaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting: boolean;
  unidad?: UnidadProductiva | null;
  error?: string | null;
}

export const UnidadProductivaForm = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  unidad,
  error
}: UnidadProductivaFormProps) => {
  const { opciones, loading: loadingOpciones } = useUnidadOpciones();
  const { sedeOptions, loading: loadingSedes } = useSedeOptions();

  const defaultValues = unidad ? {
    tipo: unidad.tipo || '',
    encargado: unidad.encargado?.toString() || '',
    sede: unidad.sede?.toString() || '',
    activa: unidad.activa ?? true,
    descripcion: unidad.descripcion || '',
    horario_atencion: unidad.horario_atencion || ''
  } : {
    tipo: '',
    encargado: '',
    sede: '',
    activa: true,
    descripcion: '',
    horario_atencion: ''
  };

  const { register, watch, getValues } = useForm<typeof defaultValues>({
    defaultValues
  });

  const [logoFile, setLogoFile] = React.useState<FileList | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (unidad?.logo_url) {
      setLogoPreview(unidad.logo_url);
    }
  }, [unidad]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleFormSubmit = () => {
    const formData = new FormData();
    const values = getValues();

    if (values.descripcion) formData.append('descripcion', values.descripcion);
    if (values.tipo) formData.append('tipo', values.tipo);
    formData.append('activa', values.activa.toString());
    if (values.encargado) formData.append('encargado', values.encargado);
    if (values.sede) formData.append('sede', values.sede);
    if (values.horario_atencion) formData.append('horario_atencion', values.horario_atencion);
    if (logoFile && logoFile[0]) {
      formData.append('logo', logoFile[0]);
    }
    if (unidad?.id) {
      formData.append('id', unidad.id.toString());
    }

    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <>
          <ModalHeader className="border-b">
            {unidad ? 'Editar Unidad Productiva' : 'Crear Nueva Unidad'}
          </ModalHeader>
          <ModalBody className="py-6 gap-4">
            {error && (
              <div className="px-4 py-2 bg-danger-100 text-danger-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Logo */}
            <div className="flex flex-col items-center gap-4">
              {logoPreview && (
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-32 h-32 object-contain rounded-full"
                />
              )}
              <input
                type="file"
                id="logo"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <label htmlFor="logo" className="cursor-pointer">
                <Button as="span" color="primary" variant="bordered">
                  {logoPreview ? 'Cambiar Logo' : 'Subir Logo'}
                </Button>
              </label>
            </div>

            <Textarea
              label="Descripción"
              {...register('descripcion')}
              variant="bordered"
            />

            {/* Tipo de unidad */}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de Unidad
            </label>
            <select
              {...register('tipo')}
              className="w-full border px-3 py-2 rounded-md bg-white dark:bg-gray-800 dark:text-white"
              disabled={loadingOpciones}
            >
              <option value="">Seleccione un tipo</option>
              {Object.entries(opciones.tipos).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {/* Encargado */}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Encargado
            </label>
            <select
              {...register('encargado')}
              className="w-full border px-3 py-2 rounded-md bg-white dark:bg-gray-800 dark:text-white"
              disabled={loadingOpciones}
            >
              <option value="">Seleccione un encargado</option>
              {opciones.encargados.map((encargado) => (
                <option key={encargado.id} value={encargado.id}>
                  {encargado.nombre_completo}
                </option>
              ))}
            </select>

            <Switch
              isSelected={watch('activa') ?? true}
              onValueChange={(value) => {
                // NextUI Switch no usa register directamente
                getValues().activa = value;
              }}
            >
              Unidad activa
            </Switch>

            {/* Sede */}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sede
            </label>
            <select
              {...register('sede')}
              className="w-full border px-3 py-2 rounded-md bg-white dark:bg-gray-800 dark:text-white"
              disabled={loadingSedes}
            >
              <option value="">Seleccione una sede</option>
              {sedeOptions.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre_display}
                </option>
              ))}
            </select>

            <Input
              label="Horario de Atención"
              {...register('horario_atencion')}
              variant="bordered"
            />
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
              onPress={handleFormSubmit}
              isLoading={isSubmitting}
            >
              {unidad ? 'Guardar Cambios' : 'Crear Unidad'}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};
