/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import logoQuimico from './assets/logoquimico.png';
import {
  Shield,
  CheckCircle,
  TrendingDown,
  Users,
  Factory,
  Settings,
  Package,
  Leaf,
  BarChart3,
  Calendar,
  Clock,
  Download,
  Edit3,
  Eye,
  EyeOff,
  X,
  ChevronLeft,
  Zap,
  Info,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  History,
  Plus,
  Trash2,
  Database,
  Target,
  LogOut,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { cn } from './lib/utils';
import { Area, Kpi, UserRole, SqcdpCat, Status, KpiHistory } from './types';
import { AREAS, SQCDP_CATEGORIES, INITIAL_DATA, MONTHS, YEARS, WEEKS } from './constants/data';
import LoginScreen from './LoginScreen';
import { Navbar } from './components/Navbar';
import { AreasListManager } from './components/AreasListManager';
import { areaService } from './services/areaService';
import { CatalogosKPIService } from './services/CatalogosKPI';
import { KpiCard } from './components/KpiCard';
import { SqcdpPillars } from './components/SqcdpPillars';
import { KPIManagerHistorico } from './components/KPIManagerHistorico';
import { kpiHistoricoService } from './services/kpiHistoricoService';
import { KpiHistoricoSemanal } from './types';
import { KPIDetailsModal } from './components/KPIDetailsModal';
import { PanoramaGlobal } from './components/PanoramaGlobal';

// --- Utility Components ---

const StatusBadge = ({ status }: { status: Status }) => {
  const styles = {
    green: "bg-green-100 text-green-700 border-green-200",
    yellow: "bg-amber-100 text-amber-700 border-amber-200",
    red: "bg-red-100 text-red-700 border-red-200"
  };
  const text = { green: 'En Meta', yellow: 'Alerta', red: 'Crítico' };
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs", styles[status])}>
      {text[status]}
    </span>
  );
};

const IconWrapper = ({ name, size = 20, className }: { name: string, size?: number, className?: string }) => {
  const icons: Record<string, any> = {
    Shield, CheckCircle, Leaf, Factory, Settings, Package, Users, Zap, Target
  };
  const Icon = icons[name] || Info;
  return <Icon size={size} className={cn("text-slate-700", className)} />;
};



// --- Main App Component ---

