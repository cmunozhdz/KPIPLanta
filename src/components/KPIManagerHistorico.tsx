import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, AlertCircle, CheckCircle2, Loader2, FileEdit, FilePlus2 } from 'lucide-react';
import { kpiHistoricoService } from '../services/kpiHistoricoService';
import { KpiHistoricoSemanal } from '../types';
import { SQCDP_CATEGORIES } from '../constants/data';

interface KPIManagerHistoricoProps {
  areaId: string;
  kpiId: number;
  kpiLabel: string;
  kpiUnit: string;
  kpiCat: string;
  historicoId: string; // "0" = insert mode, otherwise edit mode
  ano: number;
  mes: number;
  semana: number;
  userEmail: string;
  initialValor?: string;
  initialComentarios?: string;
  onClose: () => void;
  onSaved: () => void;
}

export const KPIManagerHistorico: React.FC<KPIManagerHistoricoProps> = ({
  areaId,
  kpiId,
  kpiLabel,
  kpiUnit,
  kpiCat,
  historicoId,
  ano,
  mes,
  semana,
  userEmail,
  initialValor,
  initialComentarios,
  onClose,
  onSaved
}) => {
  const isEditMode = historicoId !== '0' && historicoId !== '';

  const [valor, setValor] = useState<string>(initialValor || '');
  const [comentarios, setComentarios] = useState<string>(initialComentarios || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loadedData, setLoadedData] = useState<KpiHistoricoSemanal | null>(null);

  const categoryColor = SQCDP_CATEGORIES[kpiCat as keyof typeof SQCDP_CATEGORIES]?.color || '#60a5fa';
  const categoryLabel = SQCDP_CATEGORIES[kpiCat as keyof typeof SQCDP_CATEGORIES]?.label || kpiCat;

  const MONTH_NAMES = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // If edit mode, fetch latest data from the API
  useEffect(() => {
    if (!isEditMode) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await kpiHistoricoService.getHistoricoById(historicoId);
        setLoadedData(data);
        setValor(data.Valor || '');
        setComentarios(data.Comentarios || '');
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos del registro.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [historicoId, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const numericValor = parseFloat(valor);
    if (isNaN(numericValor)) {
      setError('El valor ingresado no es un número válido.');
      setSaving(false);
      return;
    }

    const fullText = comentarios.trim();
    const totalWords = fullText
      .split(/\s+/)
      .filter(word => /[a-zA-Z0-9ñÑáéíóúüÁÉÍÓÚÜ]/.test(word));

    if (fullText.length <= 1 || totalWords.length < 2) {
      setError('El comentario es obligatorio y debe contener al menos dos palabras (no se permite un solo carácter o una sola palabra).');
      setSaving(false);
      return;
    }

    try {
      if (isEditMode) {
        // PUT update
        const result = await kpiHistoricoService.updateHistorico(historicoId, {
          Historico: parseInt(historicoId, 10),
          Usuario: userEmail,
          AreaId: areaId,
          KPIID: kpiId,
          Valor: numericValor,
          Ano: ano,
          Mes: mes,
          Semana: semana,
          Comentarios: comentarios
        });
        setSuccessMsg(result.message);
      } else {
        // POST insert
        const result = await kpiHistoricoService.insertHistorico({
          Usuario: userEmail,
          AreaId: areaId,
          KPIID: kpiId,
          Valor: numericValor,
          Ano: ano,
          Mes: mes,
          Semana: semana,
          Comentarios: comentarios
        });
        setSuccessMsg(result.message);
      }

      // Wait briefly to show success, then close
      setTimeout(() => {
        onSaved();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud.');
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
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_25px_60px_rgba(0,0,0,0.25)] overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 px-8 py-7 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                className="w-12 h-12 flex items-center justify-center rounded-2xl text-white font-black text-lg shadow-lg"
                style={{ backgroundColor: categoryColor }}
              >
                {kpiCat}
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {isEditMode ? (
                    <FileEdit size={16} className="text-amber-500" />
                  ) : (
                    <FilePlus2 size={16} className="text-emerald-500" />
                  )}
                  <h3 className="text-base font-black text-slate-800 tracking-tight">
                    {isEditMode ? 'Editar Registro Semanal' : 'Nuevo Registro Semanal'}
                  </h3>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpiLabel}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                  {categoryLabel} · {MONTH_NAMES[mes] || mes} {ano} · Semana {semana}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/80 rounded-xl text-slate-400 hover:text-slate-600 transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Loader2 size={28} className="text-blue-500" />
            </motion.div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando Registro...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Success Message */}
            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200">
                    <CheckCircle2 size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Operación Exitosa</p>
                    <p className="text-xs font-bold text-emerald-700">{successMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-md shadow-red-200">
                    <AlertCircle size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-wider">Error del Servicio</p>
                    <p className="text-xs font-bold text-red-700">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Period Info (read-only) */}
            <div className="flex gap-3">
              <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Año</p>
                <p className="text-sm font-black text-slate-800">{ano}</p>
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Mes</p>
                <p className="text-sm font-black text-slate-800">{MONTH_NAMES[mes] || mes}</p>
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Semana</p>
                <p className="text-sm font-black text-slate-800">W{semana}</p>
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">
                Valor del KPI ({kpiUnit})
              </label>
              <input
                type="number"
                step="any"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                autoFocus
                placeholder="Ingresa el valor..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-lg font-black text-slate-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 placeholder:font-medium"
                required
                disabled={!!successMsg}
              />
            </div>

            {/* Comentarios */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">
                Comentarios *
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Describe observaciones, causas o acciones correctivas..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none h-28 resize-none transition-all placeholder:text-slate-300 placeholder:font-medium"
                required
                disabled={!!successMsg}
              />
            </div>

            {/* Edit mode: show loaded metadata */}
            {isEditMode && loadedData && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Información del Registro</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold">Último usuario</p>
                    <p className="text-[11px] font-black text-slate-600">{loadedData.Usuario}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold">Registro</p>
                    <p className="text-[11px] font-black text-slate-600">
                      {new Date(loadedData.Registro).toLocaleString('es-MX', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold">Meta Asignada</p>
                    <p className="text-[11px] font-black text-slate-600">{loadedData.MetaAsignada} {kpiUnit}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold">ID Histórico</p>
                    <p className="text-[11px] font-black text-slate-600">#{historicoId}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={saving || !!successMsg}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center justify-center gap-3 font-black py-5 rounded-2xl shadow-xl transition-all uppercase text-[11px] tracking-widest disabled:opacity-60 disabled:cursor-not-allowed ${
                isEditMode
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-100'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-100'
              }`}
            >
              {saving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                >
                  <Loader2 size={18} />
                </motion.div>
              ) : (
                <Save size={18} />
              )}
              {saving
                ? 'Procesando...'
                : isEditMode
                  ? 'Actualizar Registro'
                  : 'Registrar KPI Semanal'
              }
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
