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
}

export interface Area {
  id: string;
  name: string;
  icon: string; // lucide icon name
  color: string;
}
