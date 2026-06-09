const getApiUrlSeg = () => import.meta.env.VITE_API_URL_SEG || 'https://serviciosrest.polakgrupo.com/kiosco/Apis/IntranetSeguridad';

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
