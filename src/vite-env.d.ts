/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_API_URL: string;
  readonly VITE_API_URL_SEG: string;
  readonly VITE_APIS_PLANTA: string;
  readonly VITE_API_HISTORICO: string;
  readonly VITE_API_KPI: string;
  readonly VITE_API_AREAS_ADMIN: string;
  readonly VITE_URL_MANUAL_USUARIO: string;
  readonly VITE_URL_SOPORTE_TI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
