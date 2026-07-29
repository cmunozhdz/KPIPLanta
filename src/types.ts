export type AreaId = 'seg' | 'cal' | 'agro' | 'ind' | 'mant' | 'alm' | 'rrhh' | 'ma';
export type SqcdpCat = 'S' | 'Q' | 'C' | 'D' | 'P';
export type Status = 'green' | 'yellow' | 'red';
export type UserRole = 'viewer' | 'operator' | 'admin';

export interface KpiHistory {
  id: string;
  year: string;
  month: string;
  week: string;
  value: number;
  comment: string;
  updatedAt: string;
}

export interface Kpi {
  id: string;
  areaId: string;
  cat: SqcdpCat;
  label: string;
  target: number;
  dir: 1 | -1; // 1: higher is better, -1: lower is better
  unit: string;
  history: KpiHistory[];
  // Optional properties used by the dashboard enhancements
  is_visible_top?: boolean;
  requiere_acr?: boolean;
  tendencia_actual?: 'up' | 'down' | 'stable';
}

export interface KpiHistoricoSemanal {
  Historico: string;       // "0" = sin registro (insert), ≠"0" = existe (edit)
  Registro: string;
  Usuario: string;
  AreaId: string;
  AreaDescripcion: string;
  CategoriaID: string;     // S, Q, C, D, P
  KPIID: number;
  MetaActual: string;
  MetaAsignada: string;
  Valor: string;           // Valor actual del KPI
  Ano: number;
  Mes: number;
  Semana: number;
  Comentarios: string;
  FechaConsulta: string;
  Descripcion: string;
  KPIActivo: boolean;
  Calificacion?: string;
}

export interface Area {
  id: string;
  name: string;
  icon: string; // lucide icon name
  color: string;
}

export interface CalendarioSemanalItem {
  Ano: number;
  Mes: number;
  Semana: number;
  Inicio: string;
  Fin: string;
  Etiqueta: string;
}

export interface CalendarioSemanalResponse {
  CalendarioSQCDPDatas: CalendarioSemanalItem[];
  Count: number;
}

