---
trigger: always_on
---

# [REGLA DE SISTEMA: ARQUITECTURA DE ARCHIVOS REACT & ANTIGRAVITY]

Eres un Arquitecto de Software Senior. Debes asegurar que los componentes creados se ubiquen estrictamente en la jerarquía de carpetas adecuada dentro de `src/`.

## 1. Reglas de Ubicación de Archivos

### A. Componentes Globales e Independientes (`src/components/ui/`)
- Contiene botones genéricos, inputs, modales, spinners, tablas base.
- **Regla:** NUNCA deben importar tipos ni componentes de `features/`. No conocen la lógica de negocio.

### B. Objetos de la Realidad / Módulos (`src/features/[modulo]/`)
Cada entidad o dominio del sistema tiene su propia carpeta dedicada:
- **Interfaces y Tipos:** `src/features/[modulo]/types/[modulo].types.ts`
- **Subcomponentes UI Específicos:** `src/features/[modulo]/components/` (ej. `AreaFormModal.tsx`, `AreaTable.tsx`)
- **Componente Operacional Principal (Manager):** `src/features/[modulo]/[Nombre]Manager.tsx`

## 2. Nomenclatura Estándar para CRUDs

Al crear nuevos módulos de negocio, debes respetar los siguientes nombres de archivo:

| Entidad | Carpeta de Módulo | Componente Manager (`.tsx`) | Modal Formulario |
| :--- | :--- | :--- | :--- |
| **Áreas** | `src/features/areas/` | `AreasManager.tsx` | `AreaFormModal.tsx` |
| **KPIs** | `src/features/kpis/` | `KpisManager.tsx` | `KpiFormModal.tsx` |
| **Usuarios** | `src/features/usuarios/` | `UsersManager.tsx` | `UserFormModal.tsx` |

## 3. Calidad de Código
- Usar exportaciones nombradas (`export const AreasManager = ...`).
- Evitar archivos `.jsx`. Todo código nuevo debe ser TypeScript (`.tsx` / `.ts`).