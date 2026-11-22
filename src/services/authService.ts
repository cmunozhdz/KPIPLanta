import { API_CONFIG } from '../config/apiConfig';

const getApiUrlSeg = () => API_CONFIG.SEGURIDAD;

export const authService = {
  checkPermission: async (permisosId: string, userEmail: string) => {
    const apiUrl = getApiUrlSeg();
    const response = await fetch(`${apiUrl}/Esvalido`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        PermisosId: permisosId,
        UserEmail: userEmail
      })
    });

    if (!response.ok) {
      throw new Error(`Error verificando permiso ${permisosId} (HTTP ${response.status})`);
    }

    return response.json();
  }
};
