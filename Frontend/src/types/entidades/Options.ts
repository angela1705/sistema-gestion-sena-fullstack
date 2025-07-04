// src/types/entidades/Options.ts
export interface SedeOption {
  id: number;
  nombre_display: string;
}

export interface EncargadoOption {
  id: number;
  nombre_completo: string;
}

export type OptionType = SedeOption | EncargadoOption;