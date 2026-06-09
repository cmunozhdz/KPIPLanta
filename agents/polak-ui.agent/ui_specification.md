# Especificación de UI: Pantalla de Login - Polak Grupo

## 🎨 Tokens de Diseño (Design Tokens)
* **Colores:**
  * Fondo General (Body): `#5E5F61` (Gris medio corporativo)
  * Fondo Tarjeta Izquierda / Logo: `#FFFFFF` (Blanco puro)
  * Fondo Tarjeta Derecha / Botón Principal: `#FF152B` (Rojo vibrante Polak)
  * Bordes de Inputs / Botón Google: `#E5E7EB` (Gris claro / slate-200)
  * Texto Principal: `#111827` (Gris muy oscuro / slate-900)
  * Texto Secundario / Placeholders: `#6B7280` (Gris mutado / slate-500)
* **Bordes (Border Radius):**
  * Tarjeta Principal y Botones: `rounded-[32px]` (Esquinas muy redondeadas tipo píldora)
  * Inputs: `rounded-full` o `rounded-[24px]`
* **Sombras (Box Shadows):**
  * Tarjeta central: `shadow-2xl`
  * Botón iniciar sesión: `shadow-md shadow-red-500/20`

## 🧱 Arquitectura del Layout (Estructura de Componentes)

### 1. Contenedor Principal (`<div className="flex h-screen w-screen bg-[#5E5F61]... ">`)
* **Lado Izquierdo (35% - 40% ancho visible):** Fondo blanco. Contiene centrado vertical y horizontalmente el logotipo completo de **Polak grupo**.
* **Lado Derecho (60% - 65% ancho visible):** Fondo gris `#5E5F61`. Contiene centrada la tarjeta de login.

### 2. Tarjeta Central (`Card`)
* Un contenedor con `grid grid-cols-1 md:grid-cols-2`, fondo blanco, esquinas `rounded-[32px]` y sombra profunda.
* **Columna Formulario (Blanca):**
  * Título: "Inicio Sesión" con `font-bold text-2xl text-[#111827]`.
  * Botón Google: Borde gris claro, texto "Continuar con Google", icono oficial a la izquierda.
  * Inputs: Campos estilizados para "Correo" y "Contraseña" (este último con el botón de ojo a la derecha).
  * Botón: "Iniciar sesión" en fondo rojo `#FF152B`, texto blanco, centrado.
* **Columna Bienvenida (Roja):**
  * Fondo `#FF152B`. Esquinas derechas redondeadas (`rounded-r-[32px]`).
  * Título: "Bienvenido" en `text-white font-bold text-3xl`.
  * Subtítulo: Texto corporativo en blanco con alta legibilidad.
  * Botón: "Registrarse" con estilo de píldora, fondo blanco, texto rojo.