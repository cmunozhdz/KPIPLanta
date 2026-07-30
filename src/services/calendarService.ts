import { CalendarioSemanalItem, CalendarioSemanalResponse } from '../types';

const BASE_CALENDAR_URL =
  import.meta.env.VITE_API_CALENDARIO ||
  '/api/Kiosco/IAPlanta/CalendarioSQCDPAPI/calendariosemanal';

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

// ─── Tipos de respuesta CRUD ────────────────────────────────────────────────

export interface CalendarioApiMessage {
  Id: string;
  Type: number;
  Description: string;
}

export interface CalendarioApiResponse {
  Messages: CalendarioApiMessage[];
}

export interface CalendarioSemanaDetalle extends CalendarioSemanalItem {
  Etiqueta: string;
}

// ─── Payload para POST / PUT ─────────────────────────────────────────────────

export interface CalendarioSemanalPayload {
  Ano: number;
  Mes: number;
  Semana: number;
  Inicio: string; // yyyy-MM-dd
  Fin: string;    // yyyy-MM-dd
}

// ─── Servicio ────────────────────────────────────────────────────────────────

export const calendarService = {

  // GET — Lista de semanas por año y rango de meses
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
  },

  // GET — Detalle de una semana específica
  getSemana: async (
    ano: number,
    mes: number,
    semana: number
  ): Promise<CalendarioSemanaDetalle> => {
    try {
      const url = `${BASE_CALENDAR_URL}/${ano}/${mes}/${semana}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: CalendarioSemanaDetalle = await response.json();
      return data;
    } catch (error) {
      console.error('[calendarService] Error consultando semana:', error);
      throw error;
    }
  },

  // POST — Agregar nueva semana
  addSemana: async (
    payload: CalendarioSemanalPayload
  ): Promise<CalendarioApiResponse> => {
    try {
      const response = await fetch(BASE_CALENDAR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CalendarioSQCDPData: payload }),
      });
      const data: CalendarioApiResponse = await response.json();
      if (response.status !== 201) {
        throw { status: response.status, data };
      }
      return data;
    } catch (error) {
      console.error('[calendarService] Error agregando semana:', error);
      throw error;
    }
  },

  // PUT — Actualizar semana existente
  updateSemana: async (
    ano: number,
    mes: number,
    semana: number,
    payload: CalendarioSemanalPayload
  ): Promise<CalendarioApiResponse> => {
    try {
      const url = `${BASE_CALENDAR_URL}/${ano}/${mes}/${semana}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CalendarioSQCDPData: payload }),
      });
      const data: CalendarioApiResponse = await response.json();
      if (!response.ok) {
        throw { status: response.status, data };
      }
      return data;
    } catch (error) {
      console.error('[calendarService] Error actualizando semana:', error);
      throw error;
    }
  },

  // DELETE — Eliminar semana existente
  deleteSemana: async (
    ano: number,
    mes: number,
    semana: number
  ): Promise<CalendarioApiResponse> => {
    try {
      const url = `${BASE_CALENDAR_URL}/${ano}/${mes}/${semana}`;
      const response = await fetch(url, { method: 'DELETE' });
      const data: CalendarioApiResponse = await response.json();
      if (!response.ok) {
        throw { status: response.status, data };
      }
      return data;
    } catch (error) {
      console.error('[calendarService] Error eliminando semana:', error);
      throw error;
    }
  },
};
