import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Info,
  Shield,
  CheckCircle,
  Leaf,
  Factory,
  Settings,
  Package,
  Users,
  Target
} from 'lucide-react';
import { motion } from 'motion/react';
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
import { cn } from '../lib/utils';
import { Area, Kpi, Status } from '../types';
import { kpiHistoricoService } from '../services/kpiHistoricoService';

interface PanoramaGlobalProps {
  areas: Area[];
  filters: { year: string; month: string; week: string };
  data: Kpi[];
  setView: (view: string) => void;
  getKpiStatus: (k: Kpi, year: string, month: string, week: string) => { value: number; comment: string; status: Status };
  stats: Record<string, number>;
  globalChartData: any[];
}

const IconWrapper = ({ name, size = 20, className }: { name: string; size?: number; className?: string }) => {
  const icons: Record<string, any> = {
    Shield, CheckCircle, Leaf, Factory, Settings, Package, Users, Zap, Target
  };
  const Icon = icons[name] || Info;
  return <Icon size={size} className={cn("text-slate-700", className)} />;
};

export const PanoramaGlobal: React.FC<PanoramaGlobalProps> = ({
  areas,
  filters,
  data,
  setView,
  getKpiStatus,
  stats,
  globalChartData
}) => {
  const [counts, setCounts] = useState({ verde: 0, amarillo: 0, rojo: 0 });
  const [desempenoGlobal, setDesempenoGlobal] = useState<{
    SemanaActual: number;
    SemanaAnterior: number;
    Historico: { Semana: number; Valor: number }[];
  } | null>(null);
  const [desempenoPilar, setDesempenoPilar] = useState<{
    AreaId: string;
    AreaDescripcion: string;
    KPIVerde: number;
    TotalKPI: number;
    KPIHistoricoAnio: number;
    KPIHistoricoSemana: number;
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [countsRes, desempenoRes, desempenoPilarRes] = await Promise.all([
          kpiHistoricoService.getCalificaciones(filters.year, filters.week),
          kpiHistoricoService.getDesempenoGlobal(filters.year, filters.week),
          kpiHistoricoService.getDesempenoXPilar(filters.year, filters.week)
        ]);

        if (isMounted) {
          let verde = 0;
          let amarillo = 0;
          let rojo = 0;
          if (Array.isArray(countsRes)) {
            countsRes.forEach((item: any) => {
              const calif = item.Calificacion?.toLowerCase();
              if (calif === 'verde') verde = item.Contador || 0;
              else if (calif === 'amarillo') amarillo = item.Contador || 0;
              else if (calif === 'rojo') rojo = item.Contador || 0;
            });
          }
          setCounts({ verde, amarillo, rojo });
          setDesempenoGlobal(desempenoRes);

          // Ordenar por porcentaje de cumplimiento descendente
          const sortedPilar = (desempenoPilarRes || []).slice().sort((a: any, b: any) => {
            const pctA = a.TotalKPI > 0 ? (a.KPIVerde / a.TotalKPI) : 0;
            const pctB = b.TotalKPI > 0 ? (b.KPIVerde / b.TotalKPI) : 0;
            if (pctB !== pctA) {
              return pctB - pctA;
            }
            return b.TotalKPI - a.TotalKPI;
          });
          setDesempenoPilar(sortedPilar);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        if (isMounted) {
          setError(err.message || 'Error al obtener datos del tablero');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [filters.year, filters.week]);

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPIs en Blanco (Verde) */}
        <div className="bg-white p-6 rounded-2xl border-l-4 border-green-500 shadow-sm group hover:shadow-md transition-all relative">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">KPIs en Blanco</p>
          <div className="flex items-end justify-between">
            <h3 className={cn("text-4xl font-black text-slate-800 tracking-tighter", loading && "animate-pulse text-slate-400")}>
              {counts.verde}
            </h3>
            <TrendingUp className="text-green-500 mb-1" size={24} />
          </div>
        </div>

        {/* En Observación (Amarillo) */}
        <div className="bg-white p-6 rounded-2xl border-l-4 border-amber-500 shadow-sm group hover:shadow-md transition-all relative">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">En Observación</p>
          <div className="flex items-end justify-between">
            <h3 className={cn("text-4xl font-black text-slate-800 tracking-tighter", loading && "animate-pulse text-slate-400")}>
              {counts.amarillo}
            </h3>
            <AlertTriangle className="text-amber-500 mb-1" size={24} />
          </div>
        </div>

        {/* Pérdidas Críticas (Rojo) */}
        <div className="bg-white p-6 rounded-2xl border-l-4 border-red-500 shadow-sm group hover:shadow-md transition-all relative">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pérdidas Críticas</p>
          <div className="flex items-end justify-between">
            <h3 className={cn("text-4xl font-black text-slate-800 tracking-tighter", loading && "animate-pulse text-slate-400")}>
              {counts.rojo}
            </h3>
            <TrendingDown className="text-red-500 mb-1" size={24} />
          </div>
        </div>

        {/* --- Card Desempeño Total con Sparkline y Delta --- */}
        <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-100 flex flex-col justify-between relative overflow-hidden">
          <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-1">Desempeño Total</p>
          {(() => {
            if (loading && !desempenoGlobal) {
              return (
                <div className="flex items-center justify-center h-24">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              );
            }

            const valActual = desempenoGlobal?.SemanaActual ?? 0;
            const valAnterior = desempenoGlobal?.SemanaAnterior ?? 0;
            const trendData = desempenoGlobal?.Historico ?? [];

            return (
              <>
                <div className="flex flex-col items-start mb-2">
                  <div className="flex items-baseline gap-2">
                    <div className="relative flex flex-col items-start">
                      <h3 className="text-4xl font-black tracking-tighter leading-none" style={{ minWidth: '90px', width: 'fit-content', textAlign: 'left' }}>
                        {valActual}%
                      </h3>
                      <div style={{ width: '90px', maxWidth: '100%' }} className="mt-1 h-6 flex items-center justify-start">
                        {trendData.length > 0 && (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                              <Line type="monotone" dataKey="Valor" stroke="#fff" strokeWidth={2.2} dot={false} isAnimationActive={true} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      "flex items-center text-xs font-bold ml-2",
                      valAnterior >= 0 ? "text-green-300" : "text-red-300"
                    )}>
                      {valAnterior >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                      {valAnterior >= 0 ? `+${valAnterior}%` : `${valAnterior}%`}
                    </span>
                  </div>
                  <Zap size={24} className="text-yellow-300 ml-2" />
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>Error cargando contadores de la API: {error}</span>
        </div>
      )}

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
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={desempenoPilar}
              layout="vertical"
              barGap="-100%"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 'dataMax + 1']} hide />
              <YAxis
                dataKey="AreaDescripcion"
                type="category"
                axisLine={false}
                tickLine={false}
                width={150}
                tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b', textAnchor: 'end' }}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataEntry = payload[0].payload;
                    const pct = dataEntry.TotalKPI > 0 ? Math.round((dataEntry.KPIVerde / dataEntry.TotalKPI) * 100) : 0;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{dataEntry.AreaDescripcion}</p>
                        <p className="text-sm font-black mt-1">{dataEntry.KPIVerde} de {dataEntry.TotalKPI} KPIs en Cumplidos ({pct}%)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* TotalKPI (Fondo) */}
              <Bar dataKey="TotalKPI" fill="#e2e8f0" radius={[0, 8, 8, 0]} barSize={24} />
              {/* KPIVerde (Frente) */}
              <Bar dataKey="KPIVerde" radius={[0, 8, 8, 0]} barSize={14}>
                {desempenoPilar.map((entry, index) => {
                  const pct = entry.TotalKPI > 0 ? (entry.KPIVerde / entry.TotalKPI) * 100 : 0;
                  let color = '#ef4444'; // Rojo por defecto
                  if (entry.TotalKPI === 0) {
                    color = '#cbd5e1'; // Gris si no hay KPIs
                  } else if (pct >= 100) {
                    color = '#22c55e'; // Verde si está al 100%
                  } else if (pct >= 50) {
                    color = '#f59e0b'; // Amarillo/Ambar
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
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
  );
};
