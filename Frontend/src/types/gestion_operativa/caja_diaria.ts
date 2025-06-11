
// src/types/caja_diaria.ts
export interface UnidadProductiva {
  id: number;
  nombre: string;
}

export interface Persona {
  id: number;
  first_name: string;
  // Otros campos según PersonaSerializer
}

export interface CajaDiaria {
  id: number;
  fecha_apertura: string;
  fecha_cierre: string | null;
  duracion: string | null;
  saldo_inicial: number;
  saldo_final: number | null;
  unidadProductiva: number;
  unidadProductiva_info: UnidadProductiva;
  abierta_por: number | null;
  abierta_por_info: Persona | null;
  cerrada_por: number | null;
  cerrada_por_info: Persona | null;
  observaciones: string;
  esta_abierta: boolean;
}

export interface CajaDiariaCierreData {
  saldo_final: number;
  observaciones?: string;
}