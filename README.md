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


### Implementacion de agntes para pruebas unitarias



#### Para ejecutar las pruebas unitarias de TypeScript/React:

    Cada vez que abras un componente nuevo, invoca al agente diciendo: 
    "Genera la estrategia de pruebas para este componente".

El agente te devolverá primero el archivo .test-report.md para validar los escenarios antes de escribir una sola línea del .test.tsx.