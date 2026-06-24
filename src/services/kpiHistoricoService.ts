import { KpiHistoricoSemanal } from '../types';

const getBaseApiUrl = () => import.meta.env.VITE_APIS_PLANTA || 'https://serviciosrest.polakgrupo.com/kiosco/Apis/Planta';
const getHistoricoApiUrl = () => import.meta.env.VITE_API_HISTORICO || 'https://serviciosrest.polakgrupo.com/kiosco/IAPlanta/AreaKPIHistoricoAPI/area_kpihistoricoes';

/**
 * Genera una fecha de consulta con décimas de segundo para evitar cache.
 * Formato: yyyy-MM-dd HH:mm:ss.S
 */
const buildFechaConsulta = (): string => {
  const now = new Date();
  const pad = (num: number) => num.toString().padStart(2, '0');
  const ms = Math.floor(now.getMilliseconds() / 100); // décima de segundo
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${ms}`;
};

export const kpiHistoricoService = {
  /**
   * GET: Obtener todos los KPIs históricos semanales para un Área/Año/Mes/Semana.
   * Endpoint: /Planta/HistoricoKPiSemanal
   */
  getHistoricoSemanal: async (
    ano: number,
    mes: number,
    semana: number,
    areaId: string
  ): Promise<KpiHistoricoSemanal[]> => {
    const fechaConsulta = buildFechaConsulta();
    const url = `${getBaseApiUrl()}/HistoricoKPiSemanal?Fechaconsulta=${encodeURIComponent(fechaConsulta)}&Kpihistoricoanio=${ano}&Kpihistoricomes=${mes}&Kpihistoricosemana=${semana}&Areaid=${encodeURIComponent(areaId)}`;

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Error al obtener histórico semanal (HTTP ${response.status})`);
    }

    const data = await response.json();
    if (Array.isArray(data)) return data;
    // Intentar encontrar un array en la respuesta
    if (data && typeof data === 'object') {
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key])) return data[key];
      }
    }
    return [];
  },

  /**
   * GET: Obtener un registro histórico específico por su ID (para edición).
   * Endpoint: /IAPlanta/AreaKPIHistoricoAPI/area_kpihistoricoes/{Historico}
   * 
   * Devuelve el registro actualizado o lanza error con mensaje descriptivo.
   */
  getHistoricoById: async (historicoId: string): Promise<KpiHistoricoSemanal> => {
    const fechaConsulta = buildFechaConsulta();
    const url = `${getHistoricoApiUrl()}/${encodeURIComponent(historicoId)}?FechaConsulta=${encodeURIComponent(`"${fechaConsulta}"`)}`;

    const response = await fetch(url, { cache: 'no-store' });

    if (response.status === 404) {
      const errorData = await response.json().catch(() => null);
      const description = errorData?.Messages?.[0]?.Description
        || 'No se encontraron datos con la clave especificada.';
      throw new Error(description);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const description = errorData?.Messages?.[0]?.Description
        || `Error al obtener el registro histórico (HTTP ${response.status})`;
      throw new Error(description);
    }

    const data = await response.json();
    // La respuesta puede venir directa o envuelta en AreaKPIHistoricoData
    if (data?.AreaKPIHistoricoData) return data.AreaKPIHistoricoData;
    return data;
  },

  /**
   * POST: Insertar un nuevo registro de KPI semanal.
   * Endpoint: /IAPlanta/AreaKPIHistoricoAPI/area_kpihistoricoes
   * 
   * Devuelve el resultado o lanza error con mensaje descriptivo de la API.
   */
  insertHistorico: async (payload: {
    Usuario: string;
    AreaId: string;
    KPIID: number;
    Valor: number;
    Ano: number;
    Mes: number;
    Semana: number;
    Comentarios: string;
  }): Promise<{ result: KpiHistoricoSemanal; message: string }> => {
    const response = await fetch(getHistoricoApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ AreaKPIHistoricoData: payload })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // 400 o 500: extraer descripción del mensaje
      const description = data?.Messages?.[0]?.Description
        || 'Error al registrar el KPI semanal.';
      throw new Error(description);
    }

    return {
      result: data?.AreaKPIHistoricoResultData || data,
      message: data?.Messages?.[0]?.Description || 'Registro exitoso.'
    };
  },

  /**
   * PUT: Actualizar un registro de KPI semanal existente.
   * Endpoint: /IAPlanta/AreaKPIHistoricoAPI/area_kpihistoricoes/{Historico}
   * 
   * Devuelve el resultado o lanza error con mensaje descriptivo.
   */
  updateHistorico: async (
    historicoId: string,
    payload: {
      Historico: number;
      Usuario: string;
      AreaId: string;
      KPIID: number;
      Valor: number;
      Ano: number;
      Mes: number;
      Semana: number;
      Comentarios: string;
    }
  ): Promise<{ result: KpiHistoricoSemanal; message: string }> => {
    const url = `${getHistoricoApiUrl()}/${encodeURIComponent(historicoId)}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ AreaKPIHistoricoData: payload })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const description = data?.Messages?.[0]?.Description
        || 'Error al actualizar el KPI semanal.';
      throw new Error(description);
    }

    return {
      result: data?.AreaKPIHistoricoResultData || data,
      message: data?.Messages?.[0]?.Description || 'Actualización exitosa.'
    };
  },

  /**
   * GET: Obtener histórico de un KPI específico filtrado por año.
   * Endpoint: /IAPlanta/AreaKPIHistoricoAPI/area_kpihistoricoes
   */
  getKpiHistoricoRango: async (
    kpiId: number,
    ano: number
  ): Promise<{ AreaKPIHistoricoDatas: KpiHistoricoSemanal[]; Count: number }> => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const now = new Date();
    const hundredths = Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0');
    const fechaConsulta = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${hundredths}`;

    const url = `${getHistoricoApiUrl()}?Kpifrom=${kpiId}&Kpito=${kpiId}&Anofrom=${ano}&Anoto=${ano}&Mesfrom=1&Mesto=12&Limit=100&Offset=0&FechaConsulta=${encodeURIComponent(fechaConsulta)}`;

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Error al obtener histórico de KPI (HTTP ${response.status})`);
    }

    const data = await response.json();
    return {
      AreaKPIHistoricoDatas: data.AreaKPIHistoricoDatas || [],
      Count: data.Count || 0
    };
  },

  /**
   * GET: Obtener calificaciones de la semana (KPIs en Blanco, Observación, Pérdidas Críticas)
   * Endpoint: /kiosco/Apis/Planta/calificaciones
   */
  getCalificaciones: async (
    ano: string,
    semana: string
  ): Promise<{ Contador: number; Calificacion: string }[]> => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const now = new Date();
    const fechaConsulta = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const url = `${getBaseApiUrl()}/calificaciones?Fechaconsulta=${encodeURIComponent(fechaConsulta)}&ANIO=${ano}&Semanainicial=${semana}&Semanafinal=${semana}`;

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Error al obtener calificaciones (HTTP ${response.status})`);
    }

    return await response.json();
  }
};
