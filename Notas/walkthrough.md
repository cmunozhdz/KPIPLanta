# Walkthrough: Agente de Pruebas React con Vitest & RTL

Este documento sirve como referencia rápida del funcionamiento y la configuración del **Agente de Pruebas (Test Architect Agent)** y la suite de pruebas unitarias/componentes con **Vitest** y **React Testing Library** en el proyecto.

---

## 1. Regla del Agente de Pruebas (`.agents/rules/React-TestArchitect-Agent.md`)

Ubicada en: [React-TestArchitect-Agent.md](file:///workspaces/TableroPlanta/.agents/rules/React-TestArchitect-Agent.md)

### Principios Fundamentales:
* **Ubicación Co-localizada:** Cada componente tiene su test a un lado (`[Nombre].tsx` -> `[Nombre].test.tsx`).
* **Patrón AAA (Arrange-Act-Assert):** Estructuración clara de cada test unitario.
* **Mocks aislados:** Limpieza automática en `beforeEach(() => vi.clearAllMocks())`.
* **Consultas por Roles ARIA:** Uso de `screen.getByRole`, `screen.getByText`, `screen.getByPlaceholderText` para probar desde la perspectiva del usuario.
* **Matriz de Pruebas Obligatoria:**
  1. Happy Path (render inicial, títulos, botones).
  2. Búsqueda y Filtros en tiempo real.
  3. Modales y formularios de interacción.
  4. Resiliencia / Fail-over (mensajes de sin resultados o estados nulos).

---

## 2. Archivos de Configuración del Entorno

* **Configuración de Vitest:** Integrada en [vite.config.ts](file:///workspaces/TableroPlanta/vite.config.ts) con `globals: true` y `environment: 'jsdom'`.
* **Setup de Matchers:** [src/setupTests.ts](file:///workspaces/TableroPlanta/src/setupTests.ts)
  * Importa `@testing-library/jest-dom` para matchers extendidos como `toBeInTheDocument()`.
* **Comandos en package.json:** [package.json](file:///workspaces/TableroPlanta/package.json)
  * Script de prueba: `"test": "vitest run"`.

---

## 3. Ejemplo de Implementación de Referencia

Ubicación: [PackagingLinesManager.test.tsx](file:///workspaces/TableroPlanta/src/features/lineaempaque/PackagingLinesManager.test.tsx)

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PackagingLinesManager } from './PackagingLinesManager';

describe('PackagingLinesManager', () => {
  it('debe renderizar el título del módulo y la tabla inicial', () => {
    render(<PackagingLinesManager />);
    expect(screen.getByRole('heading', { name: /líneas de empaque/i })).toBeInTheDocument();
  });

  it('debe filtrar registros al escribir en el buscador', async () => {
    render(<PackagingLinesManager />);
    const searchInput = screen.getByPlaceholderText(/buscar líneas de empaque/i);
    await userEvent.type(searchInput, 'Alfa');
    expect(screen.getByText('Línea de Prueba Alfa')).toBeInTheDocument();
  });
});
```

---

## 4. Comandos de Ejecución

```bash
# Ejecutar todas las pruebas del proyecto (Vitest)
npm test

# Ejecutar una prueba específica
npx vitest run src/features/lineaempaque/PackagingLinesManager.test.tsx
```
