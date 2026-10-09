import { describe, expect, it, vi } from 'vitest';
import { handleContact } from '../contact';
import { route } from '../index';
import { handleWeather } from '../weather';

// Minimal stand-in for the Workers Cache API (caches.default). Keys are
// compared by URL, which is all the Worker relies on.
function memoryCache(): Cache {
  const store = new Map<string, Response>();
  return {
    delete: async (key: RequestInfo | URL) =>
      store.delete(new Request(key).url),
    match: async (key: RequestInfo | URL) =>
      store.get(new Request(key).url)?.clone(),
    put: async (key: RequestInfo | URL, response: Response) => {
      store.set(new Request(key).url, response.clone());
    },
  } as unknown as Cache;
}

function openMeteoPayload(): Record<string, unknown> {
  return {
    current: {
      apparent_temperature: 35,
      cloud_cover: 40,
      is_day: 1,
      precipitation: 0,
      rain: 0,
      relative_humidity_2m: 70,
      temperature_2m: 30,
      time: '2026-07-25T17:45',
      weather_code: 2,
      wind_speed_10m: 10,
    },
    hourly: {
      apparent_temperature: [35, 34],
      precipitation: [0, 0.5],
      precipitation_probability: [10, 50],
      rain: [0, 0.5],
      temperature_2m: [30, 29],
      time: ['2026-07-25T18:00', '2026-07-25T19:00'],
      weather_code: [2, 61],
    },
  };
}

const WEATHER_URL = 'https://samui-samui.de/api/weather';

function weatherDeps(fetcher: typeof fetch, cache = memoryCache()) {
  const pending: Promise<unknown>[] = [];
  return {
    cache,
    deps: {
      cache,
      fetcher,
      waitUntil: (promise: Promise<unknown>) => {
        pending.push(promise);
      },
    },
    settle: () => Promise.all(pending),
  };
}

