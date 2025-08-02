export interface UnidadProductiva {
  id: number;
  logo?: string;
  logo_url?: string;
  descripcion: string;
  tipo: string;
  tipo_display?: string;
  activa: boolean;  
  encargado: number | null;
  encargado_info?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  sede: number;
  sede_info?: {
    id: number;
    nombre: string;
  };
  horario_atencion: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface UnidadOpciones {
  tipos: Record<string, string>;
  encargados: Array<{
    id: number;
    nombre_completo: string;
  }>;
}

export interface UnidadOption {
  id: number;
  nombre_display: string;
}

