// src/types/entidades/sede.ts
export interface SedeOption {
  id: number;
  nombre_display: string;
}

export interface SedeFormData {
  nombre: string; // Texto libre
  sena_empresa: string; // ID de SenaEmpresa
  direccion: string;
  telefono: string;
  responsable: string;
  activa: boolean;
}

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