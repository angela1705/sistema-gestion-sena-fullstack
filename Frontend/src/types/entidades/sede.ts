export interface Sede {
  id: number;
  nombre: string;
  nombre_display: string;
  sena_empresa: number;
  sena_empresa_info: {
    id: number;
    nombre: string;
  };
  direccion: string;
  telefono: string;
  responsable: string | null;
  activa: boolean;
  fecha_creacion: string;
}

export interface SedeFormData {
  nombre: string;
  sena_empresa: string;
  direccion: string;
  telefono: string;
  responsable: string;
  activa: boolean;
}