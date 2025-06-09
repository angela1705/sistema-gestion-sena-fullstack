
export interface Precio {
  id: number;
  cargo_info: { id: number; nombre: string };
  producto_info: { id: number; nombre: string };
  valor: string;
}

export interface PrecioFormData {
  cargo: string;
  producto: string;
  valor: string;
}