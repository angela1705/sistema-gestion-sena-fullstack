export interface SenaEmpresa {
  id: number;
  nombre: string;
  nit: string;
  direccion_principal: string;
  telefono_contacto: string;
  email_contacto: string;
  logo?: string | File|null;
  logo_url?: string | null;
  fecha_creacion: string;
  activa: boolean;
  sedes_activas: any[]; 
  detail_url: string;
}

export interface SenaEmpresaOption {
  id: number;
  nombre: string;
}