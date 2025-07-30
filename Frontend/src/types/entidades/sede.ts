export interface Sede {
  id: number;
  nombre: string;
  sena_empresa: number| null;
  sena_empresa_info?: {
    id: number;
    nombre: string;
    nit: string;
  };
  direccion: string;
  telefono: string;
  responsable: string;
  activa: boolean;
  fecha_creacion?: string;
}

export interface SedeOption {
  id: number;
  nombre_display: string;
}