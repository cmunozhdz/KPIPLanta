# Matriz de Pruebas: KPIManager

## 1. Requisitos de Negocio a Validar
- [x] El componente debe permitir la creación (`INS`) y edición (`UPD`) de un KPI.
- [x] Se deben cargar dinámicamente las categorías SQCDP y cargarse los datos del KPI en modo edición.
- [x] Debe existir un buscador autocompletable para la Unidad de Medida.
- [x] Debe evitar enviar el formulario si no hay meta o la unidad de medida no fue seleccionada de la lista válida.
- [x] Debe manejar correctamente estados de carga, errores de inicialización y errores al guardar.

## 2. Escenarios de Prueba (Matriz)

### 2.1. Renderizado y Carga Inicial
- [x] **Renderiza estado de carga**: Muestra el loader mientras obtiene catálogos.
- [x] **Modo INS**: Carga categorías, inicializa el formulario vacío (excepto valores por defecto como meta '0' y dirección 1).
- [x] **Modo UPD**: Llama a `getKPIById` y llena el formulario con los datos recibidos.
- [x] **Fail-over en Carga**: Si falla la llamada a `getCategoriasLista` o `getKPIById`, muestra pantalla de error con botón de reintentar.

### 2.2. Interacciones del Usuario (Caja Negra)
- [x] **Validación de campos obligatorios**: Evita llamar al servicio de guardado si la meta está vacía.
- [x] **Autocompletado de Unidad de Medida**:
  - [x] Escribir en el input de unidad dispara la búsqueda tras 400ms (`getUnidadMedidaLista`).
  - [x] Seleccionar una unidad del dropdown actualiza el input y marca la unidad como válida.
  - [x] Intentar guardar sin haber seleccionado una unidad del dropdown muestra un mensaje de error.

### 2.3. Acciones de Guardado
- [x] **Modo INS Exitoso**: Al llenar los datos válidos y dar "Crear KPI", llama a `insertKPI` con el payload correcto y ejecuta `onSaved`.
- [x] **Modo UPD Exitoso**: Al modificar datos y dar "Guardar Cambios", llama a `updateKPI` con el ID y payload correctos, y ejecuta `onSaved`.
- [x] **Fail-over en Guardado (Error 500)**: Si el servicio `insertKPI` o `updateKPI` rechaza la promesa, el componente captura el error y lo muestra en pantalla sin romperse.

### 2.4. Comportamientos Auxiliares
- [x] **Botón Cerrar**: Al presionar el botón "X" o el overlay de fondo, se ejecuta la prop `onClose`.
- [x] **Reintento**: En caso de error de carga inicial, presionar "Reintentar" vuelve a llamar a las APIs de inicialización.

