
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria_info?: { id: number; nombre: string };
  unidadP_info?: { id: number; nombre: string };
  estado: string;
  estado_display: string;
  tipo_gestion: string;
  tipo_gestion_display: string;
  reservas: boolean;
  hora_limite_reserva?: string;
  stock_actual?: number;
  capacidad_diaria?: number;
  precio_compra: number;
  tiene_descuento: boolean;
  porcentaje_descuento?: number;
  precio_descuento?: number;
  precio_final: number;
  imagen_url?: string;
  unidad_medida_base: string;
  unidad_medida_display: string;
}

export interface ProductoFormData {
  nombre: string;
  descripcion: string;
  categoria: string;
  unidadP: string;
  estado: string;
  tipo_gestion: string;
  reservas: boolean;
  hora_limite_reserva?: string;
  stock_actual?: number;
  capacidad_diaria?: number;
  precio_compra: string;
  tiene_descuento: boolean;
  porcentaje_descuento?: string;
  imagen?: File | null;
  unidad_medida_base: string;
}