describe('GET /api/weather', () => {
  it('fetches Open-Meteo once and serves later requests from the cache', async () => {
    const fetcher = vi.fn(async () => Response.json(openMeteoPayload()));
    const { deps, settle } = weatherDeps(fetcher as unknown as typeof fetch);

    const first = await handleWeather(new Request(WEATHER_URL), deps);
    await settle();
    const second = await handleWeather(new Request(WEATHER_URL), deps);

    expect(first.status).toBe(200);
    expect(first.headers.get('X-Weather-Cache')).toBe('MISS');
    expect(second.headers.get('X-Weather-Cache')).toBe('HIT');
    expect(second.headers.get('Cache-Control')).toBe(
      'public, max-age=0, must-revalidate',
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
    const body = (await second.json()) as {
      current: { temperatureCelsius: number };
    };
    expect(body.current.temperatureCelsius).toBe(30);
  });

  it('serves the stale copy when Open-Meteo fails after the fresh copy expired', async () => {
    const cache = memoryCache();
    const ok = weatherDeps(
      (async () =>
        Response.json(openMeteoPayload())) as unknown as typeof fetch,
      cache,
    );
    await handleWeather(new Request(WEATHER_URL), ok.deps);
    await ok.settle();
    await cache.delete('https://samui-samui.de/api/weather/__cache/fresh');

    const failing = weatherDeps(
      (async () =>
        new Response('nope', { status: 500 })) as unknown as typeof fetch,
      cache,
    );
    const response = await handleWeather(
      new Request(WEATHER_URL),
      failing.deps,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Weather-Cache')).toBe('STALE');
  });

  it('returns an uncached error when Open-Meteo fails and nothing is cached', async () => {
    const { deps } = weatherDeps(
      (async () =>
        new Response('slow down', { status: 429 })) as unknown as typeof fetch,
    );
    const response = await handleWeather(new Request(WEATHER_URL), deps);

    expect(response.status).toBe(429);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});

describe('POST /api/contact', () => {
  const env = {
    CONTACT_EMAIL_FROM: 'Website <web@example.org>',
    CONTACT_EMAIL_TO: 'owner@example.org',
    RESEND_API_KEY: 're_test',
    TURNSTILE_SECRET: 'secret',
  };

  function post(fields: Record<string, string>, headers: HeadersInit = {}) {
    const body = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      body.set(key, value);
    }
    return new Request('https://samui-samui.de/api/contact', {
      body,
      headers: { Accept: 'application/json', ...headers },
      method: 'POST',
    });
  }

  const valid = {
    'cf-turnstile-response': 'token',
    email: 'visitor@example.org',
    message: 'Hallo aus Deutschland.',
    name: 'Visitor',
  };

  it('rejects other methods with 405', async () => {
    const response = await handleContact(
      new Request('https://samui-samui.de/api/contact'),
      { env, fetcher: fetch },
    );
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
  });

  it('rejects cross-origin submissions without calling any upstream', async () => {
    const fetcher = vi.fn();
    const response = await handleContact(
      post(valid, { Origin: 'https://evil.example' }),
      { env, fetcher: fetcher as unknown as typeof fetch },
    );
    expect(response.status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('reports missing fields', async () => {
    const response = await handleContact(post({ name: 'x' }), {
      env,
      fetcher: fetch,
    });
    expect(response.status).toBe(400);
    expect(((await response.json()) as { status: string }).status).toBe(
      'missing',
    );
  });

  it('pretends success for honeypot submissions without sending', async () => {
    const fetcher = vi.fn();
    const response = await handleContact(post({ ...valid, 'bot-field': 'x' }), {
      env,
      fetcher: fetcher as unknown as typeof fetch,
    });
    expect(response.status).toBe(200);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('verifies Turnstile and sends through Resend', async () => {
    const calls: { url: string; body: string }[] = [];
    const fetcher = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push({ body: String(init?.body ?? ''), url });
        if (url.includes('turnstile')) {
          return Response.json({ success: true });
        }
        return Response.json({ id: 'email-id' });
      },
    );

    const response = await handleContact(
      post(valid, { 'CF-Connecting-IP': '203.0.113.7' }),
      {
        env,
        fetcher: fetcher as unknown as typeof fetch,
        now: () => new Date('2026-10-09T08:00:00Z'),
      },
    );

    expect(response.status).toBe(200);
    expect(calls[0]?.body).toContain('remoteip=203.0.113.7');
    const resend = JSON.parse(calls[1]?.body ?? '{}') as Record<
      string,
      unknown
    >;
    expect(calls[1]?.url).toBe('https://api.resend.com/emails');
    expect(resend['to']).toEqual(['owner@example.org']);
    expect(resend['reply_to']).toBe('visitor@example.org');
    expect(resend['subject']).toBe('Samui? Samui!: Visitor');
    // The privacy policy says the email does not contain the visitor IP.
    expect(calls[1]?.body).not.toContain('203.0.113.7');
  });

  it('logs only the Resend status and error name when delivery fails', async () => {
    const errorLog = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('turnstile')) {
        return Response.json({ success: true });
      }
      return Response.json(
        {
          message: 'Invalid `reply_to` field: visitor@example.org',
          name: 'validation_error',
          statusCode: 422,
        },
        { status: 422 },
      );
    });

    const response = await handleContact(post(valid), {
      env,
      fetcher: fetcher as unknown as typeof fetch,
    });

    expect(response.status).toBe(502);
    expect(errorLog).toHaveBeenCalledWith(
      'Resend contact form delivery failed.',
      422,
      'validation_error',
    );
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(
      'visitor@example.org',
    );
    errorLog.mockRestore();
  });

  it('fails closed when secrets are missing', async () => {
    const response = await handleContact(post(valid), {
      env: {},
      fetcher: fetch,
    });
    expect(response.status).toBe(500);
  });
});

describe('router', () => {
  const ctx = { waitUntil: () => undefined };

  it('exposes the deployed source hash', async () => {
    const response = await route(
      new Request('https://samui-samui.de/api/version'),
      { WORKER_SOURCE_HASH: 'abc123' },
      ctx,
      memoryCache(),
    );
    expect(await response.json()).toEqual({
      hash: 'abc123',
      worker: 'samui-samui-api',
    });
  });

  it('answers unknown API paths with a JSON 404', async () => {
    const response = await route(
      new Request('https://samui-samui.de/api/unknown'),
      {},
      ctx,
      memoryCache(),
    );
    expect(response.status).toBe(404);
  });

  it('only allows GET and HEAD on the weather endpoint', async () => {
    const response = await route(
      new Request(WEATHER_URL, { method: 'POST' }),
      {},
      ctx,
      memoryCache(),
    );
    expect(response.status).toBe(405);
  });
});
