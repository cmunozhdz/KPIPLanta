/**
 * Configuración centralizada de endpoints y servicios REST.
 * Soporta dinámicamente entornos: Kiosco (estándar) o KioscoDJP vía variable de entorno VITE_KIOSCO_CONTEXT.
 */

// Host base del servidor de APIs (por defecto: https://serviciosrest.polakgrupo.com)
export const API_HOST: string =
  import.meta.env.VITE_API_HOST ||
  import.meta.env.VITE_PROXY_TARGET ||
  'https://serviciosrest.polakgrupo.com';

// Instancia activa de Kiosco: "Kiosco" o "KioscoDJP"
export const KIOSCO_CONTEXT: string =
  import.meta.env.VITE_KIOSCO_CONTEXT || 'Kiosco';

// Formatea el contexto sin diagonales sobrantes
const sanitizedContext = KIOSCO_CONTEXT.replace(/^\/+|\/+$/g, '');

// En desarrollo local (vite dev) se utiliza el proxy '/api'
// En producción (vite build) se utiliza el HOST completo + contexto
const isDev = import.meta.env.DEV;

export const BASE_API_URL: string = isDev
  ? `/api/${sanitizedContext}`
  : `${API_HOST.replace(/\/+$/, '')}/${sanitizedContext}`;

/**
 * Resuelve una URL final asegurando que respete el contexto de Kiosco activo.
 */
const resolveEndpoint = (explicitEnvVar?: string, defaultRelativePath = ''): string => {
  if (explicitEnvVar && explicitEnvVar.trim() !== '') {
    // Si la variable contiene /Kiosco/ o /KioscoDJP/, adaptarla al contexto seleccionado
    return explicitEnvVar.replace(/\/(Kiosco|kiosco|KioscoDJP)\b/g, `/${sanitizedContext}`);
  }
  return `${BASE_API_URL}${defaultRelativePath}`;
};

export const API_CONFIG = {
  HOST: API_HOST,
  CONTEXT: sanitizedContext,
  BASE_URL: BASE_API_URL,

  // Seguridad / Intranet
  SEGURIDAD: resolveEndpoint(
    import.meta.env.VITE_API_URL_SEG || import.meta.env.VITE_API_URL,
    '/Apis/IntranetSeguridad'
  ),

  // Módulo ExOP
  EXOP: resolveEndpoint(
    import.meta.env.VITE_API_EXOP_URL,
    '/Apis/IntranetSeguridad/Modulo/ExOP'
  ),

  // Planta (Catálogos y consultas operativas)
  PLANTA: resolveEndpoint(
    import.meta.env.VITE_APIS_PLANTA,
    '/Apis/Planta'
  ),

  // Áreas Admin
  AREAS_ADMIN: resolveEndpoint(
    import.meta.env.VITE_API_AREAS_ADMIN,
    '/Apis/Planta/AreasLista/Admin'
  ),

  // KPIs
  KPI: resolveEndpoint(
    import.meta.env.VITE_API_KPI,
    '/IAPlanta/AreaKPIAPI/area_kpis'
  ),

  // Histórico de KPIs
  KPI_HISTORICO: resolveEndpoint(
    import.meta.env.VITE_API_HISTORICO,
    '/IAPlanta/AreaKPIHistoricoAPI/area_kpihistoricoes'
  ),

  // Calendario SQCDP
  CALENDARIO: resolveEndpoint(
    import.meta.env.VITE_API_CALENDARIO,
    '/IAPlanta/CalendarioSQCDPAPI/calendariosemanal'
  ),
};
