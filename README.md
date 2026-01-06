# AI Chat Interface

Modular Docker Compose setup for LibreChat, Open WebUI, and Firecrawl with Traefik as reverse proxy.

## Setup

1. **Network**: Create the shared proxy network:
   ```bash
   docker network create traefik-net
   ```

2. **Environment**: Copy and configure `.env`:
   ```bash
   cp env.example .env
   ```
   * Set `DOMAIN` (e.g., `localhost` or `ai.faktenforum.org`)
   * Set `OPENROUTER_API_KEY`
   * Set `JINA_API_KEY` (for reranking)

## Services

Run services using their feature-grouped compose files:

| Feature | Commands | Access (Local) |
| :--- | :--- | :--- |
| **Proxy** | `docker compose -f docker-compose.traefik.yml up -d` | `http://localhost:8080` (Dashboard) |
| **LibreChat** | `docker compose -f docker-compose.librechat.yml up -d` | `http://chat.localhost` |
| **WebUI** | `docker compose -f docker-compose.openwebui.yml up -d` | `http://webui.localhost` |
| **WebSearch** | `docker compose -f docker-compose.websearch.yml up -d` | `http://searxng.localhost` |
| **RAG** | `docker compose -f docker-compose.rag.yml up -d` | *Internal* |
| **Firecrawl** | `docker compose -f docker-compose.firecrawl.yml up -d` | `http://firecrawl.localhost` |

### Start All (Recommended)
```bash
docker compose -f docker-compose.traefik.yml \
               -f docker-compose.librechat.yml \
               -f docker-compose.openwebui.yml \
               -f docker-compose.websearch.yml \
               -f docker-compose.rag.yml \
               -f docker-compose.firecrawl.yml up -d
```

## Firecrawl Admin
`http://firecrawl.localhost/admin/<BULL_AUTH_KEY>/queues`
(Set `FIRECRAWL_BULL_AUTH_KEY` in `.env`)

## TODO

- Replace Jina reranker with RAG API reranker once LibreChat PR [#10574](https://github.com/danny-avila/LibreChat/pull/10574) is merged (adds `rerankerType: "simple"` support)

