---
trigger: always_on
---

# [REGLA DE SISTEMA: ESTRUCTURA CRUD Y MANAGERS EN TYPESCRIPT]

@.agents/rules/webdesigner.md

Cuando se solicite un componente principal de gestión/CRUD (ej. `AreasManager.tsx`, `UsersManager.tsx`, `KpisManager.tsx`), debes generar un componente TypeScript React (`.tsx`) aplicando las siguientes normas:

## 1. Tipado Mandatorio (TypeScript)
- Define siempre las interfaces de la entidad (ej. `export interface AreaData { ... }`).
- Define las props del componente si interactúa con modales o controladores (ej. `export interface ManagerProps { ... }`).
- Tipa explícitamente los eventos (`React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent`).

## 2. Encabezado del Manager (Navbar Interno)
- **Contenedor:** `flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm`
- **Título:** `text-2xl font-bold uppercase tracking-tight text-slate-900`
- **Subtítulo:** `text-sm text-slate-500 mt-1` (resumen/explicación de la función del módulo).
- **Botón Agregar (Derecha):** 
  - Clase: `bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2`
  - Estructura: `"Agregar [Entidad] +"` o con icono `<i class="bi bi-plus-lg"></i>` / `<i class="fa-solid fa-plus"></i>` al final.

## 3. Barra de Filtro y Búsqueda Rápida
- **Contenedor:** `flex items-center justify-between gap-4 mt-6`
- **Input de Búsqueda:**
  - Clase: `w-full max-w-md bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] shadow-sm`
  - Icono de Lupa: Posicionado a la izquierda con `absolute left-3.5`.
  - Placeholder: `"Buscar [recurso en plural]..."` (ej. `"Buscar áreas de producción..."`).

## 4. Tabla de Datos & Botones de Acción
- **Contenedor Tabla:** `bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-4`
- **Headers (`<thead>`):** `bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider py-3.5 px-6 text-left`
- **Filas (`<tbody>`):** `border-b border-slate-100 hover:bg-slate-50/50 transition-colors py-4 px-6 text-sm text-slate-700`
- **Acciones (Primeras dos Columnas Centrada):**
  - **Botón Modificar:** `<button title="Modificar" className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"><i className="bi bi-pencil-square text-base"></i></button>`
  - **Botón Eliminar:** `<button title="Eliminar" className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><i className="bi bi-trash text-base"></i></button>`