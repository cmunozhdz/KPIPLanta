# [Choice] Node.js version (use -bookworm, -bullseye, -buster on local arm64/Apple Silicon): 20, 18, 16

FROM mcr.microsoft.com/devcontainers/javascript-node:22
LABEL key="TableroPlanta"

# Directorio de trabajo dentro del contenedor
WORKDIR /workspaces/TableroPlanta

# ... (tus otras configuraciones del Dockerfile) ...

# CRÍTICO: Indica a Docker que esta carpeta es un volumen aislado
VOLUME [ "/workspaces/TableroPlanta/node_modules" ]

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install more global node packages
# RUN su node -c "npm install -g <your-package-list-here>"