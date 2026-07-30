import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, RefreshCw, AlertCircle, CheckCircle2, Filter, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { calendarService, CalendarioSemanalPayload } from '../services/calendarService';
import { CalendarioSemanalItem } from '../types';
import { MONTHS, YEARS } from '../constants/data';

// ─── Semanas del año 1–52 ────────────────────────────────────────────────────
const WEEK_NUMBERS = Array.from({ length: 52 }, (_, i) => i + 1);

// ─── Tipos internos ───────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface FormState {
  ano: number;
  mes: number;
  semana: number;
  inicio: string;
  fin: string;
}

interface CalendarViewProps {
  filters?: { year: string; month: string; week: string };
  onSelectWeekFilter?: (year: string, month: string, week: string) => void;
}

// ─── Helper: rango de fechas según año ───────────────────────────────────────
const dateMin = (ano: number) => `${ano}-01-01`;
const dateMax = (ano: number) => `${ano}-12-31`;

// ─── Componente Toast ─────────────────────────────────────────────────────────
const ToastNotification: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const t = setTimeout(() => onClose(toast.id), 5000);
    return () => clearTimeout(t);
  }, [toast.id, onClose]);

  const styles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; titleColor: string }> = {
    success: {
      bg: 'from-emerald-900/95 to-emerald-800/95',
      border: 'border-emerald-500/40',
      icon: <CheckCircle size={20} className="text-emerald-400 shrink-0" />,
      titleColor: 'text-emerald-300',
    },
    error: {
      bg: 'from-red-900/95 to-red-800/95',
      border: 'border-red-500/40',
      icon: <AlertCircle size={20} className="text-red-400 shrink-0" />,
      titleColor: 'text-red-300',
    },
    warning: {
      bg: 'from-amber-900/95 to-amber-800/95',
      border: 'border-amber-500/40',
      icon: <AlertTriangle size={20} className="text-amber-400 shrink-0" />,
      titleColor: 'text-amber-300',
    },
    info: {
      bg: 'from-blue-900/95 to-blue-800/95',
      border: 'border-blue-500/40',
      icon: <Info size={20} className="text-blue-400 shrink-0" />,
      titleColor: 'text-blue-300',
    },
  };

  const s = styles[toast.type];

  return (
    <div
      className={`flex items-start gap-3 bg-gradient-to-br ${s.bg} backdrop-blur-xl border ${s.border} rounded-2xl p-4 shadow-2xl min-w-[320px] max-w-[400px] animate-in`}
      style={{ animation: 'slideInRight 0.3s ease-out' }}
    >
      {s.icon}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-black ${s.titleColor} mb-0.5`}>{toast.title}</p>
        <p className="text-xs text-white/70 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white/40 hover:text-white/80 transition-colors shrink-0 mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// ─── Modal de Confirmación de Eliminación ─────────────────────────────────────
const DeleteConfirmModal: React.FC<{
  item: CalendarioSemanalItem;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ item, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
          <i className="fa-regular fa-trash-can text-red-600 text-lg" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 mb-1">Confirmar Eliminación</h3>
          <p className="text-sm text-slate-500">
            ¿Estás seguro de que deseas eliminar esta semana? Esta acción no se puede deshacer.
          </p>
        </div>
      </div>

      {/* Datos de la semana a eliminar */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm">
        <p className="font-black text-red-700 mb-1">{item.Etiqueta}</p>
        <p className="text-red-600 text-xs">
          Año {item.Ano} · {MONTHS[item.Mes - 1]} · Semana {item.Semana}
        </p>
        <p className="text-red-500 text-xs mt-1">
          {item.Inicio} — {item.Fin}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-2.5 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <i className="fa-regular fa-trash-can" />
          )}
          {loading ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Modal de Formulario (Agregar / Editar) ───────────────────────────────────
const WeekFormModal: React.FC<{
  mode: 'add' | 'edit';
  form: FormState;
  onFormChange: (field: keyof FormState, value: number | string) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  loadingDetail: boolean;
}> = ({ mode, form, onFormChange, onSave, onCancel, loading, loadingDetail }) => {
  const title = mode === 'add' ? 'Nueva Semana' : 'Actualizar Semana';
  const saveLabel = mode === 'add' ? 'Agregar' : 'Actualizar';

  const handleAnoChange = (ano: number) => {
    onFormChange('ano', ano);
    // Resetear fechas si están fuera del rango del nuevo año
    if (form.inicio && !form.inicio.startsWith(String(ano))) {
      onFormChange('inicio', `${ano}-01-01`);
    }
    if (form.fin && !form.fin.startsWith(String(ano))) {
      onFormChange('fin', `${ano}-12-31`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full animate-in">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === 'add' ? 'bg-blue-100' : 'bg-blue-100'}`}>
              {mode === 'add'
                ? <i className="fa-solid fa-plus text-blue-600" />
                : <i className="fa-regular fa-pen-to-square text-blue-600" />
              }
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">{title}</h3>
              <p className="text-[11px] text-slate-400 font-medium">Calendario SQCDP</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        {loadingDetail ? (
          <div className="p-12 text-center">
            <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500">Cargando datos de la semana...</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">

            {/* Fila: Año, Mes, Semana */}
            <div className="grid grid-cols-3 gap-4">
              {/* Año */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Año
                </label>
                <div className="relative">
                  <select
                    value={form.ano}
                    onChange={(e) => handleAnoChange(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Mes */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Mes
                </label>
                <div className="relative">
                  <select
                    value={form.mes}
                    onChange={(e) => onFormChange('mes', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                  >
                    {MONTHS.map((m, idx) => (
                      <option key={m} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Semana */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Semana
                </label>
                <div className="relative">
                  <select
                    value={form.semana}
                    onChange={(e) => onFormChange('semana', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                  >
                    {WEEK_NUMBERS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={form.inicio}
                min={dateMin(form.ano)}
                max={dateMax(form.ano)}
                onChange={(e) => onFormChange('inicio', e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={form.fin}
                min={dateMin(form.ano)}
                max={dateMax(form.ano)}
                onChange={(e) => onFormChange('fin', e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        {!loadingDetail && (
          <div className="flex gap-3 px-6 pb-6">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : mode === 'add' ? (
                <i className="fa-solid fa-plus" />
              ) : (
                <i className="fa-regular fa-pen-to-square" />
              )}
              {loading ? 'Guardando...' : saveLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export const CalendarView: React.FC<CalendarViewProps> = ({ filters, onSelectWeekFilter }) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;

  const initialYear = filters?.year ? parseInt(filters.year, 10) : currentYear;
  const initialMonth = filters?.month ? Math.max(1, MONTHS.indexOf(filters.month) + 1) : currentMonthNum;

  // ── Estado de lista ────────────────────────────────────────────────────────
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [calendarData, setCalendarData] = useState<CalendarioSemanalItem[]>([]);
  const [selectedWeekObj, setSelectedWeekObj] = useState<CalendarioSemanalItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ── Toasts ─────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Modal Agregar / Editar ─────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState<false | 'add' | 'edit'>(false);
  const [formState, setFormState] = useState<FormState>({
    ano: currentYear,
    mes: currentMonthNum,
    semana: 1,
    inicio: `${currentYear}-01-01`,
    fin: `${currentYear}-12-31`,
  });
  const [editTarget, setEditTarget] = useState<CalendarioSemanalItem | null>(null);
  const [savingForm, setSavingForm] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ── Modal Eliminar ─────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<CalendarioSemanalItem | null>(null);
  const [deletingItem, setDeletingItem] = useState(false);

  // ── Carga de lista ─────────────────────────────────────────────────────────
  const fetchCalendar = async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await calendarService.getCalendarioSemanal(year, month, month);
      setCalendarData(data);

      if (data.length > 0) {
        const todayStr = now.toISOString().split('T')[0];
        const matchedByFilter = filters?.week ? data.find((w) => w.Semana === parseInt(filters.week, 10)) : null;
        const currentWeekInMonth = data.find((w) => todayStr >= w.Inicio && todayStr <= w.Fin);
        const activeWeek = matchedByFilter || currentWeekInMonth || data[0];
        setSelectedWeekObj(activeWeek);
        if (onSelectWeekFilter) {
          const monthName = MONTHS[activeWeek.Mes - 1] || MONTHS[0];
          onSelectWeekFilter(String(activeWeek.Ano), monthName, String(activeWeek.Semana));
        }
      } else {
        setSelectedWeekObj(null);
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la información del calendario desde la API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar(selectedYear, selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  // ── Handlers de formulario ─────────────────────────────────────────────────
  const handleFormChange = (field: keyof FormState, value: number | string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const openAddModal = () => {
    setFormState({
      ano: selectedYear,
      mes: selectedMonth,
      semana: 1,
      inicio: `${selectedYear}-01-01`,
      fin: `${selectedYear}-12-31`,
    });
    setEditTarget(null);
    setModalOpen('add');
  };

  const openEditModal = async (item: CalendarioSemanalItem) => {
    setEditTarget(item);
    setModalOpen('edit');
    setLoadingDetail(true);
    try {
      const detail = await calendarService.getSemana(item.Ano, item.Mes, item.Semana);
      setFormState({
        ano: detail.Ano,
        mes: detail.Mes,
        semana: detail.Semana,
        inicio: detail.Inicio,
        fin: detail.Fin,
      });
    } catch (err: unknown) {
      console.error(err);
      // Fallback con datos del listado
      setFormState({
        ano: item.Ano,
        mes: item.Mes,
        semana: item.Semana,
        inicio: item.Inicio,
        fin: item.Fin,
      });
      addToast('warning', 'Advertencia', 'No se pudo obtener el detalle desde la API; se usaron los datos del listado.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setLoadingDetail(false);
  };

  const handleSaveForm = async () => {
    setSavingForm(true);
    const payload: CalendarioSemanalPayload = {
      Ano: formState.ano,
      Mes: formState.mes,
      Semana: formState.semana,
      Inicio: formState.inicio,
      Fin: formState.fin,
    };

    try {
      if (modalOpen === 'add') {
        const res = await calendarService.addSemana(payload);
        const msg = res?.Messages?.[0];
        if (msg?.Id === 'SuccessfullyAdded') {
          addToast('success', '¡Semana agregada!', msg.Description || 'Los datos han sido agregados.');
          closeModal();
          fetchCalendar(selectedYear, selectedMonth);
        } else {
          addToast('error', 'Error al agregar', msg?.Description || 'No se pudo agregar la semana.');
        }
      } else if (modalOpen === 'edit' && editTarget) {
        const res = await calendarService.updateSemana(editTarget.Ano, editTarget.Mes, editTarget.Semana, payload);
        const msg = res?.Messages?.[0];
        if (msg?.Id === 'SuccessfullyUpdated') {
          addToast('success', '¡Semana actualizada!', msg.Description || 'Los datos han sido actualizados.');
          closeModal();
          fetchCalendar(selectedYear, selectedMonth);
        } else {
          addToast('error', 'Error al actualizar', msg?.Description || 'No se pudo actualizar la semana.');
        }
      }
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: { Messages?: { Description?: string }[] } };
      const description = apiErr?.data?.Messages?.[0]?.Description;
      const status = apiErr?.status;
      addToast(
        'error',
        `Error ${status ?? 'de conexión'}`,
        description || 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
      );
    } finally {
      setSavingForm(false);
    }
  };

  // ── Handlers de eliminación ────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingItem(true);
    try {
      const res = await calendarService.deleteSemana(deleteTarget.Ano, deleteTarget.Mes, deleteTarget.Semana);
      const msg = res?.Messages?.[0];
      if (msg?.Id === 'SuccessfullyDeleted') {
        addToast('success', '¡Semana eliminada!', msg.Description || 'Los datos han sido eliminados.');
        setDeleteTarget(null);
        fetchCalendar(selectedYear, selectedMonth);
      } else {
        addToast('error', 'Error al eliminar', msg?.Description || 'No se pudo eliminar la semana.');
      }
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: { Messages?: { Description?: string }[] } };
      const description = apiErr?.data?.Messages?.[0]?.Description;
      const status = apiErr?.status;
      addToast(
        'error',
        `Error ${status ?? 'de conexión'}`,
        description || 'Ocurrió un error al eliminar. Por favor intenta de nuevo.'
      );
    } finally {
      setDeletingItem(false);
    }
  };

  // ── Selector de semana del header ──────────────────────────────────────────
  const handleWeekSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const semanaNum = parseInt(e.target.value, 10);
    const item = calendarData.find((w) => w.Semana === semanaNum);
    if (item) {
      setSelectedWeekObj(item);
      if (onSelectWeekFilter) {
        const monthName = MONTHS[item.Mes - 1] || MONTHS[0];
        onSelectWeekFilter(String(item.Ano), monthName, String(item.Semana));
      }
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastNotification toast={t} onClose={removeToast} />
          </div>
        ))}
      </div>

      {/* Modales */}
      {deleteTarget && (
        <DeleteConfirmModal
          item={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deletingItem}
        />
      )}

      {modalOpen && (
        <WeekFormModal
          mode={modalOpen}
          form={formState}
          onFormChange={handleFormChange}
          onSave={handleSaveForm}
          onCancel={closeModal}
          loading={savingForm}
          loadingDetail={loadingDetail}
        />
      )}

      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="text-emerald-600" size={24} />
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Administrador de Calendario</h2>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Consulta y navegación de semanas SQCDP según año y mes actual.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Year Filter */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-black text-slate-400 uppercase">Año:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer uppercase"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-black text-slate-400 uppercase">Mes:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer uppercase"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>

            {/* Week Selector */}
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <Filter size={14} className="text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-600 uppercase">Semana:</span>
              <select
                value={selectedWeekObj?.Semana || ''}
                onChange={handleWeekSelectChange}
                disabled={loading || calendarData.length === 0}
                className="bg-transparent text-xs font-black text-emerald-800 outline-none cursor-pointer uppercase"
              >
                {calendarData.map((item) => (
                  <option key={`${item.Mes}-${item.Semana}`} value={item.Semana}>
                    {item.Etiqueta} ({item.Inicio} al {item.Fin})
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchCalendar(selectedYear, selectedMonth)}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Recargar API Calendario"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Nueva Semana */}
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 hover:-translate-y-0.5"
            >
              Nueva semana
              <i className="fa-solid fa-plus text-xs" />
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 text-xs font-medium">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Semanas Registradas — {MONTHS[selectedMonth - 1]} {selectedYear}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">
              Total: {calendarData.length} Semanas
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw size={24} className="animate-spin text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">Consultando API de Calendario...</p>
            </div>
          ) : calendarData.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium">
              No se encontraron semanas registradas para el período seleccionado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-3 px-3 text-center w-10">
                      <span className="sr-only">Eliminar</span>
                    </th>
                    <th className="py-3 px-3 text-center w-10">
                      <span className="sr-only">Actualizar</span>
                    </th>
                    <th className="py-3 px-4">Etiqueta</th>
                    <th className="py-3 px-4">Año</th>
                    <th className="py-3 px-4">Mes</th>
                    <th className="py-3 px-4">Semana</th>
                    <th className="py-3 px-4">Fecha Inicio</th>
                    <th className="py-3 px-4">Fecha Fin</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {calendarData.map((item) => {
                    const isSelected = selectedWeekObj?.Semana === item.Semana;
                    const todayStr = now.toISOString().split('T')[0];
                    const isCurrentWeek = todayStr >= item.Inicio && todayStr <= item.Fin;

                    return (
                      <tr
                        key={`${item.Ano}-${item.Mes}-${item.Semana}`}
                        onClick={() => {
                          setSelectedWeekObj(item);
                          if (onSelectWeekFilter) {
                            const monthName = MONTHS[item.Mes - 1] || MONTHS[0];
                            onSelectWeekFilter(String(item.Ano), monthName, String(item.Semana));
                          }
                        }}
                        className={`cursor-pointer transition-colors hover:bg-slate-50/80 ${isSelected ? 'bg-emerald-50/60 font-bold' : ''}`}
                      >
                        {/* Botón Eliminar */}
                        <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="group relative w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            aria-label="Eliminar"
                          >
                            <i className="fa-regular fa-trash-can text-sm" />
                            <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              Eliminar
                            </span>
                          </button>
                        </td>

                        {/* Botón Actualizar */}
                        <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEditModal(item)}
                            className="group relative w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            aria-label="Actualizar"
                          >
                            <i className="fa-regular fa-pen-to-square text-sm" />
                            <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              Actualizar
                            </span>
                          </button>
                        </td>

                        <td className="py-3 px-4 font-black text-emerald-700">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[11px]">
                              {item.Etiqueta}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{item.Ano}</td>
                        <td className="py-3 px-4">{MONTHS[item.Mes - 1] || item.Mes}</td>
                        <td className="py-3 px-4">Semana {item.Semana}</td>
                        <td className="py-3 px-4 text-slate-600">{item.Inicio}</td>
                        <td className="py-3 px-4 text-slate-600">{item.Fin}</td>
                        <td className="py-3 px-4 text-center">
                          {isCurrentWeek ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 size={12} /> Semana Actual
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400">Regular</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Keyframe CSS para animación de entrada de toasts */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
};
