/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
  Download,
  Edit3,
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
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
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

const IconWrapper = ({ name, size = 18, className }: { name: string, size?: number, className?: string }) => {
  const icons: Record<string, any> = {
    Shield, CheckCircle, Leaf, Factory, Settings, Package, Users, Zap, Target
  };
  const Icon = icons[name] || Info;
  return <Icon size={size} className={className} />;
};

// --- KPI Card Component ---

interface KpiCardProps {
  kpi: Kpi;
  currentValue: number;
  currentComment: string;
  role: UserRole;
  onEdit: (kpi: Kpi) => void;
  onViewDetails: (kpi: Kpi) => void;
  key?: React.Key;
}

const KpiCard = ({ kpi, currentValue, currentComment, role, onEdit, onViewDetails }: KpiCardProps) => {
  const calculateStatus = (k: Kpi, val: number): Status => {
    const ratio = k.dir === 1 ? val / k.target : k.target / val;
    if (ratio >= 0.98) return 'green';
    if (ratio >= 0.90) return 'yellow';
    return 'red';
  };

  const status = calculateStatus(kpi, currentValue);
  const accentColor = status === 'green' ? '#22c55e' : (status === 'yellow' ? '#f59e0b' : '#ef4444');

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all h-full"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: accentColor }}></div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="w-4/5">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{kpi.label}</h4>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => onViewDetails(kpi)}
              className="text-slate-300 hover:text-slate-600 transition-colors p-1"
            >
              <History size={12} />
            </button>
            {role !== 'viewer' && (
              <button 
                onClick={() => onEdit(kpi)} 
                className="text-slate-300 hover:text-blue-600 transition-colors p-1"
              >
                <Edit3 size={12} />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-black text-slate-800 tracking-tighter">{currentValue ?? '-'}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">{kpi.unit}</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 font-medium line-clamp-1 h-4">
          {currentComment || 'Sin registro'}
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
          <span className="text-[10px] text-slate-400 font-bold">Meta: {kpi.target}</span>
          <StatusBadge status={status} />
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App Component ---

export default function App() {
  const [areas, setAreas] = useState<Area[]>(Object.values(AREAS));
  const [data, setData] = useState<Kpi[]>(INITIAL_DATA);
  const [view, setView] = useState<string>('overview'); // 'overview' | 'master' | ID del área
  const [role, setRole] = useState<UserRole>('viewer');
  const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);
  const [viewingKpiDetails, setViewingKpiDetails] = useState<Kpi | null>(null);

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
        history
      };
    }));
    setEditingKpi(null);
  };

  const [isAddingArea, setIsAddingArea] = useState(false);
  const [addingKpiToArea, setAddingKpiToArea] = useState<string | null>(null);

  const handleAddArea = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    setAreas(prev => [...prev, { id, name, icon: 'Factory', color: 'slate' }]);
    setIsAddingArea(false);
  };

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
                   <Factory size={10}/> Área: {areas.find(a => a.id === kpi.areaId)?.name}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                   <Target size={10}/> Meta Semestral: {kpi.target} {kpi.unit}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setViewingKpiDetails(null)} 
              className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm transition-all active:scale-90"
            >
              <X size={24}/>
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
              <div className="h-72 w-full bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                <BarChart3 className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tablero de indicadores - Polaquimia</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-11">Pillar Management System</p>
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            {/* Selector de Rol */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setRole('viewer')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  role === 'viewer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                Visor
              </button>
              <button 
                onClick={() => setRole('operator')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  role === 'operator' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                Op
              </button>
              <button 
                onClick={() => setRole('admin')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  role === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                Admin
              </button>
            </div>

            {/* Filtros Temporales */}
            <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
                <Calendar size={14} className="text-slate-400" />
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
                <span className="text-[10px] font-black text-slate-400 uppercase">W</span>
                <select 
                  value={filters.week}
                  onChange={(e) => setFilters(f => ({ ...f, week: e.target.value }))}
                  className="bg-transparent text-[11px] font-black text-slate-700 outline-none cursor-pointer appearance-none uppercase"
                >
                  {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            <button className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95 ml-auto md:ml-0">
              <Download size={14} /> Exportar WCM
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Navegación por Áreas */}
        <div className="relative mb-8 group">
          <nav className="flex overflow-x-auto gap-2 no-scrollbar pb-2 mask-linear">
            <button 
              onClick={() => setView('overview')}
              className={cn(
                "flex-shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
                view === 'overview' 
                  ? 'bg-slate-800 text-white border-slate-800 shadow-md translate-y-[-2px]' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              )}
            >
              Panorama Global
            </button>
            {areas.map((area) => (
              <button 
                key={area.id}
                onClick={() => setView(area.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
                  view === area.id 
                    ? 'bg-slate-800 text-white border-slate-800 shadow-md translate-y-[-2px]' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                )}
              >
                <IconWrapper name={area.icon} size={14} />
                {area.name}
              </button>
            ))}
            {role === 'admin' && (
              <button 
                onClick={() => setView('master')}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
                  view === 'master' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md translate-y-[-2px]' 
                    : 'bg-white text-blue-500 border-blue-200 hover:border-blue-300'
                )}
              >
                <Database size={14} />
                Datos Maestros
              </button>
            )}
          </nav>
        </div>

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
                <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-100 flex flex-col justify-between">
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-1">Desempeño Total</p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-4xl font-black tracking-tighter">
                      {data.length > 0 ? Math.round((data.filter(k => {
                         const { status } = getKpiStatus(k, filters.year, filters.month, filters.week);
                         return status === 'green';
                      }).length / data.length) * 100) : 0}%
                    </h3>
                    <Zap size={24} className="text-yellow-300" />
                  </div>
                </div>
              </div>

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
                        <IconWrapper name={area.icon} size={18} className="text-slate-600 group-hover:text-blue-600" />
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
            <motion.div 
              key="master"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8 animate-in fade-in duration-500"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Panel de Datos Maestros</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administración de Estructura WCM</p>
                </div>
                <button 
                  onClick={() => setIsAddingArea(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all"
                >
                  <Plus size={16} /> Nueva Área
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {areas.map(area => (
                  <div key={area.id} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm overflow-hidden relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                         <div className="p-3 bg-slate-100 rounded-2xl">
                            <IconWrapper name={area.icon} size={24} className="text-slate-600" />
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">{area.name}</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">ID: {area.id}</p>
                         </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddingKpiToArea(area.id);
                        }}
                        className="relative z-50 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
                      >
                        <Plus size={14} className="inline mr-1" /> KPI
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {data.filter(k => k.areaId === area.id).map(kpi => (
                        <div key={kpi.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-blue-200 transition-all">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-white font-black text-xs"
                              style={{ backgroundColor: SQCDP_CATEGORIES[kpi.cat].color }}
                            >
                              {kpi.cat}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{kpi.label}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Meta: {kpi.target} {kpi.unit}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingKpi(kpi)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 size={14}/></button>
                            <button onClick={() => handleDeleteKpi(kpi.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
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
                    className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                      {currentArea && <IconWrapper name={currentArea.icon} size={28} className="text-blue-600" />}
                      Pilar {currentArea?.name}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Análisis Multidimensional SQCDP</p>
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
                          <div className="h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center grayscale opacity-40 p-4 transition-all hover:opacity-60">
                            <Info size={16} className="text-slate-400 mb-1" />
                            <span className="text-[9px] font-black text-slate-400 uppercase text-center">Sin indicadores</span>
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
      </main>

      <AnimatePresence>
        {viewingKpiDetails && <KpiDetailsView kpi={viewingKpiDetails} />}
      </AnimatePresence>

      {/* Modal Edición Admin */}
      <AnimatePresence>
        {isAddingArea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingArea(false)}
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
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Nueva Área / Pilar</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Definir nueva división WCM</p>
                </div>
                <button onClick={() => setIsAddingArea(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all"><X size={20}/></button>
              </div>
              <form onSubmit={handleAddArea} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Nombre del Área</label>
                  <input name="name" type="text" autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" required />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98] uppercase text-[11px] tracking-widest">
                  Crear Área
                </button>
              </form>
            </motion.div>
          </div>
        )}

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
                <button onClick={() => setAddingKpiToArea(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all"><X size={20}/></button>
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
                <button onClick={() => setEditingKpi(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all"><X size={20}/></button>
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
            <BarChart3 size={14}/>
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
