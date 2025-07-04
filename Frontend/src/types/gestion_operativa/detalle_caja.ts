export enum Tipo {
  INGRESO = 'ingreso',
  EGRESO = 'egreso',
}

export interface CajaDiaria {
  id: number;
}

export interface Transaccion {
  id: number;
}

export interface DetalleCaja {
  id: number;
  caja: number | null;
  transaccion: number | null;
  descripcion: string;
  tipo: Tipo;
  tipo_display: string;
  monto: number;
  fecha: string;
}

export interface DetalleCajaCreateData {
  caja?: number | null;
  transaccion?: number | null;
  descripcion?: string;
  tipo?: Tipo;
  monto?: number;
}