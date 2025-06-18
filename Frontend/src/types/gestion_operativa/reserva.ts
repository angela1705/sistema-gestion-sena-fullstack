
// src/types/gestion_operaciones/reserva.ts
export interface Persona {
  id: number;
  first_name: string;
  numFicha?: string; // Opcional según tu modelo
}

export interface Producto {
  id: number;
  nombre: string;
  activo: boolean;
  unidadP?: number; // Relación con UnidadProductiva si aplica
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
  precio_unitario: number;
  cantidad: number;
  total: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: string;
  estado_display: string;
  transaccion_info: Transaccion | null;
}

export interface ReservaCreateData {
  persona?: number;
  producto: number;
  cantidad: number;
  estado?: string; // Read-only en serializer, pero lo incluimos por seguridad
}