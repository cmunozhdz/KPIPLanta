import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, AlertCircle, AlertTriangle } from 'lucide-react';
import { areaService, ExOpPermiso } from '../services/areaService';

interface AreaManagerProps {
  areaId?: string;
  mode: 'UPD' | 'INS';
  onClose: () => void;
  onSaved: () => void;
}

export const AreaManager: React.FC<AreaManagerProps> = ({ areaId, mode, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    AreaId: '',
    AreaDescripcion: '',
    AreaActivo: true,
    AreaIcon: '',
    AreaColor: '',
    AreaPermiso: '',
    AreaPermisoRegistroKPI: ''
  });
  const [loading, setLoading] = useState(mode === 'UPD');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para la lista desplegable de permisos (ExOP)
  const [permisosList, setPermisosList] = useState<ExOpPermiso[]>([]);
  const [loadingPermisos, setLoadingPermisos] = useState(true);
  const [permisosApiError, setPermisosApiError] = useState<string | null>(null);

  // Carga del catálogo de permisos desde la API
  useEffect(() => {
    const fetchPermisos = async () => {
      setLoadingPermisos(true);
      setPermisosApiError(null);
      try {
        const list = await areaService.getExOpPermisos();
        setPermisosList(list);
      } catch (err: any) {
        setPermisosApiError(err?.message || 'Error al obtener la lista de permisos.');
      } finally {
        setLoadingPermisos(false);
      }
    };
    fetchPermisos();
  }, []);

  useEffect(() => {
    const fetchArea = async () => {
      if (mode === 'UPD' && areaId) {
        try {
          const data = await areaService.getAreaById(areaId);
          setFormData({
            AreaId: data.AreaId || '',
            AreaDescripcion: data.AreaDescripcion || '',
            AreaActivo: data.AreaActivo ?? true,
            AreaIcon: data.AreaIcon || '',
            AreaColor: data.AreaColor || '',
            AreaPermiso: data.AreaPermiso || '',
            AreaPermisoRegistroKPI: data.AreaPermisoKPIId || data.AreaPermisoRegistroKPI || ''
          });
        } catch (err) {
          setError('No se pudo cargar la información del área.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchArea();
  }, [areaId, mode]);

  // Validar si el permiso de Administrador seleccionado existe en la lista oficial
  const isInvalidAdminPermiso = Boolean(
    !loadingPermisos &&
    !permisosApiError &&
    formData.AreaPermiso &&
    permisosList.length > 0 &&
    !permisosList.some(p => p.IPermisosId === formData.AreaPermiso)
  );

  // Validar si el permiso de Registro KPI seleccionado existe en la lista oficial
  const isInvalidKPIPermiso = Boolean(
    !loadingPermisos &&
    !permisosApiError &&
    formData.AreaPermisoRegistroKPI &&
    permisosList.length > 0 &&
    !permisosList.some(p => p.IPermisosId === formData.AreaPermisoRegistroKPI)
  );

  // Validar que ambos permisos tengan un valor seleccionado válido de la lista
  const hasValidAdminPermiso = Boolean(
    formData.AreaPermiso && permisosList.some(p => p.IPermisosId === formData.AreaPermiso)
  );

  const hasValidKPIPermiso = Boolean(
    formData.AreaPermisoRegistroKPI && permisosList.some(p => p.IPermisosId === formData.AreaPermisoRegistroKPI)
  );

  const isSaveDisabled = saving || loadingPermisos || !!permisosApiError || !hasValidAdminPermiso || !hasValidKPIPermiso;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaveDisabled) return;

    setSaving(true);
    setError(null);
    try {
      await areaService.saveArea({
        trnMode: mode,
        AreaId: formData.AreaId,
        AreaDescripcion: formData.AreaDescripcion,
        AreaColor: formData.AreaColor,
        AreaIcon: formData.AreaIcon,
        AreaActivo: formData.AreaActivo,
        AreaPermiso: formData.AreaPermiso,
        AreaPermisoRegistroKPI: formData.AreaPermisoRegistroKPI
      });

      onSaved();
    } catch (err) {
      setError('Ocurrió un error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
        className="relative bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="bg-slate-50 px-8 py-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {mode === 'UPD' ? 'Editar Área' : 'Nueva Área / Pilar'}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Definir parámetros de área WCM</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-bold">Cargando...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">ID de Área</label>
                <input 
                  name="AreaId" 
                  type="text" 
                  value={formData.AreaId}
                  onChange={handleChange}
                  disabled={mode === 'UPD'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all disabled:opacity-60" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Permisos Administrador</label>
                <select 
                  name="AreaPermiso" 
                  value={formData.AreaPermiso}
                  onChange={handleChange}
                  disabled={loadingPermisos || !!permisosApiError}
                  className={`w-full bg-slate-50 border ${isInvalidAdminPermiso ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500 text-rose-700' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500 text-slate-800'} rounded-2xl px-5 py-4 text-sm font-black outline-none transition-all disabled:opacity-60 disabled:bg-slate-100 cursor-pointer disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {loadingPermisos ? 'Cargando permisos...' : '-- Seleccione un permiso --'}
                  </option>
                  {isInvalidAdminPermiso && (
                    <option value={formData.AreaPermiso} disabled>
                      ⚠️ {formData.AreaPermiso} (Valor no válido en BD)
                    </option>
                  )}
                  {permisosList.map(permiso => (
                    <option key={permiso.IPermisosId} value={permiso.IPermisosId}>
                      {permiso.IPermisosDescripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Permisos de registro KPI</label>
                <select 
                  name="AreaPermisoRegistroKPI" 
                  value={formData.AreaPermisoRegistroKPI}
                  onChange={handleChange}
                  disabled={loadingPermisos || !!permisosApiError}
                  className={`w-full bg-slate-50 border ${isInvalidKPIPermiso ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500 text-rose-700' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500 text-slate-800'} rounded-2xl px-5 py-4 text-sm font-black outline-none transition-all disabled:opacity-60 disabled:bg-slate-100 cursor-pointer disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {loadingPermisos ? 'Cargando permisos...' : '-- Seleccione un permiso --'}
                  </option>
                  {isInvalidKPIPermiso && (
                    <option value={formData.AreaPermisoRegistroKPI} disabled>
                      ⚠️ {formData.AreaPermisoRegistroKPI} (Valor no válido en BD)
                    </option>
                  )}
                  {permisosList.map(permiso => (
                    <option key={permiso.IPermisosId} value={permiso.IPermisosId}>
                      {permiso.IPermisosDescripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {permisosApiError && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200/80 text-red-800 text-xs shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-red-900 text-sm">Error en Servicio de Permisos</span>
                  <span className="font-medium text-red-700 mt-0.5 block">{permisosApiError}</span>
                  <span className="text-[11px] text-red-500 font-semibold mt-1 block">El control ha sido desactivado. No es posible realizar cambios hasta restablecer la conexión.</span>
                </div>
              </div>
            )}

            {(isInvalidAdminPermiso || isInvalidKPIPermiso) && !permisosApiError && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs shadow-sm">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-amber-900 text-sm">Valor de Permiso No Válido</span>
                  <span className="font-normal text-amber-800 mt-0.5 block">
                    Uno o ambos permisos seleccionados o almacenados no existen en la lista oficial de permisos ExOP.
                  </span>
                  <span className="font-bold text-amber-900 mt-1 block">
                    Para poder guardar los cambios, debes seleccionar permisos válidos de las listas desplegables.
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Descripción</label>
              <input 
                name="AreaDescripcion" 
                type="text" 
                value={formData.AreaDescripcion}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Icono</label>
                <input 
                  name="AreaIcon" 
                  type="text" 
                  value={formData.AreaIcon}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Color</label>
                <input 
                  name="AreaColor" 
                  type="text" 
                  value={formData.AreaColor}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input 
                name="AreaActivo" 
                id="AreaActivo"
                type="checkbox" 
                checked={formData.AreaActivo}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500" 
              />
              <label htmlFor="AreaActivo" className="text-sm font-bold text-slate-700">Área Activa</label>
            </div>

            <button 
              type="submit" 
              disabled={isSaveDisabled}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98] uppercase text-[11px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              <Save size={18} />
              {saving ? 'Guardando...' : (mode === 'UPD' ? 'Guardar Cambios' : 'Crear Área')}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

