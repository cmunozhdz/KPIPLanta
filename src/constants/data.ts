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
  // Seguridad
  {
    id: 'seg-1', areaId: 'seg', cat: 'S', label: 'Índice de Accidentes', target: 0, dir: -1, unit: 'acc', is_visible_top: true,
    history: [
      { id: 'h-s-1', year: '2026', month: 'Mayo', week: '17', value: 2, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-s-2', year: '2026', month: 'Mayo', week: '18', value: 1, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-s-3', year: '2026', month: 'Mayo', week: '19', value: 0, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'seg-2', areaId: 'seg', cat: 'P', label: 'Días sin Incidentes', target: 365, dir: 1, unit: 'días', is_visible_top: true,
    history: [
      { id: 'h-sd-1', year: '2026', month: 'Mayo', week: '17', value: 240, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-sd-2', year: '2026', month: 'Mayo', week: '18', value: 244, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-sd-3', year: '2026', month: 'Mayo', week: '19', value: 245, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'seg-3', areaId: 'seg', cat: 'S', label: 'Near Misses', target: 0, dir: -1, unit: 'eventos', is_visible_top: false,
    history: [
      { id: 'h-nm-1', year: '2026', month: 'Mayo', week: '17', value: 5, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-nm-2', year: '2026', month: 'Mayo', week: '18', value: 6, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-nm-3', year: '2026', month: 'Mayo', week: '19', value: 7, comment: '', updatedAt: '2026-05-15' }
    ]
  },

  // Calidad
  {
    id: 'cal-1', areaId: 'cal', cat: 'Q', label: 'Índice de Rechazo (Scrap)', target: 2, dir: -1, unit: '%', is_visible_top: true,
    history: [
      { id: 'h-c-1', year: '2026', month: 'Mayo', week: '17', value: 2.1, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-c-2', year: '2026', month: 'Mayo', week: '18', value: 2.4, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-c-3', year: '2026', month: 'Mayo', week: '19', value: 2.8, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'cal-2', areaId: 'cal', cat: 'Q', label: 'Reclamos de Clientes', target: 0, dir: -1, unit: 'casos', is_visible_top: false,
    history: [
      { id: 'h-rc-1', year: '2026', month: 'Mayo', week: '17', value: 1, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-rc-2', year: '2026', month: 'Mayo', week: '18', value: 2, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-rc-3', year: '2026', month: 'Mayo', week: '19', value: 3, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'cal-3', areaId: 'cal', cat: 'Q', label: 'Cumplimiento de Especificaciones', target: 98, dir: 1, unit: '%', is_visible_top: true,
    history: [
      { id: 'h-ce-1', year: '2026', month: 'Mayo', week: '17', value: 97.2, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-ce-2', year: '2026', month: 'Mayo', week: '18', value: 96.8, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-ce-3', year: '2026', month: 'Mayo', week: '19', value: 96.5, comment: '', updatedAt: '2026-05-15' }
    ]
  },

  // Producción Agrícola
  {
    id: 'agro-1', areaId: 'agro', cat: 'C', label: 'Rendimiento por Hectárea', target: 8, dir: 1, unit: 't/ha', is_visible_top: true,
    history: [
      { id: 'h-a-1', year: '2026', month: 'Mayo', week: '17', value: 7.5, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-a-2', year: '2026', month: 'Mayo', week: '18', value: 7.3, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-a-3', year: '2026', month: 'Mayo', week: '19', value: 7.0, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'agro-2', areaId: 'agro', cat: 'D', label: 'Eficiencia de Riego', target: 90, dir: 1, unit: '%', is_visible_top: false,
    history: [
      { id: 'h-ar-1', year: '2026', month: 'Mayo', week: '17', value: 88, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-ar-2', year: '2026', month: 'Mayo', week: '18', value: 87, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-ar-3', year: '2026', month: 'Mayo', week: '19', value: 86, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'agro-3', areaId: 'agro', cat: 'C', label: 'Cumplimiento de Cosecha', target: 95, dir: 1, unit: '%', is_visible_top: true,
    history: [
      { id: 'h-ac-1', year: '2026', month: 'Mayo', week: '17', value: 93, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-ac-2', year: '2026', month: 'Mayo', week: '18', value: 92, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-ac-3', year: '2026', month: 'Mayo', week: '19', value: 91, comment: '', updatedAt: '2026-05-15' }
    ]
  },

  // Producción Industrial
  {
    id: 'ind-1', areaId: 'ind', cat: 'C', label: 'OEE General', target: 85, dir: 1, unit: '%', is_visible_top: true,
    history: [
      { id: 'h-i-1', year: '2026', month: 'Mayo', week: '17', value: 84, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-i-2', year: '2026', month: 'Mayo', week: '18', value: 82, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-i-3', year: '2026', month: 'Mayo', week: '19', value: 80, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'ind-2', areaId: 'ind', cat: 'D', label: 'Disponibilidad de Planta', target: 95, dir: 1, unit: '%', is_visible_top: false,
    history: [
      { id: 'h-id-1', year: '2026', month: 'Mayo', week: '17', value: 94, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-id-2', year: '2026', month: 'Mayo', week: '18', value: 93, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-id-3', year: '2026', month: 'Mayo', week: '19', value: 92, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'ind-3', areaId: 'ind', cat: 'C', label: 'Cumplimiento del Plan de Producción', target: 98, dir: 1, unit: '%', is_visible_top: true,
    history: [
      { id: 'h-ip-1', year: '2026', month: 'Mayo', week: '17', value: 96, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-ip-2', year: '2026', month: 'Mayo', week: '18', value: 95, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-ip-3', year: '2026', month: 'Mayo', week: '19', value: 94, comment: '', updatedAt: '2026-05-15' }
    ]
  },

  // Mantenimiento
  {
    id: 'mant-1', areaId: 'mant', cat: 'C', label: 'MTBF', target: 200, dir: 1, unit: 'hrs', is_visible_top: true,
    history: [
      { id: 'h-m-1', year: '2026', month: 'Mayo', week: '17', value: 180, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-m-2', year: '2026', month: 'Mayo', week: '18', value: 170, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-m-3', year: '2026', month: 'Mayo', week: '19', value: 160, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'mant-2', areaId: 'mant', cat: 'C', label: 'MTTR', target: 4, dir: -1, unit: 'hrs', is_visible_top: true,
    history: [
      { id: 'h-mt-1', year: '2026', month: 'Mayo', week: '17', value: 3.5, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-mt-2', year: '2026', month: 'Mayo', week: '18', value: 3.8, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-mt-3', year: '2026', month: 'Mayo', week: '19', value: 4.2, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'mant-3', areaId: 'mant', cat: 'P', label: 'Backlog de Órdenes', target: 10, dir: -1, unit: 'órdenes', is_visible_top: false,
    history: [
      { id: 'h-mb-1', year: '2026', month: 'Mayo', week: '17', value: 12, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-mb-2', year: '2026', month: 'Mayo', week: '18', value: 11, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-mb-3', year: '2026', month: 'Mayo', week: '19', value: 10, comment: '', updatedAt: '2026-05-15' }
    ]
  },

  // Almacén
  {
    id: 'alm-1', areaId: 'alm', cat: 'D', label: 'Precisión de Inventario (ERI)', target: 98, dir: 1, unit: '%', is_visible_top: true,
    history: [
      { id: 'h-al-1', year: '2026', month: 'Mayo', week: '17', value: 97, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-al-2', year: '2026', month: 'Mayo', week: '18', value: 96.5, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-al-3', year: '2026', month: 'Mayo', week: '19', value: 96, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'alm-2', areaId: 'alm', cat: 'D', label: 'Rotación de Inventario', target: 6, dir: 1, unit: 'veces', is_visible_top: false,
    history: [
      { id: 'h-arv-1', year: '2026', month: 'Mayo', week: '17', value: 5.8, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-arv-2', year: '2026', month: 'Mayo', week: '18', value: 5.9, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-arv-3', year: '2026', month: 'Mayo', week: '19', value: 6.0, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'alm-3', areaId: 'alm', cat: 'D', label: 'Entregas a Tiempo (OTIF)', target: 95, dir: 1, unit: '%', is_visible_top: true,
    history: [
      { id: 'h-aot-1', year: '2026', month: 'Mayo', week: '17', value: 93, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-aot-2', year: '2026', month: 'Mayo', week: '18', value: 94, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-aot-3', year: '2026', month: 'Mayo', week: '19', value: 95, comment: '', updatedAt: '2026-05-15' }
    ]
  },

  // Recursos Humanos
  {
    id: 'rrhh-1', areaId: 'rrhh', cat: 'P', label: 'Índice de Rotación', target: 5, dir: -1, unit: '%', is_visible_top: true,
    history: [
      { id: 'h-r-1', year: '2026', month: 'Mayo', week: '17', value: 4.8, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-r-2', year: '2026', month: 'Mayo', week: '18', value: 5.1, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-r-3', year: '2026', month: 'Mayo', week: '19', value: 5.4, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'rrhh-2', areaId: 'rrhh', cat: 'P', label: 'Ausentismo', target: 3, dir: -1, unit: '%', is_visible_top: true,
    history: [
      { id: 'h-aus-1', year: '2026', month: 'Mayo', week: '17', value: 2.8, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-aus-2', year: '2026', month: 'Mayo', week: '18', value: 3.0, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-aus-3', year: '2026', month: 'Mayo', week: '19', value: 3.2, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'rrhh-3', areaId: 'rrhh', cat: 'P', label: 'Horas de Capacitación', target: 40, dir: 1, unit: 'hrs', is_visible_top: false,
    history: [
      { id: 'h-hc-1', year: '2026', month: 'Mayo', week: '17', value: 8, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-hc-2', year: '2026', month: 'Mayo', week: '18', value: 10, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-hc-3', year: '2026', month: 'Mayo', week: '19', value: 12, comment: '', updatedAt: '2026-05-15' }
    ]
  },

  // Medio Ambiente
  {
    id: 'ma-1', areaId: 'ma', cat: 'C', label: 'Consumo de Agua', target: 1000, dir: -1, unit: 'm3', is_visible_top: true,
    history: [
      { id: 'h-ma-1', year: '2026', month: 'Mayo', week: '17', value: 1100, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-ma-2', year: '2026', month: 'Mayo', week: '18', value: 1120, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-ma-3', year: '2026', month: 'Mayo', week: '19', value: 1150, comment: '', updatedAt: '2026-05-15' }
    ]
  }
  ,
  {
    id: 'ma-2', areaId: 'ma', cat: 'C', label: 'Consumo de Energía Eléctrica', target: 50000, dir: -1, unit: 'kWh', is_visible_top: true,
    history: [
      { id: 'h-me-1', year: '2026', month: 'Mayo', week: '17', value: 51000, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-me-2', year: '2026', month: 'Mayo', week: '18', value: 51500, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-me-3', year: '2026', month: 'Mayo', week: '19', value: 52000, comment: '', updatedAt: '2026-05-15' }
    ]
  },
  {
    id: 'ma-3', areaId: 'ma', cat: 'C', label: 'Generación de Residuos Sólidos', target: 50, dir: -1, unit: 'ton', is_visible_top: false,
    history: [
      { id: 'h-mr-1', year: '2026', month: 'Mayo', week: '17', value: 48, comment: '', updatedAt: '2026-05-01' },
      { id: 'h-mr-2', year: '2026', month: 'Mayo', week: '18', value: 49, comment: '', updatedAt: '2026-05-08' },
      { id: 'h-mr-3', year: '2026', month: 'Mayo', week: '19', value: 51, comment: '', updatedAt: '2026-05-15' }
    ]
  }
];

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const currentYear = new Date().getFullYear();
const startYear = 2026;
export const YEARS = Array.from(
  { length: Math.max(1, currentYear - startYear + 1) },
  (_, i) => String(startYear + i)
);
export const WEEKS = Array.from({ length: 52 }, (_, i) => `${i + 1}`);
