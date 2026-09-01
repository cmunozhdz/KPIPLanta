<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e2c366fb-8eea-47f2-8cde-63d0977369a3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Depliege en servidor cdd

     
1.- Crear archivo /public/web.config con el siguiente contenido  para controlar las rutas  y se vayan a /KPIPlanta/index.html

<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA fallback routing" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/KPIPlanta/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
     
    </staticContent>
  </system.webServer>
</configuration>
    
2.- Transpilar el proyecto 
    `npm run build`


3.- Copiar la carpeta dist a e:\Aplicaciones\kpiplanta\ en el servidor 
scp -r /workspaces/TableroPlanta/dist/* ctessh@192.168.2.220:"e:/Aplicaciones/kpiplanta/"

**otros ejemplo de uso scp**
### a) Copiar archivo local a una remota
    scp /ruta/local/del/archivo.txt usuario@192.168.1.50:/ruta/especifica/en/el/servidor/

    ejemplo:
scp  /workspaces/TableroPlanta/dist/readme.txt ctessh@192.168.2.220:"e:/Aplicaciones/kpiplanta/"
### b) Copiar carpeta local a una remota
    scp -r /ruta/local/carpeta usuario@ip:/ruta/remota

    ejemplo:
    scp -r /workspaces/TableroPlanta/dist/* ctessh@192.168.2.220:"e:/Aplicaciones/kpiplanta/"


### Implementación de Agentes y Skills para Pruebas Unitarias

#### Skill a Demanda: `react-test-architect`

Las pruebas unitarias y de componentes se gestionan mediante la **Skill `react-test-architect`**, la cual se ejecuta **únicamente a demanda** para evitar ejecuciones automáticas continuas al editar componentes.

#### ¿Cómo invocar la Skill?
Para crear o ejecutar pruebas automáticas con Vitest y React Testing Library, solicita explícitamente en el chat:

- `"Usa la skill react-test-architect para generar los tests del componente PackagingLinesManager"`
- `"Genera y ejecuta las pruebas unitarias para el componente UsersManager"`
- `"Ejecuta los tests de Vitest para el módulo de áreas"`

La skill se encargará de inspeccionar el componente `.tsx`, generar la suite `.test.tsx` bajo el patrón AAA (Arrange-Act-Assert) y ejecutar `npx vitest run` en la terminal bash hasta verificar el resultado `PASS`.

---

# 🤖 Guía de Uso del Agente CRUD Manager (`crud-manager.md`)

Esta guía describe cómo cualquier usuario o desarrollador puede interactuar con el agente de IA para generar nuevos módulos de gestión y CRUDs siguiendo la arquitectura de software y el sistema de diseño visual del proyecto **KPI Planta Polak**.

## 1. ¿Cómo Funciona el Sistema de Agentes?

El proyecto cuenta con reglas de sistema preconfiguradas en `.agents/rules/`:
- **`crud-manager.md`**: Define la estructura visual y de componentes para las vistas de gestión CRUD (encabezado, botón de agregar, barra de búsqueda rápida y tabla de datos con acciones).
- **`react-architect.md`**: Establece la jerarquía estricta de carpetas dentro de `src/features/[modulo]/`.
- **`webdesigner.md`**: Define los tokens de color de Tailwind CSS (`#2563EB`, `#F8FAFC`, bordes `slate-200`, badges de estado y redondeado `rounded-3xl` / `rounded-2xl`).

---

## 2. Cómo Solicitar un Nuevo Módulo CRUD

Para que el agente genere un nuevo módulo completo, simplemente solicita en el chat la creación del recurso indicando el nombre de la entidad.

### 💡 Prompts de Ejemplo

**Ejemplo Básico:**
> *"Hola Agente. Siguiendo las reglas de .agents/rules/ (crud-manager.md), crea el módulo completo CRUD para Turnos de Trabajo."*

**Ejemplo Específico:**
> *"Hola Agente. Crea el módulo CRUD para Líneas de Empaque siguiendo crud-manager.md y webdesigner.md. Genera los archivos linea-empaque.types.ts (con id, codigo, nombre, estado) y PackagingLinesManager.tsx."*
>* "Hola Agente. Crea el modulo CRUD para turnos de trabajo siguiendo crud-manager.md y webdesigner.md. Genera los archivos turno-trabajo.types.ts (con id, codigo, nombre, estado) y TurnoTrabajoManager.tsx.", los servicios lo va a definir otro agente
---

## 3. Estructura de Archivos Generada

Al ejecutar la orden, el agente creará automáticamente los siguientes archivos respetando la arquitectura modular:

```text
src/features/[modulo]/
├── types/
│   └── [modulo].types.ts       <-- Interfaz TypeScript (ej. LineaEmpaqueData)
├── components/
│   └── [Modulo]FormModal.tsx   <-- Componentes modales o auxiliares (opcional)
└── [Nombre]Manager.tsx          <-- Componente CRUD principal (ej. PackagingLinesManager.tsx)
```

---

## 4. Estándar Anatómico del Componente Manager (`.tsx`)

Cualquier componente generado por `crud-manager.md` incluye obligatoriamente:

1. **Encabezado (Navbar Interno):**
   - Título en mayúsculas (`text-2xl font-bold text-slate-900`).
   - Descripción o subtítulo funcional (`text-sm text-slate-500 mt-1`).
   - Botón azul de agregar posicionado a la derecha (`bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl flex items-center gap-2`).

2. **Barra de Búsqueda Rápida:**
   - Input filtrable en tiempo real (`w-full max-w-md`) con icono de lupa a la izquierda (`bi bi-search`).

3. **Tabla de Datos & Botones de Acción en Primeras Columnas:**
   - **Columna 1 (Centrada):** Botón **Modificar** (`<button title="Modificar"><i className="bi bi-pencil-square"></i></button>`).
   - **Columna 2 (Centrada):** Botón **Eliminar** (`<button title="Eliminar"><i className="bi bi-trash"></i></button>`).
   - **Columnas Siguientes:** Datos del registro (ej. Código, Nombre) y Badges de estado (`Activo` en verde / `Inactivo` en gris).

4. **Modal Interactivo de Formulario:**
   - Modal pop-up con fondo difuminado para agregar o editar registros con validación tipada.

---

## 5. Pasos para Probar e Integrar

1. Importa el componente `[Nombre]Manager` dentro de `src/App.tsx` o en la sección correspondiente de navegación.
2. Corre el servidor local para verificar el renderizado:
   ```bash
   npm run dev
   ```
3. Comprueba que la tabla filtre, permita agregar registros y ejecute las acciones de edición y eliminación.

---



#Ajustes post productivo

1.- En el icono de inicio colocar el siguiente icono y al darle click a este icono
nos lleve siempre al inicio.

2.- Accesibilidad; restringir a los ADM únicamente a su área, ya que
actualmente los ADM pueden entrar a todas las áreas y dejar un permiso
como “super adm” que tenga acceso a todas las áreas, este super adm solo
es para (Clemente, Fernando y un servidor).

3.- Hasta el momento solo hay un indicador que se reportara de manera
mensual y este es el de adherencia al presupuesto, configurar para que se
reporte mensualmente.

4.- En la ventana de registrar el dato del indicador tener la opción de poder
mover la semana sin tener que hacerlo desde el inicio, directamente en la
ventana donde se vacía la información.

5.-Se podrá desplegar el menú de unidades en el recuadro para crear
indicadores.

6.-Activar la opción de que al tener 5 tendencias de incumplimiento de aviso
de generar un A3 para determinar la causa raíz y activar un botón para
subir el formato, también que mande un pop up o mensaje de que el área
tiene un A3 pendiente.

 7.-Se podrá ligar al elegir el mes las semanas que le corresponden, ya que
actualmente se elige el mes, pero no cambia nada.

 8.-Al visualizar la tendencia se podrá agregar botones que muestre periodos
de tiempo como semanal y mensual.

9.- En el menú inicial hay algunos botones que no tienen actividad, nos
podríamos quedar con el de manual de usuario para subir la capacitación y
el de Soporte IT para que mande directo a un contacto con ustedes o
generar un ticket, los otros los podríamos quitar.

10.- Se podrá activar la función de importar datos de manera masiva donde se
tenga el témplate para llenar un indicador y poderlo subir de manera
retroactiva.

11.-El % de cumplimiento no coincide entre el resumen y el icono del área, en
teoría debieran coincidir.

12.- Se podrá manipular la escala de la grafica ya que de 25 en 25 el intervalo
es grande y no se logra percibir una diferencia significativa por ejemplo que
la escala sea de 5 en 5.
