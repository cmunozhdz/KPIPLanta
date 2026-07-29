import { CalendarioSemanalItem, CalendarioSemanalResponse } from '../types';

const BASE_CALENDAR_URL = import.meta.env.VITE_API_CALENDARIO || '/api/Kiosco/IAPlanta/CalendarioSQCDPAPI/calendariosemanal';

const buildFechaConsulta = (): string => {
  const now = new Date();
  const pad = (num: number) => num.toString().padStart(2, '0');
  const yy = now.getFullYear().toString().slice(-2);
  const MM = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${yy}-${MM}-${dd}-${hh}-${mm}-${ss}`;
};

export const calendarService = {
  getCalendarioSemanal: async (
    ano: number,
    mesFrom: number = 1,
    mesTo: number = 12,
    limit: number = 52,
    offset: number = 0
  ): Promise<CalendarioSemanalItem[]> => {
    try {
      const fechaConsulta = buildFechaConsulta();
      const url = `${BASE_CALENDAR_URL}?Ano=${ano}&Mesfrom=${mesFrom}&Mesto=${mesTo}&Limit=${limit}&Offset=${offset}&FechaConsulta=${fechaConsulta}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CalendarioSemanalResponse = await response.json();
      if (data && Array.isArray(data.CalendarioSQCDPDatas)) {
        return data.CalendarioSQCDPDatas;
      }
      return [];
    } catch (error) {
      console.error('[calendarService] Error consultando el calendario semanal:', error);
      throw error;
    }
  }
};
