import React, { useState, useEffect } from 'react';
import { Area, Kpi } from '../types';
import { SQCDP_CATEGORIES } from '../constants/data';
import { Edit3, Trash2, Plus, Factory, ChevronDown, ChevronUp, AlertTriangle, X, Loader2 } from 'lucide-react';
import { AreaManager } from './AreaManager';
import { KPIManager } from './KPIManager';
import { CatalogosKPIService } from '../services/CatalogosKPI';
import { cn } from '../lib/utils';

interface AreasListManagerProps {
  areas: Area[];
  role: string;
  onAreasUpdated: () => void;
}

export const AreasListManager: React.FC<AreasListManagerProps> = ({
  areas,
  role,
  onAreasUpdated
}) => {
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [isCreatingArea, setIsCreatingArea] = useState(false);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);
  
  // KPIs locales cargados dinámicamente por área expandida
  const [areaKpis, setAreaKpis] = useState<Record<string, any[]>>({});
  const [loadingKpis, setLoadingKpis] = useState<Record<string, boolean>>({});

  // Manejo de KPIManager modal
  const [kpiManagerConfig, setKpiManagerConfig] = useState<{
    areaId: string;
    kpiId?: number | string;
    mode: 'INS' | 'UPD';
  } | null>(null);

  // Estado del modal de confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState<{
    areaId: string;
    kpi: any;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchKPIsForArea = async (areaId: string) => {
    setLoadingKpis(prev => ({ ...prev, [areaId]: true }));
    try {
      const kpis = await CatalogosKPIService.getAreaKPIs(areaId);
      setAreaKpis(prev => ({ ...prev, [areaId]: kpis }));
    } catch (err) {
      console.error(`Error cargando KPIs para el área ${areaId}`, err);
    } finally {
      setLoadingKpis(prev => ({ ...prev, [areaId]: false }));
    }
  };

  const toggleArea = (id: string) => {
    setExpandedAreaId(prev => {
      const next = prev === id ? null : id;
      if (next) {
        fetchKPIsForArea(next);
      }
      return next;
    });
  };

  const handleDeleteKpi = (areaId: string, kpi: any) => {
    setDeleteError(null);
    setDeleteConfirm({ areaId, kpi });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { areaId, kpi } = deleteConfirm;
    setDeleting(true);
    setDeleteError(null);
    try {
      await CatalogosKPIService.deleteKPI(kpi.KPI);
      fetchKPIsForArea(areaId);
      setDeleteConfirm(null);
    } catch (err: any) {
      setDeleteError(err?.message || 'Ocurrió un error inesperado al eliminar el KPI.');
    } finally {
      setDeleting(false);
    }
  };

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
                {role !== 'viewer' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setKpiManagerConfig({ areaId: area.id, mode: 'INS' });
                    }}
                    className="relative z-10 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    <Plus size={16} className="inline mr-1" /> KPI
                  </button>
                )}
                <div className="text-slate-400 ml-2">
                  {expandedAreaId === area.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </div>

            {expandedAreaId === area.id && (
              <div className="px-8 pb-8 border-t border-slate-100 pt-6 bg-slate-50/50">
                {loadingKpis[area.id] ? (
                  <div className="py-8 text-center text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    Cargando KPIs...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {(areaKpis[area.id] || [])
                      .map(kpi => (
                        <div key={kpi.KPI} className={cn(
                          "flex items-center justify-between p-4 rounded-2xl group hover:border-blue-300 shadow-sm transition-all border",
                          kpi.KPIActivo === false 
                            ? "bg-slate-50/70 border-dashed border-slate-300 opacity-70" 
                            : "bg-white border-slate-200"
                        )}>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-white font-black text-xs shadow-sm text-center"
                              style={{ backgroundColor: SQCDP_CATEGORIES[kpi.Categoria as keyof typeof SQCDP_CATEGORIES]?.color || '#64748b' }}
                            >
                              {kpi.Categoria}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{kpi.Descripcion}</p>
                                {kpi.KPIActivo === false && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-500 text-[8px] font-black uppercase tracking-wider">
                                    Inactivo
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">
                                Meta: {kpi.MetaActual} {kpi.Unidaddemedida}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(`[AreasListManager] Editing KPI:`, kpi);
                                console.log(`[AreasListManager] KPI.KPI:`, kpi.KPI);
                                console.log(`[AreasListManager] KPI properties:`, Object.keys(kpi));
                                setKpiManagerConfig({ areaId: area.id, kpiId: kpi.KPI, mode: 'UPD' });
                              }}
                              className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteKpi(area.id, kpi);
                              }}
                              className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    {(areaKpis[area.id] || []).length === 0 && (
                      <div className="col-span-full py-8 text-center text-slate-400 text-[10px] uppercase font-black tracking-widest border-2 border-dashed border-slate-200 rounded-2xl">
                        No hay KPIs asignados a esta área
                      </div>
                    )}
                  </div>
                )}
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

      {kpiManagerConfig && (
        <KPIManager
          areaId={kpiManagerConfig.areaId}
          kpiId={kpiManagerConfig.kpiId}
          mode={kpiManagerConfig.mode}
          onClose={() => setKpiManagerConfig(null)}
          onSaved={() => {
            fetchKPIsForArea(kpiManagerConfig.areaId);
            setKpiManagerConfig(null);
          }}
        />
      )}

      {/* Modal Premium de Confirmación de Eliminación */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => { if (!deleting) { setDeleteConfirm(null); setDeleteError(null); } }}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera roja */}
            <div className="bg-gradient-to-br from-red-500 to-rose-600 px-8 pt-8 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                  <AlertTriangle size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Eliminar KPI</h3>
                  <p className="text-red-100 text-[10px] font-bold uppercase tracking-widest">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="px-8 py-6">
              <p className="text-slate-600 text-sm mb-4">
                ¿Estás seguro de que deseas eliminar permanentemente el siguiente indicador?
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-white font-black text-xs shadow-sm flex-shrink-0"
                  style={{ backgroundColor: SQCDP_CATEGORIES[deleteConfirm.kpi.Categoria as keyof typeof SQCDP_CATEGORIES]?.color || '#64748b' }}
                >
                  {deleteConfirm.kpi.Categoria}
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{deleteConfirm.kpi.Descripcion}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Meta: {deleteConfirm.kpi.MetaActual} {deleteConfirm.kpi.Unidaddemedida} · ID: {deleteConfirm.kpi.KPI}</p>
                </div>
              </div>

              {/* Mensaje de error */}
              {deleteError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-2">
                  <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-[10px] font-bold">{deleteError}</p>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="px-8 pb-8 flex gap-3">
              <button
                onClick={() => { setDeleteConfirm(null); setDeleteError(null); }}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:from-red-600 hover:to-rose-700 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <><Loader2 size={14} className="animate-spin" /> Eliminando...</>
                ) : (
                  <><Trash2 size={14} /> Eliminar KPI</>
                )}
              </button>
            </div>

            {/* Botón de cierre */}
            {!deleting && (
              <button
                onClick={() => { setDeleteConfirm(null); setDeleteError(null); }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
