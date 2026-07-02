# Plan de Actualización: KPIManager API Integration

## Resumen Ejecutivo
Actualizar el componente KPIManager.tsx y el servicio CatalogosKPI.ts para trabajar con la nueva estructura de API REST proporcionada.

---

## Cambios Identificados

### 1. API Endpoints (Sin cambios)
Los endpoints base permanecen iguales:
- GET individual: `/area_kpis/{KPI}`
- GET lista: `/area_kpis?params`
- POST: `/area_kpis`
- PUT: `/area_kpis/{KPI}`
- DELETE: `/area_kpis/{KPI}`

### 2. Estructura de Respuesta GET Individual
**ANTES (múltiples formatos posibles):**
```typescript
// Podía venir envuelto en: AreaKPIResultData, AreaKPIDatas, AreaKPIs, etc.
```

**AHORA (formato directo):**
```json
{
  "KPI": 103,
  "Descripcion": "Desc1",
  "Categoria": "C",
  "CategoriaDescripcion": "Costo",
  "MetaActual": "333.00",
  "Direccion": 1,
  "Unidaddemedida": "EA",
  "UnidadMedidaDescripcion": "cada uno",
  "KPIActivo": true,
  "AreaId": "Almacen"
}
```

**Cambios necesarios:**
- Simplificar el parsing en `getKPIById()` para esperar un objeto directo
- Mantener fallbacks para compatibilidad
- Mapear `MetaActual` → `Meta` en el formulario

### 3. Estructura de Respuesta GET Lista
**AHORA:**
```json
{
  "AreaKPIDatas": [
    {
      "KPI": 103,
      "Descripcion": "Desc1",
      "Categoria": "C",
      "CategoriaDescripcion": "Costo",
      "MetaActual": "333.00",
      "Direccion": 1,
      "Unidaddemedida": "EA",
      "UnidadMedidaDescripcion": "cada uno",
      "KPIActivo": true,
      "AreaId": "Almacen"
    }
  ],
  "Count": 2
}
```

**Cambios necesarios:**
- El método `getAreaKPIs()` ya busca `AreaKPIDatas` como primera opción ✅
- Verificar que el formato de fecha sea correcto

### 4. Parámetros de Query para GET Lista
**ANTES:**
```
?Areaid={areaId}&Limit=100&Offset=0&consulta="{fecha}"
```

**AHORA:**
```
?Areaid={AreaActual}&Areakpiactivo=true&Limit=100&Offset=0&Consulta=yyyy-mm-dd HH:MM:SS
```

**Cambios necesarios:**
- ✅ Agregar parámetro `Areakpiactivo=true`
- ✅ Cambiar `consulta` → `Consulta` (mayúscula inicial)
- ✅ Remover comillas del valor de fecha

### 5. Payload POST (Insert)
**AHORA:**
```json
{
  "AreaKPIData": {
    "KPI": 0,
    "Descripcion": "Prueba2",
    "Categoria": "C",
    "MetaActual": 666,
    "Direccion": 1,
    "Unidaddemedida": "EA",
    "KPIActivo": true,
    "AreaId": "Almacen"
  }
}
```

**Cambios necesarios:**
- ✅ Incluir `KPI: 0` en el payload de INSERT
- ✅ Cambiar `Meta` → `MetaActual` en el payload
- ✅ Cambiar `Activo` → `KPIActivo` en el payload
- ✅ Asegurar que `MetaActual` sea número (no string)

### 6. Payload PUT (Update)
**AHORA:**
```json
{
  "AreaKPIData": {
    "KPI": 103,
    "Descripcion": "Desc1",
    "Categoria": "C",
    "MetaActual": 333,
    "Direccion": 1,
    "Unidaddemedida": "EA",
    "KPIActivo": true,
    "AreaId": "Almacen"
  }
}
```

**Cambios necesarios:**
- ✅ Incluir `KPI: {id}` en el payload de UPDATE
- ✅ Cambiar `Meta` → `MetaActual` en el payload
- ✅ Cambiar `Activo` → `KPIActivo` en el payload
- ✅ Asegurar que `MetaActual` sea número (no string)

### 7. Respuesta DELETE
**AHORA:**
```json
{
  "Messages": [
    {
      "Id": "SuccessfullyDeleted",
      "Type": 0,
      "Description": "Los datos han sido eliminados."
    }
  ]
}
```

**Estado actual:** Ya implementado correctamente ✅

---

## Tareas de Implementación

### Tarea 1: Actualizar `CatalogosKPI.ts`

#### 1.1 Actualizar interfaz `AreaKPIData`
```typescript
export interface AreaKPIData {
  KPI?: number;              // Agregar este campo
  Descripcion: string;
  Categoria: string;
  MetaActual: number;        // Cambiar de Meta → MetaActual
  Direccion: number;
  Unidaddemedida: string;
  AreaId: string;
  KPIActivo: boolean;        // Cambiar de Activo → KPIActivo
}
```

#### 1.2 Actualizar método `getAreaKPIs()`
- Agregar parámetro `Areakpiactivo=true`
- Cambiar `consulta` → `Consulta`
- Remover comillas del valor de fecha

**Antes:**
```typescript
const url = `${getKpiApiUrl()}?Areaid=${areaId}&Limit=100&Offset=0&consulta=${encodeURIComponent(`"${fechaStr}"`)}`;
```

**Después:**
```typescript
const url = `${getKpiApiUrl()}?Areaid=${areaId}&Areakpiactivo=true&Limit=100&Offset=0&Consulta=${encodeURIComponent(fechaStr)}`;
```

#### 1.3 Simplificar método `getKPIById()`
- Priorizar objeto directo como respuesta
- Mantener fallbacks para compatibilidad

