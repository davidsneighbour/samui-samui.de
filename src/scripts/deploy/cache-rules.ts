// npm run cache:rules          -- show the difference between this file and
//                                 the zone's current rules (no changes)
// npm run cache:rules:update   -- write them through the Cloudflare API
//
// The Cloudflare rules this site depends on, as code. Each rule carries a
// `ref` starting with "samui_"; only those are replaced, so rules created by
// hand in the dashboard survive. See documentation/hosting/caching.md.
//
// Token permissions: Zone > Cache Rules > Edit, Account > Account Rulesets >
// Edit, Account > Account Filter Lists > Edit (cache rules), and Zone >
// Single Redirect > Edit (www redirect).
import { CloudflareClient } from './lib/cloudflare.ts';
import { exitWithError, hasFlag } from './lib/process.ts';

interface Rule {
  ref: string;
  description: string;
  expression: string;
  action: string;
  action_parameters: Record<string, unknown>;
  enabled: boolean;
}

const MANAGED_PREFIX = 'samui_';
const HOST = '(http.host eq "samui-samui.de")';
const API = 'starts_with(http.request.uri.path, "/api/")';

export const PHASE_RULES: Record<string, Rule[]> = {
  http_request_cache_settings: [
    {
      // Without this, Cloudflare caches only "static" file extensions and
      // passes every HTML page through to DreamHost. Edge and browser TTLs
      // come from the origin headers in public/.htaccess
      // (Cloudflare-CDN-Cache-Control for the edge, Cache-Control for
      // browsers), so the TTL policy stays versioned next to the site.
      action: 'set_cache_settings',
      action_parameters: {
        browser_ttl: { mode: 'respect_origin' },
        cache: true,
        edge_ttl: { mode: 'respect_origin' },
      },
      description:
        'samui-samui.de: make static site (incl. HTML) cache eligible; TTLs from origin headers',
      enabled: true,
      expression: `${HOST} and not ${API}`,
      ref: 'samui_static_site_cache',
    },
    {
      // The Worker route answers /api/* before the cache, so this is a
      // safety net: even if the route were removed, API paths must never be
      // cached with static-site semantics.
      action: 'set_cache_settings',
      action_parameters: { cache: false },
      description: 'samui-samui.de: never cache /api/* (Worker)',
      enabled: true,
      expression: `${HOST} and ${API}`,
      ref: 'samui_api_bypass',
    },
  ],
  http_request_dynamic_redirect: [
    {
      // Netlify redirected www to the apex domain; keep that behaviour.
      action: 'redirect',
      action_parameters: {
        from_value: {
          preserve_query_string: true,
          status_code: 301,
          target_url: {
            expression:
              'concat("https://samui-samui.de", http.request.uri.path)',
          },
        },
      },
      description: 'samui-samui.de: www to apex',
      enabled: true,
      expression: '(http.host eq "www.samui-samui.de")',
      ref: 'samui_www_to_apex',
    },
  ],
};

interface Ruleset {
  rules?: (Rule & { id?: string })[];
}

function comparable(rule: Rule) {
  const { action, action_parameters, description, enabled, expression, ref } =
    rule;
  return JSON.stringify({
    action,
    action_parameters,
    description,
    enabled,
    expression,
    ref,
  });
}

// Compares PHASE_RULES with the zone and, with `apply`, writes every phase
// that differs. Phases that already match are never written, so running it
// on every deploy is safe. Returns the number of phases that differed.
export async function syncCacheRules({
  apply,
}: {
  apply: boolean;
}): Promise<number> {
  const client = new CloudflareClient();
  const zone = await client.zoneId();
  let changes = 0;

  for (const [phase, desired] of Object.entries(PHASE_RULES)) {
    const endpoint = `/zones/${zone}/rulesets/phases/${phase}/entrypoint`;
    let current: Ruleset = { rules: [] };
    try {
      current = await client.request<Ruleset>('GET', endpoint);
    } catch (error) {
      if (!(error instanceof Error && error.message.includes('HTTP 404'))) {
        throw error;
      }
    }

    const existing = current.rules ?? [];
    const foreign = existing.filter(
      (rule) => !rule.ref?.startsWith(MANAGED_PREFIX),
    );
    const managed = existing.filter((rule) =>
      rule.ref?.startsWith(MANAGED_PREFIX),
    );
    const same =
      managed.length === desired.length &&
      desired.every(
        (rule, index) =>
          managed[index] &&
          comparable(managed[index] as Rule) === comparable(rule),
      );

    console.log(
      `\n${phase}: ${same ? 'up to date' : 'differs'} (${foreign.length} unmanaged rule(s) kept)`,
    );
    for (const rule of desired) {
      console.log(`  ${rule.ref}: ${rule.expression}`);
    }
    if (same) {
      continue;
    }
    changes += 1;
    if (apply) {
      // Unmanaged rules first, ours last: for cache settings the last
      // matching rule wins, so the site policy cannot be shadowed by an
      // older dashboard rule.
      await client.request('PUT', endpoint, {
        rules: [
          // Drop read-only fields (id, version, last_updated) from the GET.
          ...foreign.map(
            ({
              action,
              action_parameters,
              description,
              enabled,
              expression,
              ref,
            }) => ({
              action,
              action_parameters,
              description,
              enabled,
              expression,
              ...(ref ? { ref } : {}),
            }),
          ),
          ...desired,
        ],
      });
      console.log('  -> updated');
    }
  }

  return changes;
}

async function main() {
  const apply = hasFlag(process.argv.slice(2), '--apply');
  const changes = await syncCacheRules({ apply });
  if (changes > 0 && !apply) {
    console.log('\nRun `npm run cache:rules:update` to apply.');
  }
}

if (import.meta.main) {
  main().catch(exitWithError);
}
