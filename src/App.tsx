/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
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

// --- KPI Card Component ---

interface KpiCardProps {
  kpi: Kpi;
  currentValue: number;
  currentComment: string;
  role: UserRole;
  onEdit: (kpi: Kpi) => void;
  onViewDetails: (kpi: Kpi) => void;
  onToggleVisibility?: (kpi: Kpi) => void;
  key?: React.Key;
}

const KpiCard = ({ kpi, currentValue, currentComment, role, onEdit, onViewDetails, onToggleVisibility }: KpiCardProps) => {
  const calculateStatus = (k: Kpi, val: number): Status => {
    const ratio = k.dir === 1 ? val / k.target : k.target / val;
    if (ratio >= 0.98) return 'green';
    if (ratio >= 0.90) return 'yellow';
    return 'red';
  };

  const status = calculateStatus(kpi, currentValue);
  const categoryColor = SQCDP_CATEGORIES[kpi.cat]?.color || '#60a5fa';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all h-[280px] min-h-[280px] flex flex-col justify-between"
    >
      <div className="absolute left-0 top-4 bottom-4 w-3 rounded-r-full" style={{ backgroundColor: categoryColor }}></div>
      <div className="p-5 pl-8 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="max-w-[80%]">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white font-black text-xs"
                style={{ backgroundColor: SQCDP_CATEGORIES[kpi.cat]?.color }}
              >
                {kpi.cat}
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-snug">{kpi.label}</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase">{SQCDP_CATEGORIES[kpi.cat]?.label}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <button
              onClick={() => onViewDetails(kpi)}
              className="text-slate-500 hover:text-slate-700 transition-colors p-1"
            >
              <History size={14} />
            </button>
            {role !== 'viewer' && (
              <button
                onClick={() => onEdit(kpi)}
                className="text-slate-500 hover:text-blue-600 transition-colors p-1"
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 tracking-tight">{currentValue ?? '-'}</span>
            <span className="text-xs uppercase font-black text-slate-400 tracking-[0.35em]">{kpi.unit}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 font-bold">{currentComment || 'Sin registro'}</p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Meta: {kpi.target}</span>
          <StatusBadge status={status} />
        </div>
      </div>
    </motion.div>
  );
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
        setData(INITIAL_DATA); // Usar datos locales temporalmente para KPIs mientras no haya API de KPIs completa
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
  const [viewingKpiDetails, setViewingKpiDetails] = useState<Kpi | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'error' | 'info' } | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<Kpi | null>(null);
  const LS_KEY = 'kpi_visible_top_map_v1';

  // Estados de filtros
  const [filters, setFilters] = useState({
    year: '2026',
    month: 'Mayo',
    week: '19'
  });

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

  const KpiDetailsView = ({ kpi }: { kpi: Kpi }) => {
    const chartData = useMemo(() => {
      // Get all history, sort by time (roughly by year/month/week)
      return [...kpi.history]
        .sort((a, b) => {
          const timeA = `${a.year}-${MONTHS.indexOf(a.month).toString().padStart(2, '0')}-W${a.week.padStart(2, '0')}`;
          const timeB = `${b.year}-${MONTHS.indexOf(b.month).toString().padStart(2, '0')}-W${b.week.padStart(2, '0')}`;
          return timeA.localeCompare(timeB);
        })
        .map(h => ({
          name: `W${h.week}`,
          value: h.value,
          target: kpi.target,
          full: `${h.month} ${h.year} - W${h.week}`
        }));
    }, [kpi]);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setViewingKpiDetails(null)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-[2.5rem] w-full max-w-5xl h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-200 flex flex-col"
        >
          {/* Header */}
          <div className="bg-slate-50 px-10 py-8 border-b border-slate-100 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-white font-black text-xl shadow-lg"
                  style={{ backgroundColor: SQCDP_CATEGORIES[kpi.cat].color }}
                >
                  {kpi.cat}
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{kpi.label}</h3>
              </div>
              <div className="flex gap-4 ml-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Factory size={10} /> Área: {areas.find(a => a.id === kpi.areaId)?.name}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Target size={10} /> Meta Semestral: {kpi.target} {kpi.unit}
                </span>
              </div>
            </div>
            <button
              onClick={() => setViewingKpiDetails(null)}
              className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm transition-all active:scale-90"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
            {/* Chart Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Gráfico de Tendencia Histórica</h4>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Real</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Meta</span>
                  </div>
                </div>
              </div>
              <div className="h-72 w-full bg-slate-50/50 rounded-3xl p-6 border border-slate-100 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700">
                              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{payload[0].payload.full}</p>
                              <p className="text-sm font-black mt-1">{payload[0].value} {kpi.unit}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={kpi.target} stroke="#f87171" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2563eb"
                      strokeWidth={4}
                      dot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                {/* ACR Alert: mostrar aquí si requiere_acr */}
                {kpi.requiere_acr && (
                  <div className="absolute right-8 top-24 bg-white rounded-md shadow-2xl p-3 border border-red-100 w-52">
                    <div className="text-xs font-black text-red-600 uppercase">⚠️ Generar ACR</div>
                    <div className="text-[12px] text-slate-600 mt-2">Este KPI ha mostrado 2 tendencias negativas consecutivas. Inicia Análisis de Causa Raíz.</div>
                    <div className="mt-3 flex justify-end">
                      <button className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-sm">Generar ACR</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Table Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Historial de Registros</h4>
                <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">Descargar CSV</button>
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Periodo</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Comentario / Causa Raíz</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actualizado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[...kpi.history].reverse().map(h => {
                      const ratio = kpi.dir === 1 ? h.value / kpi.target : kpi.target / h.value;
                      const st: Status = ratio >= 0.98 ? 'green' : (ratio >= 0.9 ? 'yellow' : 'red');
                      return (
                        <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <p className="text-[11px] font-black text-slate-800">{h.month} {h.year}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Semana {h.week}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-black text-slate-700">{h.value}</span>
                            <span className="text-[9px] font-bold text-slate-400 ml-1">{kpi.unit}</span>
                          </td>
                          <td className="px-6 py-5">
                            <StatusBadge status={st} />
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-[11px] text-slate-600 font-medium max-w-md line-clamp-2">{h.comment || '-'}</p>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(h.updatedAt).toLocaleDateString()}</p>
                          </td>
                        </tr>
                      );
                    })}
                    {kpi.history.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-300 font-black uppercase text-xs tracking-widest">No hay registros históricos</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  if (!user) {
    return <LoginScreen onLoginSuccess={(loginData) => setUser(loginData.user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* Header */}
      <header className="max-w-7xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">KPI Planta Polak</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-11">Pillar Management System</p>
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            {/* Filtros Temporales */}
            <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
                <Calendar size={16} className="text-slate-600" />
                <select
                  value={filters.year}
                  onChange={(e) => setFilters(f => ({ ...f, year: e.target.value }))}
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
              <div className="flex items-center gap-1 pl-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">W</span>
                <select
                  value={filters.week}
                  onChange={(e) => setFilters(f => ({ ...f, week: e.target.value }))}
                  className="bg-transparent text-[11px] font-black text-slate-700 outline-none cursor-pointer appearance-none uppercase"
                >
                  {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
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
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-green-500 shadow-sm group hover:shadow-md transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">KPIs en Blanco</p>
                      <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">
                          {data.filter(k => {
                            const { status } = getKpiStatus(k, filters.year, filters.month, filters.week);
                            return status === 'green';
                          }).length}
                        </h3>
                        <TrendingUp className="text-green-500 mb-1" size={24} />
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-amber-500 shadow-sm group hover:shadow-md transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">En Observación</p>
                      <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">
                          {data.filter(k => {
                            const { status } = getKpiStatus(k, filters.year, filters.month, filters.week);
                            return status === 'yellow';
                          }).length}
                        </h3>
                        <AlertTriangle className="text-amber-500 mb-1" size={24} />
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-red-500 shadow-sm group hover:shadow-md transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pérdidas Críticas</p>
                      <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">
                          {data.filter(k => {
                            const { status } = getKpiStatus(k, filters.year, filters.month, filters.week);
                            return status === 'red';
                          }).length}
                        </h3>
                        <TrendingDown className="text-red-500 mb-1" size={24} />
                      </div>
                    </div>
                    {/* --- Card Desempeño Total con Sparkline y Delta --- */}
                    <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-100 flex flex-col justify-between relative overflow-hidden">
                      <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-1">Desempeño Total</p>
                      {/* Simulación de datos de tendencia semanal */}
                      {(() => {
                        // Simular OEE de los últimos 7 días (en un caso real, esto vendría de un endpoint)
                        const today = new Date();
                        const trendData = Array.from({ length: 7 }).map((_, i) => {
                          const d = new Date(today);
                          d.setDate(today.getDate() - (6 - i));
                          // Simular OEE: usar el porcentaje de KPIs en verde ese día (o random si no hay histórico)
                          // Aquí solo para demo, usar el valor actual +/- una pequeña variación
                          const base = data.length > 0 ? Math.round((data.filter(k => {
                            const { status } = getKpiStatus(k, filters.year, filters.month, (parseInt(filters.week) - (6 - i)).toString().padStart(2, '0'));
                            return status === 'green';
                          }).length / data.length) * 100) : 0;
                          // Simulación: si no hay datos, variar aleatoriamente
                          return {
                            fecha: d.toISOString().slice(0, 10),
                            oee: base + (Math.random() * 4 - 2) // +/-2% aleatorio
                          };
                        });
                        const oeeActual = trendData[6]?.oee ?? 0;
                        const oeeAnterior = trendData[5]?.oee ?? 0;
                        const delta = oeeActual - oeeAnterior;
                        const meta = 85;
                        return (
                          <>
                            <div className="flex flex-col items-start mb-2">
                              <div className="flex items-baseline gap-2">
                                <div className="relative flex flex-col items-start">
                                  <h3 className="text-4xl font-black tracking-tighter leading-none" style={{ minWidth: '90px', width: 'fit-content', textAlign: 'left' }}>{Math.round(oeeActual)}%</h3>
                                  {/* Sparkline del mismo ancho que el número */}
                                  <div style={{ width: '90px', maxWidth: '100%' }} className="mt-1 h-6 flex items-center justify-start">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={trendData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                                        <ReferenceLine y={meta} stroke="#fbbf24" strokeDasharray="4 2" label={{ value: 'Meta', position: 'right', fill: '#fbbf24', fontSize: 10, fontWeight: 700 }} />
                                        <Line type="monotone" dataKey="oee" stroke="#fff" strokeWidth={2.2} dot={false} isAnimationActive={true} />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                                {/* Indicador Delta */}
                                <span className={
                                  "flex items-center text-xs font-bold ml-2 " +
                                  (delta > 0 ? 'text-green-300' : delta < 0 ? 'text-red-300' : 'text-blue-200')
                                }>
                                  {delta > 0 && <TrendingUp size={16} className="mr-1" />}
                                  {delta < 0 && <TrendingDown size={16} className="mr-1" />}
                                  {delta === 0 && <span className="mr-1">→</span>}
                                  {delta > 0 ? `+${delta.toFixed(1)}%` : delta < 0 ? `${delta.toFixed(1)}%` : '0.0%'}
                                </span>
                              </div>
                              <Zap size={24} className="text-yellow-300 ml-2" />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Global Performance Chart Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Desempeño de Pilares por Área</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Estado actual de cumplimiento de metas por pilar WCM</p>
                      </div>
                    </div>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={globalChartData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            width={140}
                            tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b', textAnchor: 'end' }}
                          />
                          <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700">
                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{payload[0].payload.name}</p>
                                    <p className="text-sm font-black mt-1">{payload[0].value}% OK</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={24}>
                            {globalChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.score >= 98 ? '#22c55e' : (entry.score >= 90 ? '#f59e0b' : '#ef4444')}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>


                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {areas.map((area) => (
                      <motion.div
                        key={area.id}
                        whileHover={{ y: -4 }}
                        onClick={() => setView(area.id)}
                        className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 cursor-pointer transition-all group relative overflow-hidden"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                            <IconWrapper name={area.icon} size={20} className="text-slate-700 group-hover:text-blue-600" />
                          </div>
                          <span className={cn(
                            "text-[11px] font-black px-2.5 py-1 rounded-lg",
                            stats[area.id] > 80 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                          )}>
                            {stats[area.id]}% OK
                          </span>
                        </div>
                        <h3 className="font-black text-slate-800 mb-3 uppercase tracking-tighter text-sm">{area.name}</h3>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase mb-1">
                            <span>Pilar {area.id.toUpperCase()}</span>
                            <span>Meta 100%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stats[area.id]}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={cn(
                                "h-full rounded-full",
                                stats[area.id] > 80 ? 'bg-green-500' : 'bg-amber-500'
                              )}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : view === 'master' ? (
                <AreasListManager
                  key="master"
                  areas={areas}
                  data={data}
                  role={role}
                  onAddKpi={(areaId) => setAddingKpiToArea(areaId)}
                  onEditKpi={(kpi) => setEditingKpi(kpi)}
                  onDeleteKpi={(id) => handleDeleteKpi(id)}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {(['S', 'Q', 'C', 'D', 'P'] as SqcdpCat[]).map(catLetter => {
                      const catKpis = data.filter(k => k.areaId === view && k.cat === catLetter);
                      const config = SQCDP_CATEGORIES[catLetter];
                      return (
                        <div key={catLetter} className="flex flex-col gap-4">
                          <div className="group relative">
                            <div className="absolute inset-0 bg-white shadow-sm border border-slate-200 rounded-2xl translate-y-1 translate-x-1" />
                            <div className="relative flex flex-col gap-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5">
                              <div className="flex items-center justify-between">
                                <div
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white font-black text-sm shadow-md"
                                  style={{ backgroundColor: config.color }}
                                >
                                  {catLetter}
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase">{catKpis.length} KPIs</span>
                              </div>
                              <div className="mt-2">
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">{config.label}</span>
                                <p className="text-[9px] text-slate-400 mt-0.5">{config.description}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {catKpis.length > 0 ? (
                              catKpis.map(k => {
                                const { value, comment } = getKpiStatus(k, filters.year, filters.month, filters.week);
                                return (
                                  <KpiCard
                                    key={k.id}
                                    kpi={k}
                                    currentValue={value}
                                    currentComment={comment}
                                    role={role}
                                    onEdit={(kpi) => setEditingKpi(kpi)}
                                    onViewDetails={(kpi) => setViewingKpiDetails(kpi)}
                                  />
                                );
                              })
                            ) : (
                              <div className="h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center grayscale opacity-45 p-4 transition-all hover:opacity-60">
                                <Info size={18} className="text-slate-500 mb-1" />
                                <span className="text-[9px] font-black text-slate-500 uppercase text-center">Sin indicadores</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
        {viewingKpiDetails && <KpiDetailsView kpi={viewingKpiDetails} />}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingKpi(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="bg-slate-50 px-8 py-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 flex items-center justify-center rounded text-white font-black text-[10px]"
                      style={{ backgroundColor: SQCDP_CATEGORIES[editingKpi.cat].color }}
                    >
                      {editingKpi.cat}
                    </div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Editar Indicador</h3>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{editingKpi.label}</p>
                </div>
                <button onClick={() => setEditingKpi(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveKpiValue} className="p-8 space-y-6">
                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Año</label>
                    <select name="year" defaultValue={filters.year} readOnly={role !== 'admin'} className="w-full bg-transparent text-[10px] font-black outline-none">
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Mes</label>
                    <select name="month" defaultValue={filters.month} readOnly={role !== 'admin'} className="w-full bg-transparent text-[10px] font-black outline-none">
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Semana</label>
                    <select name="week" defaultValue={filters.week} readOnly={role !== 'admin'} className="w-full bg-transparent text-[10px] font-black outline-none">
                      {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Valor Actual ({editingKpi.unit})</label>
                    <input
                      name="value"
                      type="number"
                      step="any"
                      defaultValue={getKpiStatus(editingKpi, filters.year, filters.month, filters.week).value}
                      autoFocus
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Meta {role === 'admin' ? '(Editable)' : '(Fija)'}</label>
                    <input
                      name="target"
                      type="number"
                      step="any"
                      defaultValue={editingKpi.target}
                      readOnly={role !== 'admin'}
                      className={cn(
                        "w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black outline-none transition-all",
                        role === 'admin' ? 'focus:ring-4 focus:ring-blue-100 focus:border-blue-500' : 'opacity-60 cursor-not-allowed'
                      )}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Comentario / Análisis de Causa</label>
                  <textarea
                    name="comment"
                    defaultValue={getKpiStatus(editingKpi, filters.year, filters.month, filters.week).comment}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none h-28 resize-none transition-all"
                    placeholder="Describe la desviación o acción correctiva..."
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Pilar (SQCDP)</label>
                    <select name="cat" defaultValue={editingKpi.cat} disabled={role !== 'admin'} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none">
                      <option value="S">Seguridad (S)</option>
                      <option value="Q">Calidad (Q)</option>
                      <option value="C">Costos (C)</option>
                      <option value="D">Entrega (D)</option>
                      <option value="P">Personas (P)</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98] uppercase text-[11px] tracking-widest"
                >
                  Confirmar Registro
                </button>
              </form>
            </motion.div>
          </div>
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
