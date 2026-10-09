// Minimal Cloudflare API client for cache purging and Cache Rules.
// https://developers.cloudflare.com/api/resources/cache/methods/purge/
import {
  type CloudflareConfig,
  cloudflareConfig,
  ZONE_NAME,
} from './config.ts';

const API_BASE = 'https://api.cloudflare.com/client/v4';

// Free and Pro plans accept at most 100 URLs or tags per purge request.
// https://developers.cloudflare.com/cache/how-to/purge-cache/#availability-and-limits
const MAX_ITEMS_PER_PURGE = 100;

interface ApiEnvelope<T> {
  errors: { code: number; message: string }[];
  result: T;
  success: boolean;
}

export class CloudflareClient {
  readonly #config: CloudflareConfig;
  #zoneId: string | undefined;

  constructor(config: CloudflareConfig = cloudflareConfig()) {
    this.#config = config;
    this.#zoneId = config.zoneId;
  }

  async request<T>(
    method: string,
    pathname: string,
    body?: unknown,
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${pathname}`, {
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      headers: {
        Authorization: `Bearer ${this.#config.apiToken}`,
        'Content-Type': 'application/json',
      },
      method,
    });
    const payload = (await response.json()) as ApiEnvelope<T>;
    if (!response.ok || !payload.success) {
      const errors = payload.errors
        ?.map((error) =>
          error.code === undefined
            ? error.message
            : `${error.code}: ${error.message}`,
        )
        .join('; ');
      throw new Error(
        `Cloudflare API ${method} ${pathname} failed (HTTP ${response.status}): ${errors || 'unknown error'}`,
      );
    }
    return payload.result;
  }

  async zoneId(): Promise<string> {
    if (this.#zoneId) {
      return this.#zoneId;
    }
    const zones = await this.request<{ id: string; name: string }[]>(
      'GET',
      `/zones?name=${encodeURIComponent(ZONE_NAME)}`,
    );
    const zone = zones.find((candidate) => candidate.name === ZONE_NAME);
    if (!zone) {
      throw new Error(
        `Zone ${ZONE_NAME} not visible to this token. Set CLOUDFLARE_ZONE_ID or grant Zone:Read.`,
      );
    }
    this.#zoneId = zone.id;
    return zone.id;
  }

  async #purge(body: Record<string, unknown>): Promise<void> {
    const zone = await this.zoneId();
    await this.request('POST', `/zones/${zone}/purge_cache`, body);
  }

  async purgeUrls(urls: string[]): Promise<number> {
    for (let index = 0; index < urls.length; index += MAX_ITEMS_PER_PURGE) {
      await this.#purge({
        files: urls.slice(index, index + MAX_ITEMS_PER_PURGE),
      });
    }
    return urls.length;
  }

  async purgeTags(tags: string[]): Promise<number> {
    for (let index = 0; index < tags.length; index += MAX_ITEMS_PER_PURGE) {
      await this.#purge({
        tags: tags.slice(index, index + MAX_ITEMS_PER_PURGE),
      });
    }
    return tags.length;
  }

  async purgeEverything(): Promise<void> {
    await this.#purge({ purge_everything: true });
  }
}
