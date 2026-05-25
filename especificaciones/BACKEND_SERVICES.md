# Documentación de Servicios API Backend (Tablero Planta)

Este documento describe los servicios REST (APIs) necesarios a implementar por el equipo de Backend para soportar las funcionalidades del Tablero de KPIs Planta Polak.

La estructura de datos y rutas está diseñada con base en el prototipo funcional actual del Frontend.

## 1. Módulo de Áreas (Pilares WCM)
Gestiona la información de los diferentes departamentos o pilares (Seguridad, Calidad, Producción, etc.).

### Obtener Áreas
*   **Endpoint:** `GET /api/areas`
*   **Propósito:** Obtener todas las áreas para el menú de navegación y las tarjetas del "Panorama Global".
*   **Respuesta Exitosa (200 OK):**
    ```json
    [
      {
        "id": "seg",
        "name": "Seguridad",
        "icon": "Shield",
        "color": "red"
      }
    ]
    ```

### Crear Nueva Área
*   **Endpoint:** `POST /api/areas`
*   **Propósito:** Crear una nueva área desde el panel de "Datos Maestros".
*   **Payload (Body):**
    ```json
    {
      "name": "Mantenimiento",
      "icon": "Settings",
      "color": "orange"
    }
    ```
*   **Respuesta Exitosa (201 Created):** Retorna el objeto `Area` creado con su ID generado.

---

## 2. Módulo de KPIs (Indicadores)
Gestiona la configuración base de cada indicador (metas, unidades, categoría SQCDP).

### Listar KPIs
*   **Endpoint:** `GET /api/kpis`
*   **Propósito:** Obtener el catálogo de KPIs base.
*   **Query Params:** `?areaId=seg` (Opcional, para filtrar KPIs por área).
*   **Respuesta Exitosa (200 OK):**
    ```json
    [
      {
        "id": "k-1",
        "areaId": "seg",
        "cat": "S",
        "label": "Días sin Accidentes LTI",
        "target": 365,
        "dir": 1,
        "unit": "días"
      }
    ]
    ```

### Crear KPI
*   **Endpoint:** `POST /api/kpis`
*   **Propósito:** Crear un nuevo indicador desde el panel "Datos Maestros".
*   **Payload (Body):**
    ```json
    {
      "areaId": "seg",
      "cat": "S",
      "label": "Días sin Accidentes",
      "target": 365,
      "dir": 1,
      "unit": "días"
    }
    ```
*   **Respuesta Exitosa (201 Created):** Retorna el objeto `Kpi` recién creado.

### Actualizar KPI
*   **Endpoint:** `PUT /api/kpis/:id`
*   **Propósito:** Actualizar datos base del KPI. Principalmente utilizado por el Administrador para modificar la **Meta (`target`)** del indicador.
*   **Payload (Body):**
    ```json
    {
      "target": 380
    }
    ```
*   **Respuesta Exitosa (200 OK):** Retorna el objeto `Kpi` actualizado.

### Eliminar KPI
*   **Endpoint:** `DELETE /api/kpis/:id`
*   **Propósito:** Eliminar un indicador completamente del sistema.
*   **Respuesta Exitosa (204 No Content / 200 OK).**

---

## 3. Módulo de Historial / Registros de KPI
Este es el servicio transaccional del día a día, encargado de capturar lo que el rol de 'Operador' o 'Admin' reportan semana a semana.

### Obtener Historial de un KPI
*   **Endpoint:** `GET /api/kpis/:id/history`
*   **Propósito:** Obtener la tabla de histórico y los datos para renderizar la gráfica de tendencias en el modal de detalles del KPI.
*   **Query Params:** `?year=2026&limit=52` (Opcional, para paginación o filtro).
*   **Respuesta Exitosa (200 OK):**
    ```json
    [
      {
        "id": "h-1",
        "year": "2026",
        "month": "Mayo",
        "week": "19",
        "value": 245,
        "comment": "Sin incidentes.",
        "updatedAt": "2026-05-15T10:00:00Z"
      }
    ]
    ```

### Registrar / Actualizar Valor Semanal (Upsert)
*   **Endpoint:** `PUT /api/kpis/:id/history` (o POST si se maneja un endpoint general)
*   **Propósito:** Guardar o actualizar el valor y comentario de un KPI en una semana específica.
*   **Nota Técnica:** El backend debe implementar una lógica "Upsert": si ya existe un registro para ese `Año + Mes + Semana` en el KPI correspondiente, lo actualiza. Si no existe, lo inserta.
*   **Payload (Body):**
    ```json
    {
      "year": "2026",
      "month": "Mayo",
      "week": "19",
      "value": 81,
      "comment": "Paros menores por sellado"
    }
    ```
*   **Respuesta Exitosa (200 OK):** Retorna el objeto `KpiHistory` guardado o actualizado con su timestamp `updatedAt`.

---

## 4. Reportes y Exportación

### Exportar Datos WCM
*   **Endpoint:** `GET /api/reports/wcm/export`
*   **Propósito:** Generar el reporte base para descarga al hacer clic en el botón "Exportar WCM".
*   **Query Params:** `?year=2026&month=Mayo&week=19`
*   **Respuesta Exitosa (200 OK):** Devolución de archivo en formato Blob/Stream (e.g., `text/csv` o archivo de Excel `.xlsx`).

---

## Recomendaciones de Arquitectura e Integración

1. **Gestión de Carga (Historial):**
   * En el GET principal de KPIs (`/api/kpis`), **no** es recomendable adjuntar el arreglo histórico completo por motivos de rendimiento.
   * Se sugiere que en el payload de `/api/kpis`, venga incluido un objeto o propiedad virtual `currentStatus` o `currentValue` resolviendo el valor en base a los filtros de semana/mes/año que pida el Dashboard.
   * El historial detallado se consultará bajo demanda con el endpoint `/api/kpis/:id/history`.

2. **Autenticación y Roles:**
   * Las peticiones de edición (POST, PUT, DELETE) deben estar protegidas, verificando los permisos del usuario desde el JWT.
   * **Viewer:** Solo accesos GET.
   * **Operator:** Accesos GET y edición del Historial (`PUT /api/kpis/:id/history`).
   * **Admin:** Acceso total (Modificación de áreas, metas, KPIs base e Historial).