**Lógica actualizada:**
1. Si es objeto directo con propiedades esperadas → usar directamente
2. Si es array → tomar primer elemento
3. Si tiene `AreaKPIDatas` → tomar primer elemento
4. Fallbacks adicionales

#### 1.4 Actualizar método `insertKPI()`
- Incluir `KPI: 0` en el payload
- Cambiar nombres de campos: `Meta` → `MetaActual`, `Activo` → `KPIActivo`

**Antes:**
```typescript
body: JSON.stringify({ AreaKPIData: preparedData })
```

**Después:**
```typescript
const payload = {
  KPI: 0,
  Descripcion: preparedData.Descripcion,
  Categoria: preparedData.Categoria,
  MetaActual: preparedData.Meta === 0 ? 0.0001 : preparedData.Meta,
  Direccion: preparedData.Direccion,
  Unidaddemedida: preparedData.Unidaddemedida,
  KPIActivo: preparedData.Activo,
  AreaId: preparedData.AreaId
};
body: JSON.stringify({ AreaKPIData: payload })
```

#### 1.5 Actualizar método `updateKPI()`
- Incluir `KPI: id` en el payload
- Cambiar nombres de campos: `Meta` → `MetaActual`, `Activo` → `KPIActivo`

**Después:**
```typescript
const payload = {
  KPI: Number(id),
  Descripcion: preparedData.Descripcion,
  Categoria: preparedData.Categoria,
  MetaActual: preparedData.Meta === 0 ? 0.0001 : preparedData.Meta,
  Direccion: preparedData.Direccion,
  Unidaddemedida: preparedData.Unidaddemedida,
  KPIActivo: preparedData.Activo,
  AreaId: preparedData.AreaId
};
body: JSON.stringify({ AreaKPIData: payload })
```

---

### Tarea 2: Actualizar `KPIManager.tsx`

#### 2.1 Mantener campos del formulario (sin cambios)
Los campos actuales ya son correctos:
- `descripcion` → `Descripcion`
- `categoria` → `Categoria`
- `meta` → `MetaActual`
- `direccion` → `Direccion`
- `unidaddemedida` → `Unidaddemedida`
- `activo` → `KPIActivo`

#### 2.2 Actualizar mapeo en `useEffect` (modo UPD)
**Línea 68 - Cambiar:**
```typescript
const meta = kpi.MetaActual || kpi.Meta || kpi.meta || '0';
```

**A:**
```typescript
const meta = kpi.MetaActual || '0';
```

#### 2.3 Verificar que el payload en `handleSubmit` use la interfaz actualizada
El servicio ya se encarga de la transformación, no se requieren cambios en el componente.

---

### Tarea 3: Verificar `AreasListManager.tsx`

#### 3.1 Revisar uso de `getAreaKPIs()`
- Verificar que el componente maneje correctamente la estructura `{ AreaKPIDatas: [], Count: n }`
- Verificar que acceda a las propiedades correctas: `KPI`, `MetaActual`, `KPIActivo`

---

### Tarea 4: Testing

#### 4.1 Probar operación GET (individual)
- Verificar que `getKPIById(103)` devuelva el objeto correcto
- Verificar que el formulario se llene correctamente en modo UPD

#### 4.2 Probar operación GET (lista)
- Verificar que `getAreaKPIs('Almacen')` devuelva el array correcto
- Verificar que los cards se rendericen correctamente

#### 4.3 Probar operación POST (insert)
- Crear un nuevo KPI
- Verificar que el payload incluya `KPI: 0`
- Verificar que se use `MetaActual` y `KPIActivo`

#### 4.4 Probar operación PUT (update)
- Editar un KPI existente
- Verificar que el payload incluya `KPI: {id}`
- Verificar que se use `MetaActual` y `KPIActivo`

#### 4.5 Probar operación DELETE
- Eliminar un KPI
- Verificar que la respuesta se valide correctamente

---

## Resumen de Archivos a Modificar

1. ✅ `src/services/CatalogosKPI.ts`
   - Actualizar interfaz `AreaKPIData`
   - Actualizar `getAreaKPIs()` (query params)
   - Simplificar `getKPIById()` (parsing)
   - Actualizar `insertKPI()` (payload)
   - Actualizar `updateKPI()` (payload)

2. ✅ `src/components/KPIManager.tsx`
   - Actualizar mapeo de `MetaActual` en modo UPD

3. ⚠️ `src/components/AreasListManager.tsx`
   - Verificar compatibilidad con nueva estructura de respuesta

---

## Notas Importantes

1. **Compatibilidad hacia atrás**: Mantener fallbacks en `getKPIById()` para soportar múltiples formatos de respuesta.

2. **Validación de datos**: Asegurar que `MetaActual` siempre sea un número en los payloads POST/PUT.

3. **Manejo de errores**: Mantener la lógica actual de manejo de errores y validación de respuestas.

4. **Formato de fecha**: El nuevo formato no usa comillas y tiene mayúscula inicial en `Consulta`.

5. **Campos del formulario**: No requieren cambios, la transformación se hace en el servicio.

---

## Criterios de Éxito

- ✅ GET individual devuelve y parsea correctamente el KPI
- ✅ GET lista devuelve y parsea correctamente el array de KPIs
- ✅ POST crea un nuevo KPI con el payload correcto
- ✅ PUT actualiza un KPI existente con el payload correcto
- ✅ DELETE elimina un KPI y valida la respuesta
- ✅ El formulario se llena correctamente en modo UPD
- ✅ Los cards se renderizan correctamente con los datos de la API
- ✅ No hay errores de consola relacionados con la estructura de datos
