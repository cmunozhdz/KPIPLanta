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
  ID?: number;
  Descripcion: string;
  Categoria: string;
  Meta: number;
  Direccion: number;
  Unidaddemedida: string;
  AreaId: string;
  Activo: boolean;
}

export const CatalogosKPIService = {
  // Obtener KPIs de un área determinada
  getAreaKPIs: async (areaId: string): Promise<any[]> => {
    const now = new Date();
    const pad = (num: number) => num.toString().padStart(2, '0');
    const ms = Math.floor(now.getMilliseconds() / 100); // décima de segundo
    const fechaStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${ms}`;

    // GET a https://serviciosrest.polakgrupo.com/kiosco/IAPlanta/AreaKPIAPI/area_kpis?&Areaid={Area}&Limit=100&Offset=0&consulta="{Fecha}"&AreaKPIActivo=true
    const url = `${getKpiApiUrl()}?Areaid=${areaId}&Limit=100&Offset=0&consulta=${encodeURIComponent(`"${fechaStr}"`)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener KPIs del área (HTTP ${response.status})`);
    }
    const data = await response.json();
    // La API puede devolver un array directo o un objeto envolvente
    if (Array.isArray(data)) return data;
    // Buscar la primera propiedad que sea un array de KPIs
    if (data && typeof data === 'object') {
      // Intentar propiedades comunes de respuesta
      for (const key of ['AreaKPIDatas', 'AreaKPIs', 'Items', 'Data', 'Results', 'Kpis', 'KPIs']) {
        if (Array.isArray(data[key])) return data[key];
      }
      // Si el objeto tiene una sola clave que es array, usarla
      const keys = Object.keys(data);
      for (const key of keys) {
        if (Array.isArray(data[key])) return data[key];
      }
    }
    console.warn('getAreaKPIs: respuesta inesperada de la API', data);
    return [];
  },

  // Obtener lista de unidades de medida (filtro dinámico)
  getUnidadMedidaLista: async (unidadBuscar: string): Promise<UnidadMedida[]> => {
    if (!unidadBuscar || unidadBuscar.trim() === '') {
      return [];
    }
    const timestamp = new Date().getTime();
    // GET a https://serviciosrest.polakgrupo.com/kiosco/Apis/Planta/UnidadMedidaLista?Unidadmedidadescripcion=KG
    const url = `${getApiUrl()}/UnidadMedidaLista?Unidadmedidadescripcion=${encodeURIComponent(unidadBuscar)}&_=${timestamp}`;
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
    // GET a https://serviciosrest.polakgrupo.com/kiosco/IAPlanta/AreaKPIAPI/area_kpis/ID
    const url = `${getKpiApiUrl()}/${id}?_=${timestamp}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Error al leer el KPI ${id}`);
    }
    const data = await response.json();
    // La respuesta puede ser el KPI directo o envuelto en AreaKPIResultData
    if (data && data.AreaKPIResultData) return data.AreaKPIResultData;
    return data;
  },

  // Insertar un nuevo KPI
  insertKPI: async (kpiData: AreaKPIData): Promise<any> => {
    const preparedData = {
      ...kpiData,
      Meta: kpiData.Meta === 0 ? 0.0001 : kpiData.Meta
    };
    const url = getKpiApiUrl();
    console.log(`[CatalogosKPIService] Invoking insertKPI - URL: ${url}`, { payload: preparedData });
    // POST a https://serviciosrest.polakgrupo.com/kiosco/IAPlanta/AreaKPIAPI/area_kpis
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ AreaKPIData: preparedData })
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
    const preparedData = {
      ...kpiData,
      Meta: kpiData.Meta === 0 ? 0.0001 : kpiData.Meta
    };
    // PUT a https://serviciosrest.polakgrupo.com/kiosco/IAPlanta/AreaKPIAPI/area_kpis/ID
    const url = `${getKpiApiUrl()}/${id}`;
    console.log(`[CatalogosKPIService] Invoking updateKPI - URL: ${url}`, { payload: preparedData });
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ AreaKPIData: preparedData })
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
