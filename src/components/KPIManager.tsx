import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Save, Search, AlertCircle } from 'lucide-react';
import { CatalogosKPIService, UnidadMedida, CategoriaSQCDP } from '../services/CatalogosKPI';

interface KPIManagerProps {
  areaId: string;
  kpiId?: number | string; // If provided, we are in update mode
  mode: 'INS' | 'UPD';
  onClose: () => void;
  onSaved: () => void;
}

export const KPIManager: React.FC<KPIManagerProps> = ({ areaId, kpiId, mode, onClose, onSaved }) => {
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [meta, setMeta] = useState<string>('0');
  const [direccion, setDireccion] = useState<number>(1);
  const [unidaddemedida, setUnidaddemedida] = useState('');
  const [unidadMedidaDesc, setUnidadMedidaDesc] = useState('');
  const [activo, setActivo] = useState(true);

  // Catálogos cargados dinámicamente
  const [categorias, setCategorias] = useState<CategoriaSQCDP[]>([]);
  const [direcciones] = useState(() => CatalogosKPIService.getDireccionesLista());
  
  // Para el autocompletado/desplegable de Unidad de Medida
  const [unidadSearch, setUnidadSearch] = useState('');
  const [unidadesList, setUnidadesList] = useState<UnidadMedida[]>([]);
  const [showUnidadesDropdown, setShowUnidadesDropdown] = useState(false);
  const [isValidUnidad, setIsValidUnidad] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setInitError(null);
      setError(null);
      try {
        console.log(`[KPIManager] Initializing with mode=${mode}, areaId=${areaId}, kpiId=${kpiId}`);
        console.log(`[KPIManager] kpiId type: ${typeof kpiId}, value: ${JSON.stringify(kpiId)}`);
        
        const cats = await CatalogosKPIService.getCategoriasLista();
        setCategorias(cats);
        if (cats.length > 0) {
          setCategoria(cats[0].CategoriaSQCDPID);
        }

        if (mode === 'UPD' && kpiId !== undefined && kpiId !== null && kpiId !== '') {
          console.log(`[KPIManager] Loading KPI data from API for ID: ${kpiId}`);
          const kpi = await CatalogosKPIService.getKPIById(kpiId);
          console.log(`[KPIManager] Raw KPI received:`, kpi);
          console.log(`[KPIManager] KPI properties:`, Object.keys(kpi || {}));
          
          if (kpi && Object.keys(kpi).length > 0) {
            console.log(`[KPIManager] KPI data loaded successfully, populating form...`);
            
            const descripcion = kpi.Descripcion || '';
            const categoria = kpi.Categoria || kpi.categoria || '';
            const meta = kpi.MetaActual || '0';
            const direccion = kpi.Direccion || kpi.direccion || 1;
            const unidad = kpi.Unidaddemedida || kpi.unidaddemedida || '';
            const unidadDesc = kpi.UnidadMedidaDescripcion || unidad;
            const activo = kpi.KPIActivo ?? kpi.Activo ?? kpi.activo ?? true;
            
            console.log(`[KPIManager] Extracted values:`, { descripcion, categoria, meta, direccion, unidad, unidadDesc, activo });
            
            setDescripcion(descripcion);
            setCategoria(categoria);
            setMeta(String(meta));
            setDireccion(Number(direccion));
            setUnidaddemedida(unidad);
            setUnidadMedidaDesc(unidadDesc);
            setUnidadSearch(unidadDesc || unidad);
            setActivo(activo);
            setIsValidUnidad(!!unidad);
            
            console.log(`[KPIManager] Form population complete`);
          } else {
            throw new Error('No se encontraron datos para el KPI especificado.');
          }
        } else if (mode === 'INS') {
          console.log(`[KPIManager] Creating new KPI for area: ${areaId}`);
        }
      } catch (err: any) {
        console.error(`[KPIManager] Initialization error:`, err);
        setInitError(err.message || 'Error al cargar los datos iniciales.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [mode, kpiId, retryCount]);

  // Buscar unidades de medida cuando cambie el texto de búsqueda
  useEffect(() => {
    if (unidadSearch.trim() === '') {
      setUnidadesList([]);
      setShowUnidadesDropdown(false);
      return;
    }

    // No gatillar búsqueda si coincide exactamente con la seleccionada
    if (unidadSearch === unidadMedidaDesc) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await CatalogosKPIService.getUnidadMedidaLista(unidadSearch);
        setUnidadesList(res);
        setShowUnDropdown(res.length > 0);
      } catch (err) {
        console.error('Error al buscar unidades de medida', err);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [unidadSearch, unidadMedidaDesc]);

  const setShowUnDropdown = (show: boolean) => {
    setShowUnidadesDropdown(show);
  };

  const handleSelectUnidad = (unidad: UnidadMedida) => {
    setUnidaddemedida(unidad.UnidadMedidaId);
    setUnidadMedidaDesc(unidad.UnidadMedidaDescripcion);
    setUnidadSearch(unidad.UnidadMedidaDescripcion);
    setIsValidUnidad(true);
    setShowUnidadesDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (meta === '') {
      setError('La Meta no puede estar vacía.');
      return;
    }
    if (!isValidUnidad) {
      setError('Debe seleccionar una Unidad de Medida válida de la lista.');
      return;
    }
    
    setSaving(true);
    setError(null);

    const payload = {
      KPI: mode === 'UPD' ? Number(kpiId) : undefined,
      Descripcion: descripcion,
      Categoria: categoria,
      MetaActual: Number(meta),
      Direccion: Number(direccion),
      Unidaddemedida: unidaddemedida,
      AreaId: areaId,
      KPIActivo: activo
    };

    try {
      if (mode === 'INS') {
        await CatalogosKPIService.insertKPI(payload);
      } else if (mode === 'UPD' && kpiId) {
        await CatalogosKPIService.updateKPI(kpiId, payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Error al guardar los datos del KPI.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="bg-slate-50 px-8 py-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {mode === 'UPD' ? 'Editar KPI' : 'Nuevo KPI'}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Área / Pilar: {areaId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              {mode === 'UPD' ? 'Cargando datos del KPI...' : 'Cargando catálogos...'}
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
              {mode === 'UPD' ? `GET /area_kpis/${kpiId}` : 'Por favor espere...'}
            </p>
          </div>
        ) : initError ? (
          <div className="p-8 flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-tr from-red-500 to-rose-600 p-5 rounded-3xl text-white shadow-lg shadow-red-500/30">
                <AlertCircle size={32} />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-800 tracking-tight">
                No se pudo cargar la información
              </h4>
              <p className="text-xs font-bold text-slate-400 max-w-xs leading-relaxed">
                {initError}
              </p>
            </div>
            <div className="flex gap-3 w-full pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-4 rounded-2xl transition-all uppercase text-[10px] tracking-widest"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => setRetryCount(prev => prev + 1)}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-500/20 transition-all uppercase text-[10px] tracking-widest"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-200">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Descripción del KPI</label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Categoría SQCDP</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none"
                  required
                >
                  {categorias.map(cat => (
                    <option key={cat.CategoriaSQCDPID} value={cat.CategoriaSQCDPID}>
                      {cat.CategoriaSQCDPDesc} ({cat.CategoriaSQCDPID})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Meta</label>
                <input
                  type="number"
                  step="any"
                  value={meta}
                  onChange={(e) => setMeta(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative">
              {/* Unidad de Medida Autocomplete/Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Unidad de Medida</label>
                <div className="relative">
                  <input
                    type="text"
                    value={unidadSearch}
                    onChange={(e) => {
                      setUnidadSearch(e.target.value);
                      setIsValidUnidad(false); // Reset validation state while typing
                    }}
                    placeholder="Buscar unidad (ej: KG)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-10 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
                
                {showUnidadesDropdown && unidadesList.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-50">
                    {unidadesList.map((uni) => (
                      <div
                        key={uni.UnidadMedidaId}
                        onClick={() => handleSelectUnidad(uni)}
                        className="px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                      >
                        <span className="font-black text-slate-900">{uni.UnidadMedidaId}</span> - {uni.UnidadMedidaDescripcion}
                      </div>
                    ))}
                  </div>
                )}
                {!isValidUnidad && unidadSearch.trim() !== '' && !showUnidadesDropdown && (
                  <p className="text-[9px] text-red-500 font-bold ml-1">Seleccione un elemento de la lista.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Dirección de Mejora</label>
                <select
                  value={direccion}
                  onChange={(e) => setDireccion(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none"
                  required
                >
                  {direcciones.map(dir => (
                    <option key={dir.id} value={dir.id}>
                      {dir.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="kpiActivo"
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="kpiActivo" className="text-sm font-bold text-slate-700 select-none">KPI Activo</label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98] uppercase text-[11px] tracking-widest disabled:opacity-70"
            >
              <Save size={18} />
              {saving ? 'Guardando...' : (mode === 'UPD' ? 'Guardar Cambios' : 'Crear KPI')}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
