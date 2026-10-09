# Cloudflare MCP server

The repository declares a project-scoped MCP server, `cloudflare-samui`, so that AI assistants working in this repository can inspect and change this site's Cloudflare configuration (DNS, Cache Rules, Workers, analytics) through Cloudflare's official API MCP server, `https://mcp.cloudflare.com/mcp`.

## Why a project-scoped server with a file-based token

* **Reproducible:** the server definition is committed in [`.mcp.json`](../../.mcp.json), so every checkout and every MCP client that reads it gets the same server.
* **Separate from other projects:** authentication does not use an OAuth session shared across projects, and it does not use a token in the global Claude configuration. Claude Code runs a `headersHelper` from the project root for each connection. The helper, [`src/scripts/mcp/cloudflare-auth-headers.ts`](../../src/scripts/mcp/cloudflare-auth-headers.ts), reads the token from this repository's git-ignored `.env` and returns `Authorization: Bearer <token>`. Another project can use a different token, or OAuth, for the same Cloudflare MCP endpoint.
* **Least privilege:** the token decides what the assistant can do. Cloudflare's MCP server accepts user and account API tokens as bearer tokens in place of OAuth.

## Setup

1. Create a Cloudflare API token restricted to this account and the zone `samui-samui.de`. For an assistant that should inspect but not change anything, use read permissions (for example Zone → Zone, DNS, Cache Rules, Analytics → Read; Account → Workers Scripts → Read). Add edit permissions only if the assistant should make changes.
2. Put it in `.env` as `CLOUDFLARE_MCP_API_TOKEN=…`. If this variable is empty, the helper falls back to the deploy token `CLOUDFLARE_API_TOKEN`. If both are empty, it sends no header, and Claude Code offers Cloudflare's OAuth login instead.
3. Start Claude Code in the project and approve the project MCP server and the project trust dialog (Claude Code runs `headersHelper` only for trusted projects). Check the connection with `/mcp`.

The installed Cloudflare plugin also brings its own MCP servers (`cloudflare-api`, `cloudflare-bindings`, and others) that use OAuth. To avoid two parallel Cloudflare connections in this project, turn those off for this project in `/mcp`. Plugin servers cannot be disabled through `.mcp.json` or project settings.

## Notes

* The helper must finish within 10 seconds and print a JSON object of string headers. It runs again on every connection and after a `401`/`403`, so a rotated token in `.env` is picked up without restarting.
* `.mcp.json` contains no secret, and the token never leaves `.env`.
* Changes made through the MCP server are not recorded in the repository. Cache Rules and the www redirect are owned by [`src/scripts/deploy/cache-rules.ts`](../../src/scripts/deploy/cache-rules.ts). Change them there and run `npm run cache:rules:update`, rather than editing them through MCP or the dashboard.
