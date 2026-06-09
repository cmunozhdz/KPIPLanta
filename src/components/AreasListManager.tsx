import React, { useState } from 'react';
import { Area, Kpi, SqcdpCat } from '../types';
import { SQCDP_CATEGORIES } from '../constants/data';
import { Edit3, Trash2, Plus, Factory, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaManager } from './AreaManager';
import { cn } from '../lib/utils';

interface AreasListManagerProps {
  areas: Area[];
  data: Kpi[];
  role: string;
  onAddKpi: (areaId: string) => void;
  onEditKpi: (kpi: Kpi) => void;
  onDeleteKpi: (id: string) => void;
  onAreasUpdated: () => void;
}

export const AreasListManager: React.FC<AreasListManagerProps> = ({
  areas,
  data,
  role,
  onAddKpi,
  onEditKpi,
  onDeleteKpi,
  onAreasUpdated
}) => {
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [isCreatingArea, setIsCreatingArea] = useState(false);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);

  const toggleArea = (id: string) => {
    setExpandedAreaId(prev => prev === id ? null : id);
  };

  // Derive processed data
  const processedData = data.map(k => ({ ...k }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Panel de Datos Maestros</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administración de Estructura WCM</p>
        </div>
        {role === 'admin' && (
          <button
            onClick={() => setIsCreatingArea(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all"
          >
            <Plus size={18} /> Nueva Área
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {areas.map(area => (
          <div key={area.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative transition-all">
            <div 
              className="flex justify-between items-start p-8 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleArea(area.id)}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-100 rounded-2xl flex items-center justify-center w-12 h-12">
                  <i className={cn(area.icon || "fas fa-industry", "text-slate-700 text-2xl")}></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">{area.name}</h3>
                    {role === 'admin' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAreaId(area.id);
                        }}
                        className="relative z-10 text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                        title="Editar Área"
                      >
                        <Edit3 size={18} />
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">ID: {area.id}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddKpi(area.id);
                  }}
                  className="relative z-10 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
                >
                  <Plus size={16} className="inline mr-1" /> KPI
                </button>
                <div className="text-slate-400 ml-2">
                  {expandedAreaId === area.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </div>

            {expandedAreaId === area.id && (
              <div className="px-8 pb-8 border-t border-slate-100 pt-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {processedData.filter(k => k.areaId === area.id).map(kpi => (
                    <div key={kpi.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl group hover:border-blue-300 shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-white font-black text-xs shadow-sm"
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
                        <button onClick={(e) => { e.stopPropagation(); onEditKpi(kpi); }} className="p-2 text-slate-500 hover:text-blue-600 transition-colors"><Edit3 size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteKpi(kpi.id); }} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                  {processedData.filter(k => k.areaId === area.id).length === 0 && (
                    <div className="col-span-full py-8 text-center text-slate-400 text-[10px] uppercase font-black tracking-widest border-2 border-dashed border-slate-200 rounded-2xl">
                      No hay KPIs asignados a esta área
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {editingAreaId && (
        <AreaManager 
          areaId={editingAreaId} 
          mode="UPD" 
          onClose={() => setEditingAreaId(null)} 
          onSaved={() => {
            setEditingAreaId(null);
            onAreasUpdated();
          }} 
        />
      )}

      {isCreatingArea && (
        <AreaManager 
          mode="INS" 
          onClose={() => setIsCreatingArea(false)} 
          onSaved={() => {
            setIsCreatingArea(false);
            onAreasUpdated();
          }} 
        />
      )}
    </div>
  );
};
