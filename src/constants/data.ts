import { Area, Kpi } from '../types';

export const AREAS: Record<string, Area> = {
  seg: { id: 'seg', name: 'Seguridad', icon: 'Shield', color: 'red' },
  cal: { id: 'cal', name: 'Calidad', icon: 'CheckCircle', color: 'blue' },
  agro: { id: 'agro', name: 'Prod. Agrícola', icon: 'Leaf', color: 'green' },
  ind: { id: 'ind', name: 'Prod. Industrial', icon: 'Factory', color: 'indigo' },
  mant: { id: 'mant', name: 'Mantenimiento', icon: 'Settings', color: 'orange' },
  alm: { id: 'alm', name: 'Almacén', icon: 'Package', color: 'slate' },
  rrhh: { id: 'rrhh', name: 'RH', icon: 'Users', color: 'purple' },
  ma: { id: 'ma', name: 'Medio Ambiente', icon: 'Zap', color: 'emerald' }
};

export const SQCDP_CATEGORIES = {
  S: { label: 'Seguridad', color: '#ef4444', description: 'Safety & Health' },
  Q: { label: 'Calidad', color: '#3b82f6', description: 'Quality Control' },
  C: { label: 'Costos', color: '#10b981', description: 'Cost & Productivity' },
  D: { label: 'Entrega', color: '#f59e0b', description: 'Delivery & Logistics' },
  P: { label: 'Personas', color: '#8b5cf6', description: 'People & Morale' }
};

export const INITIAL_DATA: Kpi[] = [
  { 
    id: '1', 
    areaId: 'seg', 
    cat: 'S', 
    label: 'Días sin Accidentes LTI', 
    target: 365, 
    dir: 1, 
    unit: 'días', 
    history: [
      { id: 'h1', year: '2026', month: 'Mayo', week: '17', value: 243, comment: 'Sin incidentes.', updatedAt: '2026-05-01' },
      { id: 'h2', year: '2026', month: 'Mayo', week: '18', value: 244, comment: 'Sin incidentes.', updatedAt: '2026-05-08' },
      { id: 'h3', year: '2026', month: 'Mayo', week: '19', value: 245, comment: 'Sin incidentes.', updatedAt: '2026-05-15' },
    ]
  },
  { 
    id: '2', 
    areaId: 'seg', 
    cat: 'P', 
    label: 'Cumplimiento Capacitación', 
    target: 100, 
    dir: 1, 
    unit: '%', 
    history: [
      { id: 'h4', year: '2026', month: 'Mayo', week: '17', value: 90, comment: 'Inicio cursos.', updatedAt: '2026-05-01' },
      { id: 'h5', year: '2026', month: 'Mayo', week: '18', value: 91, comment: 'Progreso curso alturas.', updatedAt: '2026-05-08' },
      { id: 'h6', year: '2026', month: 'Mayo', week: '19', value: 92, comment: 'Pendiente curso de alturas.', updatedAt: '2026-05-15' },
    ]
  },
  { 
    id: '3', 
    areaId: 'agro', 
    cat: 'C', 
    label: 'OEE Línea 7', 
    target: 85, 
    dir: 1, 
    unit: '%', 
    history: [
      { id: 'h7', year: '2026', month: 'Mayo', week: '17', value: 83, comment: 'Buen ritmo.', updatedAt: '2026-05-01' },
      { id: 'h8', year: '2026', month: 'Mayo', week: '18', value: 82, comment: 'Pequeños ajustes.', updatedAt: '2026-05-08' },
      { id: 'h9', year: '2026', month: 'Mayo', week: '19', value: 81, comment: 'Paros menores por sellado.', updatedAt: '2026-05-15' },
    ]
  },
  { 
    id: '4', 
    areaId: 'cal', 
    cat: 'Q', 
    label: 'First Pass Yield', 
    target: 96, 
    dir: 1, 
    unit: '%', 
    history: [
      { id: 'h10', year: '2026', month: 'Mayo', week: '17', value: 97, comment: 'Calidad estable.', updatedAt: '2026-05-01' },
      { id: 'h11', year: '2026', month: 'Mayo', week: '18', value: 97.2, comment: 'Mejorando.', updatedAt: '2026-05-08' },
      { id: 'h12', year: '2026', month: 'Mayo', week: '19', value: 97.5, comment: 'Excelente desempeño.', updatedAt: '2026-05-15' },
    ]
  }
];

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const YEARS = ['2024', '2025', '2026'];
export const WEEKS = Array.from({ length: 52 }, (_, i) => `${i + 1}`);
