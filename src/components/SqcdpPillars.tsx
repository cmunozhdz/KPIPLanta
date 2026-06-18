import React from 'react';
import { Info } from 'lucide-react';
import { Kpi, UserRole, SqcdpCat, Status, KpiHistoricoSemanal } from '../types';
import { SQCDP_CATEGORIES } from '../constants/data';
import { KpiCard } from './KpiCard';

interface SqcdpPillarsProps {
  data: Kpi[];
  view: string;
  filters: {
    year: string;
    month: string;
    week: string;
  };
  role: UserRole;
  historicoMap: Record<number, KpiHistoricoSemanal>;
  onEdit: (kpi: Kpi, historicoData?: KpiHistoricoSemanal) => void;
  onViewDetails: (kpi: Kpi) => void;
}

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

export const SqcdpPillars: React.FC<SqcdpPillarsProps> = ({
  data,
  view,
  filters,
  role,
  historicoMap,
  onEdit,
  onViewDetails
}) => {
  const categories: SqcdpCat[] = ['S', 'Q', 'C', 'D', 'P'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {categories.map(catLetter => {
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
                  <span className="text-[9px] font-black text-slate-400 uppercase">
                    {catKpis.length} {catKpis.length === 1 ? 'KPI' : "KPI's"}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">
                    {config.label}
                  </span>
                  <p className="text-[9px] text-slate-400 mt-0.5">{config.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {catKpis.length > 0 ? (
                catKpis.map(k => {
                  const { value, comment } = getKpiStatus(k, filters.year, filters.month, filters.week);
                  const historicoData = historicoMap[parseInt(k.id, 10)] || undefined;
                  return (
                    <KpiCard
                      key={k.id}
                      kpi={k}
                      currentValue={value}
                      currentComment={comment}
                      role={role}
                      historicoData={historicoData}
                      onEdit={onEdit}
                      onViewDetails={onViewDetails}
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
  );
};
