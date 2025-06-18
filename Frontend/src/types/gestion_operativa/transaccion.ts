
// src/types/gestion_operativa/transaccion.ts
export enum TipoTransaccion {
  VENTA = 'venta',
  COMPRA = 'compra',
  DEVOLUCION = 'devolucion',
  AJUSTE = 'ajuste',
}

export interface Producto {
  id: number;
  nombre: string;
  stock_actual?: number;
  activo?: boolean;
}

export interface Persona {
  id: number;
  nombre_completo: string;
}

export interface Transaccion {
  id: number;
  tipo: TipoTransaccion;
  tipo_display: string;
  producto: number;
  producto_info: Producto;
  cantidad: number;
  fecha: string;
  usuario: number | null;
  usuario_info: Persona | null;
  transaccion_revertida_id: number | null;
}

export interface TransaccionCreateData {
  tipo: TipoTransaccion;
  producto: number;
  cantidad: number;
  usuario?: number | null;
}