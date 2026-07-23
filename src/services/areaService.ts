const getApiUrl = () => import.meta.env.VITE_APIS_PLANTA || 'https://serviciosrest.polakgrupo.com/kiosco/Apis/Planta';
const getExOpApiUrl = () => import.meta.env.VITE_API_EXOP_URL || 'https://serviciosrest.polakgrupo.com/kiosco/Apis/IntranetSeguridad/Modulo/ExOP';
const getAdminApiUrl = () => import.meta.env.VITE_API_AREAS_ADMIN || 'https://serviciosrest.polakgrupo.com/Kiosco/Apis/Planta/AreasLista/Admin';

const buildFechaConsultaAdmin = (): string => {
  const now = new Date();
  const pad = (num: number) => num.toString().padStart(2, '0');
  const YYYY = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const MM = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${YYYY}-${mm}-${dd}-${hh}:${MM}:${ss}`;
};

export interface ExOpPermiso {
  IPermisosId: string;
  IPermisosDescripcion: string;
}

export interface AdminAreaItem {
  AreaId: string;
  AreaDescripcion: string;
  AreaActivo: boolean;
  AreaIcon: string;
  AreaColor: string;
  AreaPermiso: string;
}

export interface AdminAreasResponse {
  Areas: AdminAreaItem[];
}

export const areaService = {
  getAreas: async () => {
    const apiUrl = getApiUrl();
    const timestamp = new Date().getTime();
    const response = await fetch(`${apiUrl}/AreaLista?_=${timestamp}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Servicio no disponible (HTTP ${response.status})`);
    }
    
    return response.json();
  },

  getAdminAreas: async (usuario: string): Promise<AdminAreasResponse> => {
    const apiUrl = getAdminApiUrl();
    const fechaConsulta = buildFechaConsultaAdmin();
    const separator = apiUrl.includes('?') ? '&' : '?';
    const url = `${apiUrl}${separator}Fechaconsulta=${encodeURIComponent(fechaConsulta)}&Usuario=${encodeURIComponent(usuario)}`;

    const response = await fetch(url, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Error al consultar áreas de administrador (HTTP ${response.status})`);
    }

    return response.json();
  },

  getAreaById: async (areaId: string) => {
    const apiUrl = getApiUrl();
    const timestamp = new Date().getTime();
    const response = await fetch(`${apiUrl}/Item/${areaId}?_=${timestamp}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener el área');
    }
    
    return response.json();
  },

  saveArea: async (payload: any) => {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/SaveArea`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error('Error al guardar el área');
    }
    
    return response.json();
  },

  getExOpPermisos: async (): Promise<ExOpPermiso[]> => {
    const apiUrl = getExOpApiUrl();
    const timestamp = new Date().getTime();
    const separator = apiUrl.includes('?') ? '&' : '?';
    const response = await fetch(`${apiUrl}${separator}_=${timestamp}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Error al consultar el servicio de permisos (HTTP ${response.status})`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.Lista)) {
      return data.Lista;
    }
    return [];
  }
};


