import React from 'react';
import { motion } from 'motion/react';
import { History, Edit3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Kpi, UserRole, Status } from '../types';
import { SQCDP_CATEGORIES } from '../constants/data';

interface KpiCardProps {
  kpi: Kpi;
  currentValue: number;
  currentComment: string;
  role: UserRole;
  onEdit: (kpi: Kpi) => void;
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
  onEdit,
  onViewDetails
}) => {
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
