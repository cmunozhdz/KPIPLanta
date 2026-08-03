const getApiUrl = () => import.meta.env.VITE_APIS_PLANTA || 'https://serviciosrest.polakgrupo.com/kiosco/Apis/Planta';
const getKpiApiUrl = () => import.meta.env.VITE_API_KPI || 'https://serviciosrest.polakgrupo.com/kiosco/IAPlanta/AreaKPIAPI/area_kpis';

export interface UnidadMedida {
  UnidadMedidaDescripcion: string;
  UnidadMedidaId: string;
}

export interface CategoriaSQCDP {
  CategoriaSQCDPID: string;
  CategoriaSQCDPDesc: string;
  CategoriaSQCDPActivo: boolean;
}

export interface AreaKPIData {
  KPI?: number;
  Descripcion: string;
  Categoria: string;
  MetaActual: number;
  Direccion: number;
  Unidaddemedida: string;
  AreaId: string;
  KPIActivo: boolean;
  Periodicidad?: string;
  Frecuencia?: string;
}

export const CatalogosKPIService = {
  // Obtener KPIs de un área determinada
  getAreaKPIs: async (areaId: string): Promise<any[]> => {
    const now = new Date();
    const pad = (num: number) => num.toString().padStart(2, '0');
    const fechaStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const url = `${getKpiApiUrl()}?Areaid=${areaId}&Limit=100&Offset=0&Consulta=${encodeURIComponent(fechaStr)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener KPIs del área (HTTP ${response.status})`);
    }
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      for (const key of ['AreaKPIDatas', 'AreaKPIs', 'Items', 'Data', 'Results', 'Kpis', 'KPIs']) {
        if (Array.isArray(data[key])) return data[key];
      }
      const keys = Object.keys(data);
      for (const key of keys) {
        if (Array.isArray(data[key])) return data[key];
      }
    }
    console.warn('getAreaKPIs: respuesta inesperada de la API', data);
    return [];
  },

  // Obtener lista de unidades de medida
  getUnidadMedidaLista: async (unidadBuscar: string = '%'): Promise<UnidadMedida[]> => {
    const timestamp = new Date().getTime();
    // Si la búsqueda es '%' o '%25', pasamos %25 directamente a la querystring para que coincida exactamente con la llamada de Swagger:
    // https://serviciosrest.polakgrupo.com/Kiosco/Apis/Planta/UnidadMedidaLista?Unidadmedidadescripcion=%25
    const param = (unidadBuscar === '%' || unidadBuscar === '%25') ? '%25' : encodeURIComponent(unidadBuscar);
    const url = `${getApiUrl()}/UnidadMedidaLista?Unidadmedidadescripcion=${param}&_=${timestamp}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Error al obtener lista de unidades de medida');
    }
    const data = await response.json();
    return data?.UMBLista || [];
  },

  // Obtener categorías SQCDP
  getCategoriasLista: async (): Promise<CategoriaSQCDP[]> => {
    const timestamp = new Date().getTime();
    // GET a https://serviciosrest.polakgrupo.com/kiosco/Apis/Planta/CategoriasLista
    const url = `${getApiUrl()}/CategoriasLista?_=${timestamp}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Error al obtener categorías SQCDP');
    }
    const data = await response.json();
    return data?.Categorias || [];
  },

  // Direcciones estáticas
  getDireccionesLista: () => {
    return [
      { id: 1, descripcion: 'Ascendente (Más es Mejor)' },
      { id: 2, descripcion: 'Descendente (Menos es mejor)' }
    ];
  },

  // Obtener un KPI específico por su ID
  getKPIById: async (id: number | string): Promise<any> => {
    const timestamp = new Date().getTime();
    const url = `${getKpiApiUrl()}/${id}?_=${timestamp}`;
    console.log(`[CatalogosKPIService] Fetching KPI Data - GET ${url}`);
    const response = await fetch(url, { cache: 'no-store' });
    console.log(`[CatalogosKPIService] Response Status: ${response.status}`);
    if (!response.ok) {
      console.error(`[CatalogosKPIService] Error fetching KPI ${id} - HTTP ${response.status}`);
      throw new Error(`Error al leer el KPI ${id} (HTTP ${response.status})`);
    }
    const data = await response.json();
    console.log(`[CatalogosKPIService] RAW KPI Data Retrieved:`, data);
    console.log(`[CatalogosKPIService] RAW Data Type:`, typeof data, `Is Array: ${Array.isArray(data)}`);
    
    let kpiData = null;
    
    if (data && typeof data === 'object' && (data.KPI || data.Descripcion || data.MetaActual)) {
      kpiData = data;
      console.log(`[CatalogosKPIService] Using data directly (has expected properties):`, kpiData);
    }
    else if (Array.isArray(data)) {
      kpiData = data[0];
      console.log(`[CatalogosKPIService] Extracted from array:`, kpiData);
    }
    else if (data && data.AreaKPIDatas && Array.isArray(data.AreaKPIDatas)) {
      kpiData = data.AreaKPIDatas[0];
      console.log(`[CatalogosKPIService] Extracted from AreaKPIDatas:`, kpiData);
    }
    else if (data && data.AreaKPIResultData) {
      kpiData = data.AreaKPIResultData;
      console.log(`[CatalogosKPIService] Extracted from AreaKPIResultData:`, kpiData);
    }
    else if (data && data.AreaKPIs && Array.isArray(data.AreaKPIs)) {
      kpiData = data.AreaKPIs[0];
      console.log(`[CatalogosKPIService] Extracted from AreaKPIs:`, kpiData);
    }
    else if (data && typeof data === 'object') {
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          kpiData = data[key][0];
          console.log(`[CatalogosKPIService] Extracted from ${key}:`, kpiData);
          break;
        }
      }
    }
    
    if (!kpiData) {
      console.warn(`[CatalogosKPIService] Could not extract KPI data from response:`, data);
      return data;
    }
    
    console.log(`[CatalogosKPIService] FINAL KPI Data:`, kpiData);
    return kpiData;
  },

  // Insertar un nuevo KPI
  insertKPI: async (kpiData: AreaKPIData): Promise<any> => {
    const metaValue = kpiData.MetaActual === 0 ? 0.0001 : kpiData.MetaActual;
    const payload = {
      KPI: 0,
      Descripcion: kpiData.Descripcion,
      Categoria: kpiData.Categoria,
      MetaActual: metaValue,
      Direccion: kpiData.Direccion,
      Unidaddemedida: kpiData.Unidaddemedida,
      KPIActivo: kpiData.KPIActivo,
      AreaId: kpiData.AreaId,
      Frecuencia: kpiData.Frecuencia || kpiData.Periodicidad || 'M'
    };
    const url = getKpiApiUrl();
    console.log(`[CatalogosKPIService] Invoking insertKPI - URL: ${url}`, { payload });
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ AreaKPIData: payload })
    });
    console.log(`[CatalogosKPIService] Response insertKPI - Status: ${response.status}`);
    const data = await response.json();
    console.log(`[CatalogosKPIService] Data insertKPI:`, data);
    if (!response.ok) {
      throw new Error('Error al insertar el KPI');
    }
    return data;
  },

  // Actualizar un KPI existente
  updateKPI: async (id: number | string, kpiData: AreaKPIData): Promise<any> => {
    const metaValue = kpiData.MetaActual === 0 ? 0.0001 : kpiData.MetaActual;
    const payload = {
      KPI: Number(id),
      Descripcion: kpiData.Descripcion,
      Categoria: kpiData.Categoria,
      MetaActual: metaValue,
      Direccion: kpiData.Direccion,
      Unidaddemedida: kpiData.Unidaddemedida,
      KPIActivo: kpiData.KPIActivo,
      AreaId: kpiData.AreaId,
      Frecuencia: kpiData.Frecuencia || kpiData.Periodicidad || 'M'
    };
    const url = `${getKpiApiUrl()}/${id}`;
    console.log(`[CatalogosKPIService] Invoking updateKPI - URL: ${url}`, { payload });
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ AreaKPIData: payload })
    });
    console.log(`[CatalogosKPIService] Response updateKPI - Status: ${response.status}`);
    const data = await response.json();
    console.log(`[CatalogosKPIService] Data updateKPI:`, data);
    if (!response.ok) {
      throw new Error('Error al actualizar el KPI');
    }
    return data;
  },

  // Eliminar un KPI por su ID
  deleteKPI: async (id: number | string): Promise<void> => {
    // DELETE a https://serviciosrest.polakgrupo.com/Kiosco/IAPlanta/AreaKPIAPI/area_kpis/ID
    const url = `${getKpiApiUrl()}/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar el KPI (HTTP ${response.status})`);
    }
    const data = await response.json();
    // Validar que la respuesta confirme la eliminación exitosa
    const messages: { Id: string; Type: number; Description: string }[] = data?.Messages || [];
    const success = messages.some((m) => m.Id === 'SuccessfullyDeleted');
    if (!success) {
      // Intentar extraer descripción del primer mensaje de error
      const errorMsg = messages.length > 0
        ? messages[0].Description
        : 'La API no confirmó la eliminación del KPI.';
      throw new Error(errorMsg);
    }
  },
};
