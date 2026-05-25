# Guía de Despliegue para Tablero Planta (IIS)

Este documento describe los pasos necesarios y la configuración requerida para desplegar la aplicación React (Vite) en el servidor de Internet Information Services (IIS) bajo la ruta específica: `https://cdd.polakgrupo.com/KPIPlanta`.

## 1. Configuraciones Previas (Ya realizadas en el código)

Para que la aplicación funcione correctamente como una Single Page Application (SPA) en un subdirectorio, se realizaron las siguientes configuraciones:

1. **`vite.config.ts`**: Se agregó la propiedad `base: '/KPIPlanta/'` para garantizar que los recursos estáticos (JavaScript, CSS, imágenes) se soliciten utilizando rutas relativas correctas desde el subdirectorio y no desde la raíz (`/`).
2. **`public/web.config`**: Se incluyó un archivo de configuración nativo de IIS para:
   * Redirigir el enrutamiento del lado del cliente a `index.html` (evita errores 404 al recargar la página).
   * Definir correctamente los tipos MIME para fuentes y archivos `.json`.
   * Proveer cabeceras de seguridad básicas.

## 2. Pasos para Compilar la Aplicación (Equipo de Desarrollo)

Antes de mover el código al servidor, es necesario empaquetar la aplicación en su versión optimizada de producción:

1. Abrir la terminal en la raíz del proyecto.
2. Ejecutar el comando:
   ```bash
   npm run build
   ```
3. Esto generará una carpeta llamada `dist/` que contiene todos los archivos listos para producción (`index.html`, `web.config`, y la carpeta `assets/`).

## 3. Pasos para Desplegar en el Servidor (Equipo de Infraestructura / TI)

1. **Verificar Prerrequisitos de IIS**:
   * Asegurarse de que el servidor IIS tenga instalado el módulo **URL Rewrite** de Microsoft. Sin este módulo, el archivo `web.config` fallará y arrojará un *Error 500*.
   
2. **Crear el Directorio Base**:
   * En el servidor donde se hospeda `cdd.polakgrupo.com`, ubicar la raíz del sitio.
   * Crear una subcarpeta física llamada `KPIPlanta` (o configurar una Aplicación IIS apuntando a dicha ruta).

3. **Copiar Archivos**:
   * Copiar **todo el contenido** que se generó dentro de la carpeta local `dist/` y pegarlo dentro de la carpeta `KPIPlanta` en el servidor IIS.

## 4. Comunicación a Usuarios Finales

Una vez completado el despliegue de manera exitosa, puedes utilizar el siguiente formato para comunicar a los usuarios de la planta:

> **Acceso al Tablero de KPI Planta**
> 
> Hola equipo,
> 
> Ya se encuentra disponible el nuevo tablero de indicadores. Para consultar el estado actual del desempeño de los pilares WCM y las métricas de la planta, por favor ingresen desde su navegador web (recomendamos Google Chrome o Microsoft Edge) al siguiente enlace:
> 
> 🔗 **[https://cdd.polakgrupo.com/KPIPlanta](https://cdd.polakgrupo.com/KPIPlanta)**
> 
> Podrán visualizar el panorama global de la planta e interactuar con los datos de las diferentes áreas.
