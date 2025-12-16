# Docker Compose

This project uses separate compose files for LibreChat, OpenWebUI, and Firecrawl, all running against OpenRouter.

## Setup

1. Copy env template: `cp env.example .env`
2. Set required API keys:
   - `OPENROUTER_API_KEY` (required)
   - `JINA_API_KEY` (required for reranking - get free key at https://jina.ai/)
3. For local development, other defaults can be kept as-is. For production, adjust all secrets and credentials.

## Start services

- OpenWebUI: `docker compose -f docker-compose.openwebui.yml up -d`
- LibreChat: `docker compose -f docker-compose.librechat.yml up -d`
- Firecrawl: `docker compose -f docker-compose.firecrawl.yml up -d`
- All together: `docker compose -f docker-compose.openwebui.yml -f docker-compose.librechat.yml -f docker-compose.firecrawl.yml up -d`

Dependencies start automatically (Mongo/Redis for LibreChat, PostgreSQL/Redis for Firecrawl).

## Data and ports

- OpenWebUI: `./volumes/openwebui`, port `3001`
- LibreChat: Mongo + Redis volumes, port `3002`
- Firecrawl: PostgreSQL volume (`firecrawl_pgdata`), port `3003`

## Firecrawl

**Admin UI:** `http://localhost:3003/admin/<BULL_AUTH_KEY>/queues` (set `FIRECRAWL_BULL_AUTH_KEY` in `.env`)

**Database issues:** If you see missing table errors, remove the volume and restart:
```bash
docker compose -f docker-compose.firecrawl.yml down
docker volume rm checkbot_firecrawl_pgdata
docker compose -f docker-compose.firecrawl.yml up -d
```

## TODO

- Replace Jina reranker with RAG API reranker once LibreChat PR [#10574](https://github.com/danny-avila/LibreChat/pull/10574) is merged (adds `rerankerType: "simple"` support)

