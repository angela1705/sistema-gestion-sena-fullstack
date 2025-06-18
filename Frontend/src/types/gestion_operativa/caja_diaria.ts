
// src/types/gestion_operativa/caja_diaria.ts
export interface CajaDiariaCierreData {
  saldo_final: number;
  observaciones: string;
}

export interface CajaDiariaFormData extends CajaDiariaCierreData {
  unidadProductiva?: string; // ID como string para consistencia con Select
  saldo_inicial?: string;    // Valor inicial como string para Input
}