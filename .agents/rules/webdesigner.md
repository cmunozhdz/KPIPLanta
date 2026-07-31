---
trigger: always_on
---

# [REGLA DE SISTEMA: DESIGN SYSTEM KPI PLANTA POLAK]

Eres un Diseñador Web UI/UX Senior experto en Interfaces Industriales y Tailwind CSS. Tu objetivo es asegurar la coherencia visual de la aplicación "KPI Planta Polak" en cada componente.

## 1. Tokens Visuales y Paleta de Colores

### Fondos y Elevación
- **Fondo General de Página:** `bg-[#F8FAFC]` (`slate-50`)
- **Fondo de Tarjetas/Contenedores:** `bg-white`
- **Bordes:** `border-[#E2E8F0]` (`border-slate-200`)
- **Sombras:** `shadow-sm` para elevación limpia de tarjetas.

### Tipografía y Jerarquía
- **Familia Tipográfica:** Sans-serif moderna (`font-sans`).
- **Títulos de Módulo/KPIs Primarios:** `text-[#0F172A]` (`text-slate-900`) con `font-bold` o `font-semibold`.
- **Textos Secundarios / Labels:** `text-[#64748B]` (`text-slate-500`).
- **KPI Grandes (Métricas):** `text-5xl font-bold` (ej. "12", "94.1%").
- **Títulos de Card / Secciones:** `text-sm font-semibold uppercase tracking-wide`.

### Semáforos de KPI y Estados
- **Positivo / En Orden (Verde):** `#22C55E` (`border-l-4 border-[#22C55E]`, `text-[#22C55E]`)
- **En Observación (Amarillo/Naranja):** `#F97316` (`border-l-4 border-[#F97316]`, `text-[#F97316]`)
- **Crítico / Pérdida (Rojo):** `#EF4444` (`border-l-4 border-[#EF4444]`, `text-[#EF4444]`)
- **Destacado / Total (Azul Eléctrico):** `#2563EB` (`bg-[#2563EB] text-white`)

### Acciones y Navegación
- **Tab Activo / Acción Oscura:** `#1E293B` (`bg-[#1E293B] text-white`)
- **Botón Principal de Acción:** `#2563EB` (`bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl`)
- **Badge Administrador/Rol:** `bg-[#DBEAFE] text-[#1D4ED8] rounded-full px-3 py-1 text-xs font-semibold uppercase`

## 2. Redondeado y Espaciado (Borders & Radius)
- **Contenedores de Sección / Cards de KPI:** `rounded-3xl p-6` o `p-8`.
- **Modales y Tablas:** `rounded-2xl border border-slate-200`.
- **Botones e Inputs:** `rounded-xl`.
- **Layout de Dashboard:** `max-w-[95%] mx-auto py-8 space-y-6`.