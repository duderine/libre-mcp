# TODO

## Security

### LDAP/Active Directory Integration
- [ ] Configure LDAP server connection
- [ ] Set up user authentication via LDAP
- [ ] Test LDAP login flow
- [ ] Document LDAP configuration

**Resources:** [LibreChat LDAP Documentation](dev/librechat-doc/pages/docs/configuration/authentication/ldap.mdx)

### Firecrawl API Security
- [ ] Remove public Traefik exposure for Firecrawl API (only internal Docker network access needed)

---

## Infrastructure

- [ ] Define backup strategy for MongoDB and PostgreSQL
- [ ] Set up monitoring and alerting
- [ ] Configure log rotation

---

## Features

- [ ] Replace Jina reranker with RAG API reranker once LibreChat PR [#10574](https://github.com/danny-avila/LibreChat/pull/10574) is merged (adds `rerankerType: "simple"` support)

### Model Specs Improvements

- [ ] Fix vision model detection for "Upload to AI Provider" option
  - Problem: Upload option shown for all OpenRouter models (provider-level), not model-level
  - Solution: Create LibreChat issue/PR to add model-level vision detection, or use alternative provider
- [ ] Add multilingual support for model descriptions
  - Problem: Descriptions are single-language only (no i18n support)
  - Solution: Create LibreChat feature request/PR for multilingual model descriptions
- [ ] Fix custom icon theme support
  - Problem: Custom icons (Data URIs/URLs) rendered as `<img>` tags, cannot use `currentColor` for theme adaptation
  - Solution: Create LibreChat PR to render SVGs inline or add CSS variable support for icon colors