export default function App() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [data, setData] = useState<Kpi[]>([]); // Initialize empty, optionally load from API later
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<string>('overview'); // 'overview' | 'master' | ID del área
  const [user, setUser] = useState<{ email: string; role: UserRole } | null>(() => {
    try {
      const saved = localStorage.getItem('kpi_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState<UserRole>(user ? user.role : 'viewer');

  useEffect(() => {
    if (user) {
      localStorage.setItem('kpi_user_session', JSON.stringify(user));
      setRole(user.role);
    } else {
      localStorage.removeItem('kpi_user_session');
      setRole('viewer');
    }
  }, [user]);

  const fetchAreas = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const jsonData = await areaService.getAreas();
      if (jsonData && jsonData.Areas) {
        const fetchedAreas: Area[] = jsonData.Areas.map((a: any) => ({
          id: a.AreaId,
          name: a.AreaDescripcion,
          icon: a.AreaIcon || 'Factory',
          color: a.AreaColor || 'slate'
        }));
        setAreas(fetchedAreas);
        
        // Cargar todos los KPIs dinámicamente desde la API para cada una de las áreas
        const kpisPromises = fetchedAreas.map(async (area) => {
          try {
            const rawKpis = await CatalogosKPIService.getAreaKPIs(area.id);
            console.log(`[KPIs] Área ${area.id}:`, rawKpis);
            // Asegurar que rawKpis es un array antes de mapear
            if (!Array.isArray(rawKpis)) {
              console.warn(`[KPIs] Área ${area.id}: respuesta no es un array`, rawKpis);
              return [];
            }
            // Mapeamos el formato de la API al formato Kpi interno utilizado por el Dashboard (solo KPIs activos)
            return rawKpis
              .filter((rk: any) => rk.Activo !== false && rk.KPIActivo !== false && rk.activo !== false)
              .map((rk: any) => ({
                id: String(rk.KPI || rk.ID),
                areaId: rk.AreaId || area.id,
                cat: (rk.Categoria as SqcdpCat) || 'S',
                label: rk.Descripcion || 'Sin descripción',
                target: parseFloat(rk.MetaActual ?? rk.Meta) || 0,
                dir: rk.Direccion === 2 ? -1 : 1,
                unit: rk.Unidaddemedida || '',
                is_visible_top: rk.Activo ?? rk.KPIActivo ?? rk.activo ?? true,
                history: [] // La API de histórico no está especificada en esta historia
              }));
          } catch (err) {
            console.error(`Error cargando KPIs para área ${area.id}`, err);
            return [];
          }
        });
        
        const allKpisLists = await Promise.all(kpisPromises);
        const allKpis = allKpisLists.flat();
        setData(allKpis);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (err) {
      console.error(err);
      setApiError('Error de conexión con los servicios de Planta. No es posible cargar la información en este momento.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);
  const [selectedHistoricoData, setSelectedHistoricoData] = useState<KpiHistoricoSemanal | undefined>(undefined);
  const [historicoMap, setHistoricoMap] = useState<Record<number, KpiHistoricoSemanal>>({});
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [historicoError, setHistoricoError] = useState<string | null>(null);
  const [viewingKpiDetails, setViewingKpiDetails] = useState<Kpi | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'error' | 'info' } | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<Kpi | null>(null);
  const LS_KEY = 'kpi_visible_top_map_v1';

  // Estados de filtros
  const [filters, setFilters] = useState(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    let shouldReset = false;

    try {
      const lastInitDate = localStorage.getItem('kpi_last_init_date');
      if (lastInitDate !== todayStr) {
        shouldReset = true;
      }
    } catch (e) {
      shouldReset = true;
    }

    try {
      if (!shouldReset) {
        const saved = localStorage.getItem('kpi_selected_filters');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.year && parsed.month && parsed.week) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading filters from localStorage', e);
    }

    const tempDate = new Date(now.valueOf());
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
    const week1 = new Date(tempDate.getFullYear(), 0, 4);
    const currentWeekNum = Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7) + 1;
    const currentYearNum = tempDate.getFullYear();

    const weekStr = String(Math.max(1, Math.min(52, currentWeekNum)));
    const yearStr = String(currentYearNum);

    const getMonthFromWeekLocal = (yearStr: string, weekStr: string): string => {
      const year = parseInt(yearStr, 10) || 2026;
      const week = parseInt(weekStr, 10) || 1;
      const janFirst = new Date(year, 0, 1);
      const daysOffset = (week - 1) * 7 + 3;
      const targetDate = new Date(janFirst.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      const monthIndex = targetDate.getMonth();
      return MONTHS[monthIndex] || MONTHS[0];
    };

    const monthStr = getMonthFromWeekLocal(yearStr, weekStr);

    try {
      localStorage.setItem('kpi_last_init_date', todayStr);
    } catch (e) {
      console.warn('Error writing kpi_last_init_date to localStorage', e);
    }

    return {
      year: yearStr,
      month: monthStr,
      week: weekStr
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('kpi_selected_filters', JSON.stringify(filters));
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem('kpi_last_init_date', todayStr);
    } catch (e) {
      console.warn('Error saving filters to localStorage', e);
    }
  }, [filters]);

  const getMonthFromWeek = (yearStr: string, weekStr: string): string => {
    const year = parseInt(yearStr, 10) || 2026;
    const week = parseInt(weekStr, 10) || 1;
    const janFirst = new Date(year, 0, 1);
    const daysOffset = (week - 1) * 7 + 3;
    const targetDate = new Date(janFirst.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    const monthIndex = targetDate.getMonth();
    return MONTHS[monthIndex] || MONTHS[0];
  };

  const weekRange = useMemo(() => {
    const year = parseInt(filters.year, 10) || 2026;
    const week = parseInt(filters.week, 10) || 1;
    
    // ISO 8601: la semana 1 es la que contiene el primer jueves del año (o el 4 de enero)
    const jan4 = new Date(year, 0, 4);
    const day = jan4.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const mondayOfW1 = new Date(jan4.getTime() + diffToMonday * 24 * 60 * 60 * 1000);
    
    const startOfWeek = new Date(mondayOfW1.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);

    const format = (d: Date) => {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    return {
      start: format(startOfWeek),
      end: format(endOfWeek)
    };
  }, [filters.year, filters.week]);


  const MONTH_MAP_TO_NUM: Record<string, number> = {
    'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6,
    'Julio': 7, 'Agosto': 8, 'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
  };

  const fetchHistorico = async () => {
    if (view === 'overview' || view === 'master') {
      setHistoricoMap({});
      return;
    }
    setLoadingHistorico(true);
    setHistoricoError(null);
    try {
      const yearNum = parseInt(filters.year, 10);
      const monthNum = MONTH_MAP_TO_NUM[filters.month] || 1;
      const weekNum = parseInt(filters.week, 10);
      const list = await kpiHistoricoService.getHistoricoSemanal(yearNum, monthNum, weekNum, view);
      
      const map: Record<number, KpiHistoricoSemanal> = {};
      list.forEach(item => {
        map[item.KPIID] = item;
      });
      setHistoricoMap(map);
    } catch (err: any) {
      console.error('Error fetching historico:', err);
      setHistoricoError(err.message || 'Error al obtener datos históricos del servicio.');
      setHistoricoMap({});
    } finally {
      setLoadingHistorico(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, [view, filters.year, filters.month, filters.week]);


  // Helpers
  const getKpiStatus = (k: Kpi, year: string, month: string, week: string) => {
    const record = k.history.find(h => h.year === year && h.month === month && h.week === week);
    if (!record) return { value: 0, comment: '', status: 'red' as Status };

    const val = record.value;
    const ratio = k.dir === 1 ? val / k.target : k.target / val;
    let status: Status = 'red';
    if (ratio >= 0.98) status = 'green';
    else if (ratio >= 0.90) status = 'yellow';

    return { value: val, comment: record.comment, status };
  };

  // Evaluador ACR: si hay 2 tendencias seguidas negativas en los últimos 3 periodos marcar requiere_acr
  const evaluateACR = (k: Kpi) => {
    const hist = [...k.history].sort((a, b) => (`${a.year}-${a.month}-W${a.week}`).localeCompare(`${b.year}-${b.month}-W${b.week}`));
    if (hist.length < 3) return false;
    const last3 = hist.slice(-3);
    const v1 = last3[0].value;
    const v2 = last3[1].value;
    const v3 = last3[2].value;

    // cambios consecutivos
    const delta1 = v2 - v1;
    const delta2 = v3 - v2;

    // para dir === 1, tendencia negativa es delta < 0, para dir === -1 negativa es delta > 0
    const neg1 = k.dir === 1 ? delta1 < 0 : delta1 > 0;
    const neg2 = k.dir === 1 ? delta2 < 0 : delta2 > 0;

    // además exigir que los dos últimos periodos estén por fuera de umbral de cumplimiento (ej. <98%)
    const ratio2 = k.dir === 1 ? v2 / k.target : k.target / v2;
    const ratio3 = k.dir === 1 ? v3 / k.target : k.target / v3;
    const belowThreshold = ratio2 < 0.98 && ratio3 < 0.98;

    return neg1 && neg2 && belowThreshold;
  };

  // derive processed data with ACR flags
  const processedData = useMemo(() => {
    return data.map(k => ({ ...k, requiere_acr: evaluateACR(k) }));
  }, [data]);

  // Cargar visibilidad desde localStorage al iniciar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const map: Record<string, boolean> = JSON.parse(raw);
      if (Object.keys(map).length === 0) return;
      setData(prev => prev.map(k => ({ ...k, is_visible_top: map[k.id] ?? !!k.is_visible_top })));
    } catch (err) {
      console.warn('Error leyendo visibilidad KPIs de localStorage', err);
    }
  }, []);

  const persistVisibilityMap = (arr: Kpi[]) => {
    try {
      const map = arr.reduce((acc: Record<string, boolean>, k) => { acc[k.id] = !!k.is_visible_top; return acc; }, {});
      localStorage.setItem(LS_KEY, JSON.stringify(map));
    } catch (err) {
      console.warn('Error guardando visibilidad KPIs en localStorage', err);
    }
  };

  // Cálculos globales
  const stats = useMemo(() => {
    return areas.reduce((acc, area) => {
      const areaKpis = data.filter(k => k.areaId === area.id);
      if (areaKpis.length === 0) { acc[area.id] = 0; return acc; }
      const green = areaKpis.filter(k => {
        const { status } = getKpiStatus(k, filters.year, filters.month, filters.week);
        return status === 'green';
      }).length;
      acc[area.id] = Math.round((green / areaKpis.length) * 100);
      return acc;
    }, {} as Record<string, number>);
  }, [data, areas, filters]);

  const globalChartData = useMemo(() => {
    return areas.map(area => ({
      name: area.name,
      score: stats[area.id] || 0
    })).sort((a, b) => b.score - a.score);
  }, [areas, stats]);

  const handleSaveKpiValue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingKpi) return;

    const formData = new FormData(e.currentTarget);
    const newValue = parseFloat(formData.get('value') as string);
    const newComment = formData.get('comment') as string;
    const selectedYear = formData.get('year') as string;
    const selectedMonth = formData.get('month') as string;
    const selectedWeek = formData.get('week') as string;
    const newTarget = role === 'admin' ? parseFloat(formData.get('target') as string) : editingKpi.target;
    const newCatRaw = formData.get('cat') as SqcdpCat | null;

    setData(prev => prev.map(kpi => {
      if (kpi.id !== editingKpi.id) return kpi;

      const history = [...kpi.history];
      const existingIndex = history.findIndex(h => h.year === selectedYear && h.month === selectedMonth && h.week === selectedWeek);

      const newRecord: KpiHistory = {
        id: existingIndex !== -1 ? history[existingIndex].id : `h-${Date.now()}`,
        year: selectedYear,
        month: selectedMonth,
        week: selectedWeek,
        value: newValue,
        comment: newComment,
        updatedAt: new Date().toISOString()
      };

      if (existingIndex !== -1) {
        history[existingIndex] = newRecord;
      } else {
        history.push(newRecord);
      }

      return {
        ...kpi,
        target: newTarget,
        cat: newCatRaw ?? kpi.cat,
        history
      };
    }));
    setEditingKpi(null);
  };

  const [addingKpiToArea, setAddingKpiToArea] = useState<string | null>(null);

  const handleCreateKpi = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addingKpiToArea) return;
    const formData = new FormData(e.currentTarget);

    const newKpi: Kpi = {
      id: `k-${Date.now()}`,
      areaId: addingKpiToArea,
      cat: formData.get('cat') as SqcdpCat,
      label: formData.get('label') as string,
      target: parseFloat(formData.get('target') as string),
      dir: formData.get('dir') === '-1' ? -1 : 1,
      unit: formData.get('unit') as string,
      history: []
    };

    setData(prev => [...prev, newKpi]);
    setAddingKpiToArea(null);
  };

  const handleDeleteKpi = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este indicador?')) {
      setData(prev => prev.filter(k => k.id !== id));
    }
  };

  const performToggleVisibility = (kpi: Kpi) => {
    const currentlyVisible = !!kpi.is_visible_top;
    if (!currentlyVisible) {
      const count = data.filter(d => d.areaId === kpi.areaId && d.is_visible_top).length;
      if (count >= 2) {
        setToast({ message: 'Solo puedes destacar 2 KPIs por área. Oculta uno primero.', type: 'error' });
        setConfirmToggle(null);
        setTimeout(() => setToast(null), 4000);
        return;
      }
    }

    // Aplicar cambio y persistir inmediatamente
    const newData = data.map(d => d.id === kpi.id ? { ...d, is_visible_top: !currentlyVisible } : d);
    setData(newData);
    persistVisibilityMap(newData);
    setConfirmToggle(null);
  };

  const currentArea = view !== 'overview' && view !== 'master' ? areas.find(a => a.id === view) : null;



  if (!user) {
    return <LoginScreen onLoginSuccess={(loginData) => setUser(loginData.user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* Header */}
      <header className="max-w-7xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <div 
              className="flex items-center gap-3 mb-1 cursor-pointer group"
              onClick={() => setView('overview')}
              title="Ir al inicio"
            >
              <img 
                src={logoQuimico} 
                alt="Logo Químico" 
                className="min-w-[16px] min-h-[16px] max-w-[65px] max-h-[65px] w-auto h-auto object-contain transition-transform group-hover:scale-105"
              />
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">KPI Planta Polak</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pillar Management System</p>
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            {/* Filtros Temporales */}
            <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
                <Calendar size={16} className="text-slate-600" />
                <select
                  value={filters.year}
                  onChange={(e) => {
                    const newYear = e.target.value;
                    const newMonth = getMonthFromWeek(newYear, filters.week);
                    setFilters(f => ({ ...f, year: newYear, month: newMonth }));
                  }}
                  className="bg-transparent text-[11px] font-black text-slate-700 outline-none cursor-pointer appearance-none uppercase"
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <select
                value={filters.month}
                onChange={(e) => setFilters(f => ({ ...f, month: e.target.value }))}
                className="bg-transparent text-[11px] font-black text-slate-700 outline-none cursor-pointer appearance-none px-2 border-r border-slate-200 uppercase"
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="flex items-center gap-1 pl-2 pr-2 py-0.5 bg-green-100 text-green-700 rounded-lg border border-green-200">
                <span className="text-[10px] font-black text-green-700 uppercase">W</span>
                <select
                  value={filters.week}
                  onChange={(e) => {
                    const newWeek = e.target.value;
                    const newMonth = getMonthFromWeek(filters.year, newWeek);
                    setFilters(f => ({ ...f, week: newWeek, month: newMonth }));
                  }}
                  className="bg-transparent text-[11px] font-black text-green-700 outline-none cursor-pointer appearance-none uppercase mr-1"
                >
                  {WEEKS.map(w => <option key={w} value={w} className="text-slate-800 bg-white">{w}</option>)}
                </select>
                <span className="text-[9px] font-black text-green-600/80 border-l border-green-300 pl-1.5 whitespace-nowrap">
                  {weekRange.start} - {weekRange.end}
                </span>
              </div>
            </div>

            <button className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95">
              <Download size={16} /> Exportar WCM
            </button>

            {/* Información de Sesión de Usuario */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 px-3 ml-auto md:ml-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                {user.email.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] font-black text-slate-800 leading-none mb-0.5">{user.email}</p>
                <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[8px] font-black uppercase tracking-wider">
                  {role === 'admin' ? 'Administrador' : role === 'operator' ? 'Operador' : 'Visor'}
                </span>
              </div>
              <button
                onClick={() => setUser(null)}
                title="Cerrar Sesión"
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando Estructura de Planta...</p>
          </div>
        ) : apiError ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-10 text-center shadow-sm">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">Servicio Temporalmente Inactivo</h2>
            <p className="text-slate-600 font-medium mb-6 max-w-lg mx-auto">
              {apiError}
            </p>
            <button
              onClick={() => fetchAreas()}
              className="bg-red-600 hover:bg-red-700 text-white font-black py-3 px-8 rounded-2xl shadow-xl shadow-red-200 transition-all uppercase text-[11px] tracking-widest"
            >
              Reintentar Conexión
            </button>
          </div>
        ) : (
          <>
            {/* Navegación y Perfiles Dinámicos */}
            <Navbar
              areas={areas}
              view={view}
              setView={setView}
              userEmail={user.email}
              onRolesResolved={setRole}
            />

            <AnimatePresence mode="wait">
              {view === 'overview' ? (
                <PanoramaGlobal
                  areas={areas}
                  filters={filters}
                  data={data}
                  setView={setView}
                  getKpiStatus={getKpiStatus}
                  stats={stats}
                  globalChartData={globalChartData}
                />
              ) : view === 'master' ? (
                <AreasListManager
                  key="master"
                  areas={areas}
                  role={role}
                  onAreasUpdated={fetchAreas}
                />
              ) : (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setView('overview')}
                        className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <div>
                        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                          {currentArea && <IconWrapper name={currentArea.icon} size={32} className="text-blue-600" />}
                          Pilar {currentArea?.name}
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ltidimensional SQCDP</p>
                      </div>
                    </div>
                  </div>

                  <SqcdpPillars
                    data={data}
                    view={view}
                    filters={filters}
                    role={role}
                    historicoMap={historicoMap}
                    onEdit={(kpi, historicoData) => {
                      setEditingKpi(kpi);
                      setSelectedHistoricoData(historicoData);
                    }}
                    onViewDetails={(kpi) => setViewingKpiDetails(kpi)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      <AnimatePresence>
        {confirmToggle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmToggle(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[1rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6">
                <h3 className="text-lg font-black text-slate-800">{confirmToggle.is_visible_top ? 'Ocultar KPI del Top' : 'Mostrar KPI en Top'}</h3>
                <p className="text-[12px] text-slate-500 mt-2">¿Deseas {confirmToggle.is_visible_top ? 'ocultar' : 'mostrar'} <strong>{confirmToggle.label}</strong> en la sección superior?</p>
                <div className="mt-6 flex gap-3 justify-end">
                  <button onClick={() => setConfirmToggle(null)} className="px-4 py-2 rounded-xl border border-slate-200 font-black text-slate-600">Cancelar</button>
                  <button onClick={() => performToggleVisibility(confirmToggle)} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-black">Confirmar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {toast && (
          <div className="fixed right-6 bottom-6 z-60">
            <div className={cn('px-4 py-3 rounded-xl shadow-lg text-white font-black', toast.type === 'error' ? 'bg-red-600' : 'bg-slate-800')}>
              {toast.message}
            </div>
          </div>
        )}
        {viewingKpiDetails && (
          <KPIDetailsModal
            kpi={viewingKpiDetails}
            ano={parseInt(filters.year, 10)}
            areas={areas}
            onClose={() => setViewingKpiDetails(null)}
            isAdmin={role === 'admin'}
          />
        )}
      </AnimatePresence>

      {/* Modal Edición Admin */}
      <AnimatePresence>


        {addingKpiToArea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddingKpiToArea(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="bg-slate-50 px-8 py-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Nuevo Indicador (KPI)</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Área: {areas.find(a => a.id === addingKpiToArea)?.name}</p>
                </div>
                <button onClick={() => setAddingKpiToArea(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateKpi} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Nombre del Indicador</label>
                  <input name="label" type="text" autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Categoría SQCDP</label>
                    <select name="cat" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none" required>
                      <option value="S">Seguridad (S)</option>
                      <option value="Q">Calidad (Q)</option>
                      <option value="C">Costo (C)</option>
                      <option value="D">Entrega (D)</option>
                      <option value="P">Personas (P)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Meta Semestral</label>
                    <input name="target" type="number" step="any" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Unidad (%, kg, etc.)</label>
                    <input name="unit" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Dirección de Mejora</label>
                    <select name="dir" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none" required>
                      <option value="1">Ascendente (Más es mejor)</option>
                      <option value="-1">Descendente (Menos es mejor)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98] uppercase text-[11px] tracking-widest">
                  Crear Indicador
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {editingKpi && (
          <KPIManagerHistorico
            areaId={view}
            kpiId={parseInt(editingKpi.id, 10)}
            kpiLabel={editingKpi.label}
            kpiUnit={editingKpi.unit}
            kpiCat={editingKpi.cat}
            historicoId={selectedHistoricoData ? selectedHistoricoData.Historico : '0'}
            ano={parseInt(filters.year, 10)}
            mes={MONTH_MAP_TO_NUM[filters.month] || 1}
            semana={parseInt(filters.week, 10)}
            userEmail={user.email}
            initialValor={selectedHistoricoData ? selectedHistoricoData.Valor : ''}
            initialComentarios={selectedHistoricoData ? selectedHistoricoData.Comentarios : ''}
            onClose={() => {
              setEditingKpi(null);
              setSelectedHistoricoData(undefined);
            }}
            onSaved={() => {
              setEditingKpi(null);
              setSelectedHistoricoData(undefined);
              fetchHistorico();
            }}
          />
        )}
      </AnimatePresence>

      <footer className="max-w-7xl mx-auto mt-12 py-8 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-40">
            <BarChart3 size={14} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Lean WCM Framework © 2026</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-[9px] font-black text-slate-400 uppercase hover:text-blue-600 transition-colors">Manual de Usuario</a>
            <a href="#" className="text-[9px] font-black text-slate-400 uppercase hover:text-blue-600 transition-colors">Politicas EHS</a>
            <a href="#" className="text-[9px] font-black text-slate-400 uppercase hover:text-blue-600 transition-colors">Soporte TI</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
