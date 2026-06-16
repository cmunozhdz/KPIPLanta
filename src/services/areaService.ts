const getApiUrl = () => import.meta.env.VITE_APIS_PLANTA || 'https://serviciosrest.polakgrupo.com/kiosco/Apis/Planta';

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
  }
};
