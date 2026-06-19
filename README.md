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
##Despliege
** Intrucciones de despliege en servidor cdd **
1.- Transpilar el proyecto 
    npm run build 
2.- Copiar la carpeta dist a e:\Aplicaciones\kpiplanta\ en el servidor 
    scp /ruta/local/del/archivo.txt usuario@192.168.1.50:/ruta/especifica/en/el/servidor/Donde:/ruta/local/del/archivo.txt: Es la ubicación exacta de tu archivo en tu computadora.usuario: Tu nombre de usuario con el que ingresas al servidor.192.168.1.50: La dirección IP o dominio de tu servidor remoto.:: Es obligatorio para separar la dirección del servidor de la ruta de destino./ruta/especifica/en/el/servidor/: El directorio exacto donde deseas guardar el archivo.
scp  /workspaces/TableroPlanta/dist/readme.txt ctessh@192.168.2.220:"e:/Aplicaciones/kpiplanta/"

copiar carpeta orgien a una remota

scp -r /workspaces/TableroPlanta/dist/* ctessh@192.168.2.220:"e:/Aplicaciones/kpiplanta/"
