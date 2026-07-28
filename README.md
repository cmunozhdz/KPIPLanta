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
