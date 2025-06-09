// src/types/UnidadProductiva.ts
export interface UnidadProductiva {
  id: number;
  nombre: string;
  logo_url: string | null;
  descripcion: string;
  tipo: string;
  tipo_display: string;
  estado: string;
  estado_display: string;
  esta_activa: boolean;
  encargado_info: { id: number; nombre_completo: string } | null;
  sede_info: { id: number; nombre_display: string } | null;
  horario_atencion: string;
  fecha_creacion: string;
}

export interface UnidadProductivaFormData {
  nombre: string;
  tipo: string;
  sede: string;
  encargado: string;
}