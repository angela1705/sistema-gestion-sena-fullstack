// src/components/entidades/SedeForm.tsx
import React, { useState, useEffect } from 'react';
import { Button, Input, Switch, Select, SelectItem } from '@heroui/react';
import { SedeFormData, SedeOption } from '../../types/entidades/sede';

interface SedeFormProps {
  formData: SedeFormData;
  senaEmpresas: SedeOption[];
  onChange: (field: keyof SedeFormData, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  empresasLoading: boolean;
}

export const SedeForm: React.FC<SedeFormProps> = ({
  formData,
  senaEmpresas = [],
  onChange,
  onSubmit,
  loading,
  error,
  empresasLoading,
}) => {
  const [nombreOptions, setNombreOptions] = useState<{ value: string; label: string }[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    const fetchNombreOptions = async () => {
      setOptionsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/sedes/opciones_nombres/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Error al obtener opciones de nombre');
        const data = await response.json();
        const options = Object.entries(data).map(([value, label]) => ({
          value,
          label: label as string,
        }));
        setNombreOptions(options);
      } catch (err) {
        console.error('Error al obtener opciones de nombre:', err);
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchNombreOptions();
  }, []);

  console.log('SedeForm - Datos:', { formData, senaEmpresas, nombreOptions });

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 p-2 rounded bg-red-50 mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Seleccione el nombre*</label>
        <Select
          label="Nombre de la Sede"
          placeholder="Seleccione el nombre de la sede"
          selectedKeys={formData.nombre ? [formData.nombre] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0]?.toString() || '';
            console.log('Select nombre - Valor seleccionado:', value);
            onChange('nombre', value);
          }}
          isRequired
          isDisabled={optionsLoading || nombreOptions.length === 0}
          className="w-full"
        >
          {nombreOptions.length === 0 ? (
            <SelectItem key="no-options" isDisabled>
              No hay nombres disponibles
            </SelectItem>
          ) : (
            nombreOptions.map((option) => (
              <SelectItem key={option.value}>
                {option.label}
              </SelectItem>
            ))
          )}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Seleccione la empresa*</label>
        <Select
          label="Empresa SENA"
          placeholder="Seleccione la empresa SENA"
          selectedKeys={formData.sena_empresa ? [formData.sena_empresa] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0]?.toString() || '';
            console.log('Select sena_empresa - Valor seleccionado:', value);
            onChange('sena_empresa', value);
          }}
          isRequired
          isDisabled={empresasLoading || senaEmpresas.length === 0}
          className="w-full"
        >
          {senaEmpresas.length === 0 ? (
            <SelectItem key="no-options" isDisabled>
              No hay empresas disponibles
            </SelectItem>
          ) : (
            senaEmpresas.map((empresa) => (
              <SelectItem key={empresa.id.toString()}>
                {empresa.nombre_display}
              </SelectItem>
            ))
          )}
        </Select>
      </div>

      <Input
        label="Dirección*"
        placeholder="Ingrese la dirección"
        value={formData.direccion}
        onChange={(e) => onChange('direccion', e.target.value)}
        isRequired
        isDisabled={empresasLoading || optionsLoading}
        className="w-full"
      />

      <Input
        label="Teléfono*"
        placeholder="Ingrese el teléfono"
        value={formData.telefono}
        onChange={(e) => onChange('telefono', e.target.value)}
        isRequired
        isDisabled={empresasLoading || optionsLoading}
        className="w-full"
      />

      <Input
        label="Responsable"
        placeholder="Ingrese el nombre del responsable"
        value={formData.responsable}
        onChange={(e) => onChange('responsable', e.target.value)}
        isDisabled={empresasLoading || optionsLoading}
        className="w-full"
      />

      <Switch
        isSelected={formData.activa}
        onValueChange={(value) => onChange('activa', value)}
        isDisabled={empresasLoading || optionsLoading}
        className="w-full"
      >
        Sede activa
      </Switch>

      <div className="flex justify-end pt-4">
        <Button
          color="primary"
          onPress={onSubmit}
          isLoading={loading}
          isDisabled={
            loading ||
            !formData.nombre ||
            !formData.sena_empresa ||
            !formData.direccion ||
            !formData.telefono
          }
          className="w-full md:w-auto"
        >
          {loading ? 'Guardando...' : 'Guardar Sede'}
        </Button>
      </div>
    </div>
  );
};