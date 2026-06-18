import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Factory, Target, Loader2, AlertTriangle, Download } from 'lucide-react';
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
import { Area, Kpi, KpiHistoricoSemanal, Status } from '../types';
import { SQCDP_CATEGORIES } from '../constants/data';
import { kpiHistoricoService } from '../services/kpiHistoricoService';

interface KPIDetailsModalProps {
  kpi: Kpi;
  ano: number;
  areas: Area[];
  onClose: () => void;
}

const StatusBadge = ({ status }: { status: Status }) => {
  const styles = {
    green: "bg-green-100 text-green-700 border-green-200",
    yellow: "bg-amber-100 text-amber-700 border-amber-200",
    red: "bg-red-100 text-red-700 border-red-200"
  };
  const text = { green: 'En Meta', yellow: 'Alerta', red: 'Crítico' };
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs bg-opacity-100 inline-block text-center border-solid">
      <span className={`px-2 py-0.5 rounded-full border ${styles[status]}`}>
        {text[status]}
      </span>
    </span>
  );
};

export const KPIDetailsModal: React.FC<KPIDetailsModalProps> = ({
  kpi,
  ano,
  areas,
  onClose
}) => {
  const [historyList, setHistoryList] = useState<KpiHistoricoSemanal[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await kpiHistoricoService.getKpiHistoricoRango(Number(kpi.id), ano);
        // Sort history by Registry date or Ano/Mes/Semana ascending for the chart
        const sorted = [...response.AreaKPIHistoricoDatas].sort((a, b) => {
          return new Date(a.Registro).getTime() - new Date(b.Registro).getTime();
        });
        setHistoryList(sorted);
        setCount(response.Count);
      } catch (err: any) {
        console.error('Error fetching KPI history:', err);
        setError(err.message || 'Error al obtener la información histórica de la API.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [kpi.id, ano]);

  const requiresAcr = useMemo(() => {
    if (historyList.length < 3) return false;
    const last3 = historyList.slice(-3);
    const v1 = parseFloat(last3[0].Valor) || 0;
    const v2 = parseFloat(last3[1].Valor) || 0;
    const v3 = parseFloat(last3[2].Valor) || 0;
    const t2 = parseFloat(last3[1].MetaActual) || kpi.target;
    const t3 = parseFloat(last3[2].MetaActual) || kpi.target;

    const delta1 = v2 - v1;
    const delta2 = v3 - v2;

    const neg1 = kpi.dir === 1 ? delta1 < 0 : delta1 > 0;
    const neg2 = kpi.dir === 1 ? delta2 < 0 : delta2 > 0;

    const ratio2 = kpi.dir === 1 ? v2 / t2 : t2 / v2;
    const ratio3 = kpi.dir === 1 ? v3 / t3 : t3 / v3;
    const belowThreshold = ratio2 < 0.98 && ratio3 < 0.98;

    return neg1 && neg2 && belowThreshold;
  }, [historyList, kpi.dir, kpi.target]);

  const chartData = useMemo(() => {
    return historyList.map(h => ({
      name: `W${h.Semana}`,
      value: parseFloat(h.Valor) || 0,
      target: parseFloat(h.MetaAsignada) || parseFloat(h.MetaActual) || kpi.target,
      full: `W${h.Semana} / ${h.Ano}`
    }));
  }, [historyList, kpi.target]);

  const handleDownloadCSV = () => {
    const headers = ['Periodo', 'Valor', 'Status', 'Comentario / Causa Raiz', 'Actualizado'];
    const rows = historyList.map(h => {
      const val = parseFloat(h.Valor) || 0;
      const target = parseFloat(h.MetaAsignada) || parseFloat(h.MetaActual) || kpi.target;
      const ratio = kpi.dir === 1 ? val / target : target / val;
      let stText = 'Crítico';
      if (ratio >= 0.98) stText = 'En Meta';
      else if (ratio >= 0.90) stText = 'Alerta';

      return [
        `Semana ${h.Semana}`,
        h.Valor,
        stText,
        h.Comentarios || '',
        h.Registro
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `kpi_${kpi.id}_historico_${ano}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const areaName = areas.find(a => a.id === kpi.areaId)?.name || kpi.areaId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
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
                style={{ backgroundColor: SQCDP_CATEGORIES[kpi.cat]?.color || '#60a5fa' }}
              >
                {kpi.cat}
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{kpi.label}</h3>
            </div>
            <div className="flex gap-4 ml-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Factory size={10} /> Área: {areaName}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Target size={10} /> Meta Anual: {kpi.target} {kpi.unit}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando Historial del Servidor...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
              <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
              <h4 className="text-lg font-black text-slate-800 tracking-tight mb-2">Error al Cargar Datos</h4>
              <p className="text-slate-600 text-sm">{error}</p>
            </div>
          ) : (
            <>
              {/* Warnings and Alerts */}
              {count > 100 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h5 className="text-xs font-black text-amber-800 uppercase tracking-wider">Límite de registros superado</h5>
                    <p className="text-xs text-amber-700 font-medium mt-1">
                      El servidor reporta {count} registros históricos para este KPI, pero el panel está limitado a mostrar los últimos 100 registros.
                    </p>
                  </div>
                </div>
              )}

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
                            const realVal = payload.find(p => p.dataKey === 'value')?.value;
                            const targetVal = payload.find(p => p.dataKey === 'target')?.value;
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 space-y-1">
                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{payload[0].payload.full}</p>
                                <p className="text-xs font-bold"><span className="text-blue-400">Real:</span> {realVal} {kpi.unit}</p>
                                <p className="text-xs font-bold"><span className="text-red-400">Meta:</span> {targetVal} {kpi.unit}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#f87171"
                        strokeWidth={3}
                        strokeDasharray="4 4"
                        dot={{ r: 4, fill: '#f87171', strokeWidth: 1, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
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

                  {requiresAcr && (
                    <div className="absolute right-8 top-12 bg-white rounded-2xl shadow-2xl p-4 border border-red-100 w-60 z-10">
                      <div className="text-xs font-black text-red-600 uppercase flex items-center gap-1.5">
                        <AlertTriangle size={14} /> Generar ACR
                      </div>
                      <div className="text-[11px] text-slate-600 mt-2 font-medium leading-relaxed">
                        Este KPI presenta 2 tendencias negativas consecutivas por debajo del 98% del cumplimiento. Es requerido iniciar un Análisis de Causa Raíz.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Table Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Historial de Registros</h4>
                  <button
                    onClick={handleDownloadCSV}
                    className="text-[10px] font-black text-blue-600 uppercase hover:underline flex items-center gap-1.5"
                  >
                    <Download size={12} /> Descargar CSV
                  </button>
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
                      {[...historyList].reverse().map(h => {
                        const val = parseFloat(h.Valor) || 0;
                        const target = parseFloat(h.MetaActual) || kpi.target;
                        const ratio = kpi.dir === 1 ? val / target : target / val;
                        const st: Status = ratio >= 0.98 ? 'green' : (ratio >= 0.9 ? 'yellow' : 'red');
                        return (
                          <tr key={h.Historico} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <p className="text-[11px] font-black text-slate-800">Semana {h.Semana}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Año {h.Ano} - Mes {h.Mes}</p>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-black text-slate-700">{h.Valor}</span>
                              <span className="text-[9px] font-bold text-slate-400 ml-1">{kpi.unit}</span>
                            </td>
                            <td className="px-6 py-5">
                              <StatusBadge status={st} />
                            </td>
                            <td className="px-6 py-5">
                              <p className="text-[11px] text-slate-600 font-medium max-w-md line-clamp-2">{h.Comentarios || '-'}</p>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">
                                {new Date(h.Registro).toLocaleString('es-MX', {
                                  dateStyle: 'short',
                                  timeStyle: 'short'
                                })}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                      {historyList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-300 font-black uppercase text-xs tracking-widest">No hay registros históricos</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
