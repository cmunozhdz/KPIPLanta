# Matriz de Pruebas: KPIDetailsModal (Eliminación de Histórico)

## 1. Requisitos de Negocio a Validar
- [x] El botón de eliminación (bote de basura) solo debe mostrarse a usuarios con perfil de administrador (`isAdmin === true`).
- [x] Al hacer clic en el botón de eliminar, debe mostrarse un modal de confirmación describiendo el registro a eliminar.
- [x] Si el usuario cancela en el modal de confirmación, no se debe realizar ninguna petición de eliminación.
- [x] Si el usuario confirma en el modal de confirmación, se debe invocar a `deleteHistorico` del servicio `kpiHistoricoService` con el ID del registro histórico.
- [x] Tras una eliminación exitosa, se debe invocar `getKpiHistoricoRango` para refrescar los datos en pantalla y mostrar una alerta temporal.
- [x] En caso de fallo en el servicio de eliminación (Fail-over, error 500 / red), la UI debe capturar el error y mostrar un toast sin romperse, manteniendo la tabla y el modal funcionales.

## 2. Escenarios de Prueba (Matriz)

### 2.1. Permisos e Interfaz (Admin vs No Admin)
- [x] **No Admin**: Si `isAdmin` es falso o no se pasa, no se renderiza la columna de acciones ni el botón de eliminar.
- [x] **Admin**: Si `isAdmin` es verdadero, se renderiza la columna de acciones con el botón de bote de basura (`bi-trash`) y el tooltip `title="Eliminar registro"`.

### 2.2. Flujo de Confirmación
- [x] **Apertura del Modal**: Al dar clic en el botón de eliminar, se abre el modal de confirmación mostrando el periodo y valor correcto del registro.
- [x] **Cancelación**: Al dar clic en "Cancelar" o en el backdrop del modal de confirmación, este se cierra sin llamar al servicio.
- [x] **Carga al eliminar**: El botón "Confirmar" cambia a un estado deshabilitado e indica "Eliminando..." mientras la petición está en progreso.

### 2.3. Acciones del Backend y Refresco
- [x] **Happy Path (Eliminación exitosa)**: Tras dar "Confirmar", se llama a `deleteHistorico` con el ID correcto, se muestra el toast "Los datos han sido eliminados." y se invoca la actualización del historial.
- [x] **Fail-over (Servicio cae / error 500)**: Si `deleteHistorico` falla, se mantiene el modal o se cierra adecuadamente reportando el error en el toast, y el componente continúa operando normalmente.
