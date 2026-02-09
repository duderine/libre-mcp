# --- ESTÁGIO 1: BUILD DO FRONTEND E AGENTS ---
FROM node:20-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ git && rm -rf /var/lib/apt/lists/*

COPY . .

# Build do LibreChat (está em dev/librechat segundo seu YML)
RUN cd dev/librechat && npm install && npm run frontend

# Build do Agents package
RUN cd dev/agents && npm install && npm run build

# Build de TODOS os MCPs listados (Varre packages e dev)
# Isso garante que o index.js de cada um seja gerado
RUN for dir in packages/mcp-* dev/*mcp*; do \
      if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then \
        echo "Building $dir..."; \
        cd /app/$dir && npm install && npm run build || true; \
        cd /app; \
      fi \
    done

# --- ESTÁGIO 2: IMAGEM FINAL ---
FROM node:20-slim
WORKDIR /app

# Instala dependências de execução para os MCPs
RUN apt-get update && apt-get install -y python3 python3-pip curl git ffmpeg && rm -rf /var/lib/apt/lists/*

# Copia tudo o que foi buildado
COPY --from=builder /app /app

ENV HOST=0.0.0.0
ENV PORT=3080
ENV NODE_ENV=production

EXPOSE 3080

# Comando para rodar o backend do LibreChat
CMD ["npm", "run", "backend", "--prefix", "dev/librechat"]
