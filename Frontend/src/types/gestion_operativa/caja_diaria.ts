export interface CajaDiaria {
  id: number;
  fecha_apertura: string;
  fecha_cierre: string | null;
  saldo_inicial: number;
  saldo_final: number | null;
  unidadProductiva: number;
  unidadProductiva_info: { id: number; nombre: string };
  abierta_por: number | null;
  abierta_por_info: { id: number; nombre: string } | null;
  cerrada_por: number | null;
  cerrada_por_info: { id: number; nombre: string } | null;
  observaciones: string;
  esta_abierta: boolean;
  duracion: string | null;
}

export interface CajaDiariaCierreData {
  saldo_final: string; // String para el input, se parseará a number
  observaciones: string;
}

export interface CajaDiariaFormData extends CajaDiariaCierreData {
  unidadProductiva: string; // ID como string para el Select
  saldo_inicial: string;   // String para el input
}