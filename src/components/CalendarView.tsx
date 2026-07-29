import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, AlertCircle, CheckCircle2, Filter } from 'lucide-react';
import { calendarService } from '../services/calendarService';
import { CalendarioSemanalItem } from '../types';
import { MONTHS, YEARS } from '../constants/data';

interface CalendarViewProps {
  filters?: { year: string; month: string; week: string };
  onSelectWeekFilter?: (year: string, month: string, week: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ filters, onSelectWeekFilter }) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1; // 1-12

  const initialYear = filters?.year ? parseInt(filters.year, 10) : currentYear;
  const initialMonth = filters?.month ? Math.max(1, MONTHS.indexOf(filters.month) + 1) : currentMonthNum;

  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [calendarData, setCalendarData] = useState<CalendarioSemanalItem[]>([]);
  const [selectedWeekObj, setSelectedWeekObj] = useState<CalendarioSemanalItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendar = async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      // Query GET API for selected year & month
      const data = await calendarService.getCalendarioSemanal(year, month, month);
      setCalendarData(data);

      if (data.length > 0) {
        const todayStr = now.toISOString().split('T')[0];
        // If current filters week is in data, use it; otherwise prefer active current week, or first item of the month
        const matchedByFilter = filters?.week ? data.find(w => w.Semana === parseInt(filters.week, 10)) : null;
        const currentWeekInMonth = data.find(w => todayStr >= w.Inicio && todayStr <= w.Fin);
        
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
  }, [selectedYear, selectedMonth]);

  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth);
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
  };

  const handleWeekSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const semanaNum = parseInt(e.target.value, 10);
    const item = calendarData.find(w => w.Semana === semanaNum);
    if (item) {
      setSelectedWeekObj(item);
      if (onSelectWeekFilter) {
        const monthName = MONTHS[item.Mes - 1] || MONTHS[0];
        onSelectWeekFilter(String(item.Ano), monthName, String(item.Semana));
      }
    }
  };

  return (
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

        {/* Dynamic Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Filter */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-black text-slate-400 uppercase">Año:</span>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
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
              onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer uppercase"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>

          {/* Week Selector Dropdown - using Mes/Semana value and Etiqueta text as requested */}
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

          <button
            onClick={() => fetchCalendar(selectedYear, selectedMonth)}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Recargar API Calendario"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
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

      {/* List / Table of Calendar Items */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Semanas Registradas - {MONTHS[selectedMonth - 1]} {selectedYear}
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
                      className={`cursor-pointer transition-colors hover:bg-slate-50/80 ${
                        isSelected ? 'bg-emerald-50/60 font-bold' : ''
                      }`}
                    >
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
  );
};
