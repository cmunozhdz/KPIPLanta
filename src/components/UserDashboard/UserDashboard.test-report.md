# 📋 Reporte de Validación: UserDashboard

**Descripción:** Panel que consume datos del usuario y maneja estados de carga y errores de red.

## 🔹 Checklist de Casos de Prueba
- [ ] **CP-001 (Happy Path):** Renderiza el spinner de carga inicial.
- [ ] **CP-002 (Happy Path):** Muestra correctamente el nombre y correo del usuario tras resolver la API.
- [ ] **CP-003 (Fail-over):** Ante un error 500 de la API, oculta el spinner y muestra un mensaje de contingencia: *"Servicio temporalmente no disponible"*.
- [ ] **CP-004 (Edge Case):** Datos de entrada vacíos o corruptos no rompen la interfaz.

## ⚙️ Especificación de Mocks
- **API Endpoint:** `/api/v1/user`
- **Payload Válido:** `{ id: 1, name: "Carlos", email: "cmunoz@dev.com" }`
- **Payload Inválido/Fail-over:** `HTTP 500 Internal Server Error` o `Network Error`