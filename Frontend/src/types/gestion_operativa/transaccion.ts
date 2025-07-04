export enum TipoTransaccion {
  VENTA = 'venta',
  COMPRA = 'compra',
}

export interface Transaccion {
  id: number;
  tipo: TipoTransaccion;
  tipo_display: string;
  producto: number | null;
  producto_info: { nombre: string } | null;
  nombre_producto: string | null;
  cantidad: number;
  monto_venta: number | null;
  costo: number | null;
  fecha: string;
  usuario: number | null;
  usuario_info: { first_name: string } | null;
}

export interface TransaccionCreateData {
  tipo: TipoTransaccion;
  producto?: number;
  nombre_producto?: string;
  cantidad: number;
  monto_venta?: number;
  costo?: number;
  usuario?: number;
}