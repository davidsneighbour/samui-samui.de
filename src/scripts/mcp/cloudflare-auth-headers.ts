// headersHelper for the project-scoped "cloudflare-samui" MCP server in
// .mcp.json (documentation/hosting/cloudflare-mcp.md).
//
// Claude Code runs this from the project root on every MCP connection and
// sends the JSON it prints as HTTP headers. The token lives only in the
// git-ignored .env of this repository, so the MCP server is authenticated as
// *this project's* scoped Cloudflare API token -- independent of any OAuth
// session or token used by other projects on the same machine.
//
// Prints {} when no token is configured; Claude Code then falls back to the
// server's normal OAuth flow.
import fs from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';

const envFile = path.resolve(import.meta.dirname, '../../../.env');
const values = fs.existsSync(envFile)
  ? parseEnv(fs.readFileSync(envFile, 'utf8'))
  : {};

// A dedicated MCP token is preferred (least privilege for an interactive
// agent); the deploy token is the fallback.
const token =
  values['CLOUDFLARE_MCP_API_TOKEN'] ?? values['CLOUDFLARE_API_TOKEN'];

process.stdout.write(
  JSON.stringify(token ? { Authorization: `Bearer ${token}` } : {}),
);
