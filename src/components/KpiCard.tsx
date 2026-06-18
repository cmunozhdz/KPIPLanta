import React from 'react';
import { motion } from 'motion/react';
import { History, Edit3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Kpi, UserRole, Status, KpiHistoricoSemanal } from '../types';
import { SQCDP_CATEGORIES } from '../constants/data';

interface KpiCardProps {
  kpi: Kpi;
  currentValue: number;
  currentComment: string;
  role: UserRole;
  historicoData?: KpiHistoricoSemanal;
  onEdit: (kpi: Kpi, historicoData?: KpiHistoricoSemanal) => void;
  onViewDetails: (kpi: Kpi) => void;
  onToggleVisibility?: (kpi: Kpi) => void;
}

export const StatusBadge = ({ status }: { status: Status }) => {
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

export const KpiCard: React.FC<KpiCardProps> = ({
  kpi,
  currentValue,
  currentComment,
  role,
  historicoData,
  onEdit,
  onViewDetails
}) => {
  // Use historicoData values when available, fallback to props
  const displayValue = historicoData
    ? parseFloat(historicoData.Valor)
    : currentValue;
  const displayComment = historicoData
    ? (historicoData.Comentarios || 'Sin registro')
    : (currentComment || 'Sin registro');

  const calculateStatus = (k: Kpi, val: number): Status => {
    if (val === 0 || isNaN(val)) return 'red';
    const ratio = k.dir === 1 ? val / k.target : k.target / val;
    if (ratio >= 0.98) return 'green';
    if (ratio >= 0.90) return 'yellow';
    return 'red';
  };

  const status = calculateStatus(kpi, displayValue);
  const categoryColor = SQCDP_CATEGORIES[kpi.cat]?.color || '#60a5fa';

  // Determine display meta from API or local
  const displayMeta = historicoData
    ? parseFloat(historicoData.MetaActual) || kpi.target
    : kpi.target;

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
                <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] leading-snug">{kpi.label}</h4>
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
                onClick={() => onEdit(kpi, historicoData)}
                className="text-slate-500 hover:text-blue-600 transition-colors p-1"
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3">
          {historicoData ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 tracking-tight">{displayValue}</span>
                <span className="text-xs uppercase font-black text-slate-400 tracking-[0.35em]">{kpi.unit}</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 font-bold">{displayComment}</p>
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider">⚠️ Conexión en Fallback</span>
              <p className="text-[10px] text-amber-600 font-semibold leading-normal">
                No se han cargado datos en línea del servidor para esta semana. Mostrando valor del catálogo local.
              </p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-lg font-black text-slate-700">{displayValue}</span>
                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">{kpi.unit}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Meta: {displayMeta}</span>
          <StatusBadge status={status} />
        </div>
      </div>
    </motion.div>
  );
};
