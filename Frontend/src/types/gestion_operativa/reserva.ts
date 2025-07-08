// types/gestion_operativa/reserva.ts
export interface Persona {
  id: number;
  first_name: string;
  numFicha?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  activo: boolean;
  unidadP?: number;
}

export interface Transaccion {
  id: number;
}

export interface Reserva {
  id: number;
  persona: number;
  persona_info: Persona;
  producto: number;
  producto_info: Producto;
  precio_unitario: string;
  cantidad: number;
  total: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: 'pendiente' | 'pagada' | 'cancelada' | 'entregada';
  estado_display: string;
  transaccion: number | null;
  transaccion_info: Transaccion | null;
}

export interface ReservaCreateData {
  persona?: number;
  producto: number;
  cantidad: number;
  estado?: 'pendiente';
}