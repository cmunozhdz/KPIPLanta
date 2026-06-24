# Walkthrough: Portabilidad Segura de APIs y Proxy de Vite

Se han realizado modificaciones en las configuraciones de entorno y archivos de servicios para asegurar la portabilidad y evitar las referencias directas (hardcode) a las APIs del Polak Grupo, además de integrar un Proxy de Desarrollo Seguro con Vite.

## Cambios Realizados

1. **Variables de Entorno Centralizadas**:
   - Se crearon las siguientes variables en `.env`, `.env.production`, `.env.staging`, y `.env.example`:
     - `VITE_API_URL_SEG`: Ruta de la API de permisos y autenticación.
     - `VITE_APIS_PLANTA`: Ruta base para la API general de Planta.
     - `VITE_API_HISTORICO`: Ruta de la API para los registros históricos semanales.
     - `VITE_API_KPI`: Ruta de la API para el catálogo de KPIs.
     - `VITE_PROXY_TARGET`: Dirección base del servidor de desarrollo original.

2. **Configuración de Proxy Seguro en Vite** (`vite.config.ts`):
   - Se añadió un proxy en el servidor de desarrollo de Vite para redirigir peticiones que inicien con `/api` hacia `https://serviciosrest.polakgrupo.com`. Esto mitiga los problemas de CORS locales y mejora la seguridad de desarrollo.

3. **Modificación de Servicios**:
   - `src/services/kpiHistoricoService.ts`: Ahora consume `import.meta.env.VITE_API_HISTORICO` y el endpoint de calificaciones utiliza dinámicamente `getBaseApiUrl()`.
   - `src/services/CatalogosKPI.ts`: Actualizado para usar `import.meta.env.VITE_API_KPI` para evitar la URL hardcodeada.

4. **Soporte de TypeScript**:
   - Se actualizó `src/vite-env.d.ts` para que todas estas variables tengan soporte estático de tipado.

---

## Guía para Futuros Entornos (Producción, Staging, etc.)

Cuando se prepare la aplicación para un nuevo entorno de despliegue, sigue estos pasos:

### Opción A: URLs Absolutas (Predeterminado de Vite)
En entornos como staging o producción donde no se use un Proxy local en el servidor web de la aplicación (por ejemplo, si se despliega como estático en Cloud Run, S3 o similar):
1. Edita el archivo de entorno correspondiente (ej: `.env.production` o `.env.staging`).
2. Configura las variables utilizando las URLs absolutas del servidor API correspondiente:
   ```env
   VITE_API_URL_SEG="https://api-seguridad.mi-empresa.com/kiosco/Apis/IntranetSeguridad"
   VITE_APIS_PLANTA="https://api-planta.mi-empresa.com/kiosco/Apis/Planta"
   VITE_API_HISTORICO="https://api-historico.mi-empresa.com/kiosco/IAPlanta/AreaKPIHistoricoAPI/area_kpihistoricoes"
   VITE_API_KPI="https://api-kpis.mi-empresa.com/kiosco/IAPlanta/AreaKPIAPI/area_kpis"
   ```
3. Compila la aplicación usando el modo adecuado:
   ```bash
   npm run build -- --mode production
   ```

### Opción B: Proxy de Producción (Recomendado por Seguridad)
Si la aplicación se sirve desde un servidor web (como Nginx o Apache) que puede realizar redirecciones proxy:
1. Configura el servidor web de producción para redirigir las solicitudes a `/api` hacia el backend real (igual que en desarrollo).
   - Ejemplo de configuración en **Nginx**:
     ```nginx
     location /api/ {
         proxy_pass https://serviciosrest-produccion.polakgrupo.com/;
         proxy_set_header Host serviciosrest-produccion.polakgrupo.com;
         proxy_ssl_server_name on;
     }
     ```
2. Mantén las variables de entorno de producción con rutas relativas basadas en `/api`:
   ```env
   VITE_API_URL_SEG="/api/kiosco/Apis/IntranetSeguridad"
   VITE_APIS_PLANTA="/api/kiosco/Apis/Planta"
   VITE_API_HISTORICO="/api/kiosco/IAPlanta/AreaKPIHistoricoAPI/area_kpihistoricoes"
   VITE_API_KPI="/api/kiosco/IAPlanta/AreaKPIAPI/area_kpis"
   ```
3. Esto mantiene el código idéntico en desarrollo y producción, delegando la resolución DNS y el enrutamiento seguro al Proxy de infraestructura.
