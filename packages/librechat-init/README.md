# LibreChat Init Service

Unified initialization service for LibreChat that handles:
1. LibreChat YAML configuration setup
2. File permissions configuration
3. MongoDB role initialization

## Structure

```
librechat-init/
├── config/
│   ├── librechat.yaml    # LibreChat configuration file
│   └── roles.json        # Custom roles definition
├── src/
│   ├── init.ts           # Main orchestrator
│   ├── setup-permissions.ts
│   └── init-roles.ts
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Configuration

### Custom Roles

Edit `config/roles.json` to add or modify custom roles:

```json
{
  "roles": [
    {
      "name": "DEVELOPER",
      "permissions": {
        "PROMPTS": { "SHARED_GLOBAL": true, "USE": true, "CREATE": true },
        ...
      }
    }
  ]
}
```

### Default Administrators

Set `LIBRECHAT_DEFAULT_ADMINS` environment variable (comma-separated email addresses):

```bash
LIBRECHAT_DEFAULT_ADMINS=admin@example.com,admin2@example.com
```

## Building

```bash
npm run build:docker
```

Or via Docker Compose:

```bash
docker compose -f docker-compose.librechat.yml build librechat-init
```

## Usage

The service runs automatically as part of the Docker Compose stack. It executes before the LibreChat API service starts.
