// src/components/entidades/RegistrarUnidadProductivaForm.tsx
import React, { useState, useEffect } from 'react';
import { Button, Input, Select, SelectItem } from '@heroui/react';
import { UnidadProductivaFormData } from '../../types/entidades/UnidadProductiva';
import { EncargadoOption } from '../../types/entidades/Options';

interface RegistrarUnidadProductivaFormProps {
  formData: UnidadProductivaFormData;
  encargados: EncargadoOption[];
  tipos: { value: string; label: string }[];
  onChange: (field: keyof UnidadProductivaFormData, value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  optionsLoading: boolean;
}

export const RegistrarUnidadProductivaForm: React.FC<RegistrarUnidadProductivaFormProps> = ({
  formData,
  encargados = [],
  tipos = [],
  onChange,
  onSubmit,
  loading,
  error,
  optionsLoading,
}) => {
  const [sedes, setSedes] = useState<{ id: string; nombre_display: string }[]>([]);
  const [sedesLoading, setSedesLoading] = useState(false);

  useEffect(() => {
    const fetchSedes = async () => {
      setSedesLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/sedes/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Error al obtener sedes');
        const data = await response.json();
        console.log('Respuesta de /api/sedes/:', data);
        const normalizedSedes = Array.isArray(data) ? data : data.results || [];
        setSedes(
          normalizedSedes.map((sede: any) => ({
            id: sede.id.toString(),
            nombre_display: sede.nombre_display,
          }))
        );
      } catch (err) {
        console.error('Error al obtener sedes:', err);
      } finally {
        setSedesLoading(false);
      }
    };
    fetchSedes();
  }, []);

  console.log('RegistrarUnidadProductivaForm - Datos:', { formData, sedes, encargados, tipos });

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 p-2 rounded bg-red-50 mb-4">
          {error}
        </div>
      )}

      <Input
        label="Nombre*"
        placeholder="Ingrese el nombre de la unidad"
        value={formData.nombre}
        onChange={(e) => onChange('nombre', e.target.value)}
        isRequired
        isDisabled={optionsLoading || sedesLoading}
        className="w-full"
      />

      <Select
        label="Tipo*"
        placeholder="Seleccione el tipo"
        selectedKeys={formData.tipo ? [formData.tipo] : []}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0]?.toString() || '';
          console.log('Select tipo - Valor seleccionado:', value);
          onChange('tipo', value);
        }}
        isRequired
        isDisabled={optionsLoading || tipos.length === 0}
        className="w-full"
      >
        {tipos.length === 0 ? (
          <SelectItem key="no-options" isDisabled>
            No hay tipos disponibles
          </SelectItem>
        ) : (
          tipos.map((tipo) => (
            <SelectItem key={tipo.value}>
              {tipo.label}
            </SelectItem>
          ))
        )}
      </Select>

      <Select
        label="Sede*"
        placeholder="Seleccione la sede"
        selectedKeys={formData.sede ? [formData.sede] : []}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0]?.toString() || '';
          console.log('Select sede - Valor seleccionado:', value);
          onChange('sede', value);
        }}
        isRequired
        isDisabled={sedesLoading || sedes.length === 0}
        className="w-full"
      >
        {sedes.length === 0 ? (
          <SelectItem key="no-options" isDisabled>
            No hay sedes disponibles
          </SelectItem>
        ) : (
          sedes.map((sede) => (
            <SelectItem key={sede.id}>
              {sede.nombre_display}
            </SelectItem>
          ))
        )}
      </Select>

      <Select
        label="Encargado"
        placeholder="Seleccione el encargado"
        selectedKeys={formData.encargado ? [formData.encargado] : []}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0]?.toString() || '';
          console.log('Select encargado - Valor seleccionado:', value);
          onChange('encargado', value);
        }}
        isDisabled={optionsLoading || encargados.length === 0}
        className="w-full"
      >
        {encargados.length === 0 ? (
          <SelectItem key="no-options" isDisabled>
            No hay encargados disponibles
          </SelectItem>
        ) : (
          encargados.map((encargado) => (
            <SelectItem key={encargado.id.toString()}>
              {encargado.nombre_completo}
            </SelectItem>
          ))
        )}
      </Select>

      <Input
        label="Horario de Atención*"
        placeholder="Ingrese el horario de atención"
        value={formData.horario_atencion}
        onChange={(e) => onChange('horario_atencion', e.target.value)}
        isRequired
        isDisabled={optionsLoading || sedesLoading}
        className="w-full"
      />

      <div className="flex justify-end pt-4">
        <Button
          color="primary"
          onPress={onSubmit}
          isLoading={loading}
          isDisabled={
            loading ||
            !formData.nombre ||
            !formData.tipo ||
            !formData.sede ||
            !formData.horario_atencion
          }
          className="w-full md:w-auto"
        >
          {loading ? 'Guardando...' : 'Guardar Unidad'}
        </Button>
      </div>
    </div>
  );
};