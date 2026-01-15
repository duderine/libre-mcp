# n8n Setup Notes

## Owner Account Creation

The owner account is automatically created via the `n8n-init` container, which calls n8n's `/rest/owner/setup` API after n8n is ready.

### Automatic Setup

When `N8N_OWNER_EMAIL` and `N8N_OWNER_PASSWORD` are set, the init container:
1. Waits for n8n to be ready (checks `/healthz`)
2. Calls `POST /rest/owner/setup` API to create the owner account
3. Interprets the response:
   - HTTP 200/201: Owner successfully created
   - HTTP 400 with "Instance owner already setup": Owner already exists (skips creation)

**Environment Variables:**
- `N8N_OWNER_EMAIL` - Auto-generated if empty via `setup-env.ts`
- `N8N_OWNER_PASSWORD` - Auto-generated if empty via `setup-env.ts`
- `N8N_OWNER_FIRST_NAME` - Default: "Admin"
- `N8N_OWNER_LAST_NAME` - Default: "User"

### Manual Setup

If credentials are not set, create the owner manually via the web UI at `http://n8n.localhost` (or your configured domain).

### Reset Owner

```bash
docker exec n8n n8n user-management:reset
```

After resetting, restart the stack to trigger automatic owner creation if credentials are provided.

## Reverse Proxy Configuration

When running n8n behind a reverse proxy (e.g., Traefik), configure proxy trust to avoid rate limiting errors:

**Environment Variables:**
- `N8N_PROXY_HOPS` - Number of reverse proxy layers between client and n8n
  - Set to `1` when behind Traefik (production/dev/local - all environments use Traefik)
  - Default: `1`

This setting enables Express to trust `X-Forwarded-For`, `X-Forwarded-Host`, and `X-Forwarded-Proto` headers from the reverse proxy, which is required for proper rate limiting and IP detection.

## Code Node Configuration

**Python Support:**
- `N8N_PYTHON_ENABLED` - Enable/disable Python Code Nodes
  - Set to `false` to disable Python (default)
  - Set to `true` to enable Python Code Nodes
  - **Note:** JavaScript and TypeScript Code Nodes work regardless of this setting

When `N8N_PYTHON_ENABLED=false`:
- ✅ JavaScript Code Nodes work normally
- ✅ TypeScript Code Nodes work normally
- ❌ Python Code Nodes are disabled (no error messages)
