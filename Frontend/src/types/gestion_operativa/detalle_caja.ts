
// src/types/gestion_operativa/detalle_caja.ts
export enum Tipo {
  INGRESO = 'ingreso',
  EGRESO = 'egreso',
  VENTA = 'venta',
}

export interface CajaDiaria {
  id: number;
  nombre?: string; // Ajusta según tu modelo de CajaDiaria
}

export interface Transaccion {
  id: number;
  tipo: string;
  producto?: string; // Ajusta según tu modelo de Transaccion
}

export interface DetalleCaja {
  id: number;
  caja_id: number | null;
  transaccion_id: number | null;
  descripcion: string;
  tipo: Tipo;
  tipo_display: string;
  monto: number;
  fecha: string;
  fecha_formateada: string;
}

export interface DetalleCajaCreateData {
  caja_id?: number | null;
  transaccion_id?: number | null;
  descripcion: string;
  tipo: Tipo;
  monto: number;
}