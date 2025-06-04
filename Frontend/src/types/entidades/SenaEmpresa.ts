// src/types/senaEmpresa.ts
export interface SenaEmpresa {
  id: number;
  nombre: string;
  nit: string;
  direccion_principal: string;
  telefono_contacto: string;
  email_contacto: string;
  logo?: string | null;
  logo_url?: string | null;
  fecha_creacion: string;
  activa: boolean;
  sedes_activas: any[]; // Ajustar según la estructura real de sedes
  detail_url: string;
}