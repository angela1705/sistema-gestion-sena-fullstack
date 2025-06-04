// src/types/usuarios.ts
export interface Rol {
  id: number;
  nombre: string;
}

export interface Cargo {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Sede {
  id: number;
  nombre: string;
}

export interface Persona {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  identificacion: string;
  telefono: string | null;
  rol: number | null;
  rol_nombre: string | null;
  cargo: number | null;
  cargo_nombre: string | null;
  sede: number | null;
  sede_nombre: string | null;
  numFicha: number | null;
  foto_url: string | null;
}