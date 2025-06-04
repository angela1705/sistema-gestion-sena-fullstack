// src/types/sede.ts
export interface SenaEmpresaOption {
  id: number;
  nombre: string;
}

export interface Sede {
  id: number;
  nombre: string;
  nombre_display: string;
  nombre_completo: string;
  sena_empresa: number;
  sena_empresa_info: SenaEmpresaOption;
  direccion: string;
  telefono: string;
  responsable: string | null;
  activa: boolean;
  fecha_creacion: string;
}