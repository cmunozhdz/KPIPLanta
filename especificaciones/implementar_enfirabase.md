# Guía de Publicación en Firebase Hosting

Este documento detalla los pasos necesarios para publicar el contenido de la carpeta `dist` (generada por Vite u otro bundler) en Firebase Hosting.

## Resumen del proceso

1. **Instalación de Firebase CLI**: Asegurarse de tener las herramientas de Firebase.
2. **Autenticación**: Iniciar sesión en Firebase desde la terminal.
3. **Cambio de Proyecto (Nuevo)**: Cómo desvincular el proyecto anterior y elegir uno nuevo.
4. **Inicialización**: Configurar el proyecto para que reconozca `dist` como la carpeta pública.
5. **Despliegue**: Subir los archivos a los servidores de Firebase.

## Pasos detallados

### 1. Preparación del Entorno

Si aún no tienes las herramientas de Firebase instaladas globalmente, ejecutas:
```bash
npm install -g firebase-tools
```

Luego, inicia sesión:
```bash
firebase login
```

### 2. Cambio a un Proyecto Nuevo

Como ya tienes un proyecto configurado (`checador-ad427`), para cambiar a uno nuevo debes usar el siguiente comando:

```bash
firebase use --add
```
Esto te permitirá seleccionar un proyecto de tu lista de Firebase y darle un alias (por ejemplo, `default` o `produccion`).

Si prefieres sobrescribir la configuración actual directamente:
```bash
firebase init hosting
```
*(Firebase detectará que ya existe una configuración y te preguntará si quieres usar un proyecto existente o crear uno nuevo)*.

### 3. Configuración del Proyecto

En la raíz de tu proyecto, ejecuta el comando de inicialización:
```bash
firebase init hosting
```

Durante la configuración inicial, Firebase te hará un par de preguntas clave:

*   **What do you want to use as your public directory?**
    > **IMPORTANTE**: Escribe `dist` (que es donde Vite genera los archivos).
*   **Configure as a single-page app (rewrite all urls to /index.html)?**
    > Responde `Yes` (si estás usando React/Vite con rutas).
*   **Set up automatic builds and deploys with GitHub?**
    > Responde `No` por ahora (a menos que quieras CI/CD).

### 3. Generación y Despliegue

Cada vez que quieras publicar cambios:

1.  Genera la carpeta `dist` actualizada:
    ```bash
    npm run build
    ```
2.  Sube los archivos:
    ```bash
    firebase deploy
    ```

## Verificación

Al finalizar el comando `firebase deploy`, recibirás una **Hosting URL**. Puedes abrirla en tu navegador para ver tu aplicación en vivo.

---

> [!TIP]
> Si deseas que yo realice estos pasos por ti (como verificar si tienes Firebase instalado o ayudarte con la configuración inicial), házmelo saber.
