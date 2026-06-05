# ==============================================================================
# SENIOR REACT FULLSTACK DEVCONTAINER - DOCKERFILE
# Node.js 22 LTS (Debian Bookworm) - Optimized for macOS/Intel/Apple Silicon
# ==============================================================================

FROM mcr.microsoft.com/devcontainers/javascript-node:22-bookworm

LABEL maintainer="Antigravity Senior Fullstack React AI"
LABEL project="KPI-PLANTA"
LABEL stack="React 19 + TypeScript + Tailwind v4 + Express Node.js"

# Avoid interactive prompts during apt installs
ENV DEBIAN_FRONTEND=noninteractive

# Install essential system utilities for senior debugging, performance monitoring & native compilation
RUN apt-get update && apt-get -y install --no-install-recommends \
    build-essential \
    curl \
    git \
    jq \
    htop \
    tree \
    vim \
    nano \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install premium global npm packages for advanced React / Node development
# pnpm: Ultra-fast package manager with strict dependency tree (highly recommended for senior workflows)
# rimraf: Native-speed node_modules / build directory cleaner
# npm-check-updates: Keeps dependencies updated cleanly (ncu -u)
RUN su node -c "npm install -g pnpm rimraf npm-check-updates ts-node tsx"

# Configure premium Zsh / Bash developer experience inside the container
# Adds high-productivity aliases and color optimizations
RUN echo '\n\
# --- Senior Fullstack React Developer Aliases ---\n\
alias ll="ls -laF --color=auto"\n\
alias la="ls -A"\n\
alias l="ls -CF"\n\
\n\
# Fast Node.js / NPM commands\n\
alias ni="npm install"\n\
alias nrd="npm run dev"\n\
alias nrb="npm run build"\n\
alias clean-node="rimraf node_modules package-lock.json && npm install"\n\
\n\
# PNPM commands\n\
alias pni="pnpm install"\n\
alias pnd="pnpm run dev"\n\
alias pnb="pnpm run build"\n\
alias clean-pnpm="rimraf node_modules pnpm-lock.yaml && pnpm install"\n\
\n\
# Git shortcuts\n\
alias gs="git status"\n\
alias gd="git diff"\n\
alias gl="git log --oneline -n 10"\n\
' >> /home/node/.zshrc \
  && echo '\n\
# --- Senior Fullstack React Developer Aliases ---\n\
alias ll="ls -laF --color=auto"\n\
alias la="ls -A"\n\
alias l="ls -CF"\n\
alias ni="npm install"\n\
alias nrd="npm run dev"\n\
alias nrb="npm run build"\n\
alias clean-node="rimraf node_modules package-lock.json && npm install"\n\
alias pni="pnpm install"\n\
alias pnd="pnpm run dev"\n\
alias pnb="pnpm run build"\n\
alias clean-pnpm="rimraf node_modules pnpm-lock.yaml && pnpm install"\n\
alias gs="git status"\n\
alias gd="git diff"\n\
alias gl="git log --oneline -n 10"\n\
' >> /home/node/.bashrc

# Set default shell to Zsh for a premium terminal experience
ENV SHELL=/bin/zsh
