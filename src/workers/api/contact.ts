// POST /api/contact -- contact form delivery through Resend, guarded by a
// honeypot, local spam heuristics, and Cloudflare Turnstile. See
// documentation/features/contact-form.md.
//
import { renderContactEmail } from './lib/email.mjs';
import { isLikelySpam } from './lib/spam.mjs';

// Keep in sync with Astro.site in astro.config.ts.
export const SITE_URL = 'https://samui-samui.de';
const CONTACT_PATH = '/kontakt/';

// Koh Samui is ICT (UTC+7, no DST).
const DEFAULT_TIMEZONE = 'Asia/Bangkok';
const DEFAULT_SUBJECT_PREFIX = 'Samui? Samui!';

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RESEND_EMAILS_URL = 'https://api.resend.com/emails';

const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;
// Name + email + message + Turnstile token comfortably fit; anything larger
// is not a real submission and is rejected before parsing.
const MAX_BODY_BYTES = 64 * 1024;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MESSAGES = {
  error:
    'Die Nachricht konnte nicht gesendet werden. Bitte versuche es später erneut.',
  invalid:
    'Bitte überprüfe Name, Emailadresse und Nachricht und versuche es erneut.',
  missing: 'Bitte fülle Name, Emailadresse und Nachricht aus.',
  success: 'Danke. Deine Nachricht wurde gesendet.',
  suspicious:
    'Diese Nachricht wurde als verdächtig eingestuft und wurde nicht gesendet.',
  title: 'Kontakt',
} as const;

type Result = 'error' | 'invalid' | 'missing' | 'success' | 'suspicious';

export interface ContactEnv {
  CONTACT_EMAIL_BCC?: string;
  CONTACT_EMAIL_FROM?: string;
  CONTACT_EMAIL_SUBJECT_PREFIX?: string;
  CONTACT_EMAIL_TIMEZONE?: string;
  CONTACT_EMAIL_TO?: string;
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET?: string;
}

interface ContactFields {
  email: string;
  message: string;
  name: string;
}

function textValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function wantsJson(request: Request): boolean {
  return request.headers.get('accept')?.includes('application/json') ?? false;
}

// JSON for the enhanced (fetch) form; a minimal HTML page when JavaScript is
// off and the browser submitted the form natively. Only fixed strings from
// MESSAGES are interpolated -- never visitor input.
function respond(
  request: Request,
  status: number,
  result: Result,
  message: string,
): Response {
  const headers = { 'Cache-Control': 'no-store' };

  if (wantsJson(request)) {
    return Response.json(
      { message, ok: result === 'success', status: result },
      { headers, status },
    );
  }

  return new Response(
    `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${MESSAGES.title}</title>
  </head>
  <body>
    <main>
      <h1>${MESSAGES.title}</h1>
      <p>${message}</p>
      <p><a href="${CONTACT_PATH}">${MESSAGES.title}</a></p>
    </main>
  </body>
</html>`,
    {
      headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
      status,
    },
  );
}

// Only accept submissions from the site itself. Browsers always send
// `Origin` on cross-origin POSTs, so a foreign page cannot use this endpoint
// as an open mail relay even before Turnstile is checked.
function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) {
    return true;
  }
  return origin === new URL(request.url).origin || origin === SITE_URL;
}

function formatTimestamp(date: Date, timeZone: string): string {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    timeZoneName: 'short',
    year: 'numeric',
  };

  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat('en-GB', { ...options, timeZone });
  } catch (error) {
    console.error(
      `Invalid CONTACT_EMAIL_TIMEZONE "${timeZone}", falling back to ${DEFAULT_TIMEZONE}.`,
      error,
    );
    formatter = new Intl.DateTimeFormat('en-GB', {
      ...options,
      timeZone: DEFAULT_TIMEZONE,
    });
  }

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts['year']}-${parts['month']}-${parts['day']} ${parts['hour']}:${parts['minute']} ${parts['timeZoneName']}`;
}

function bccRecipients(env: ContactEnv): string[] {
  return String(env.CONTACT_EMAIL_BCC ?? '')
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean);
}

function envReady(env: ContactEnv): boolean {
  return Boolean(
    env.RESEND_API_KEY &&
      env.CONTACT_EMAIL_FROM &&
      env.CONTACT_EMAIL_TO &&
      env.TURNSTILE_SECRET,
  );
}

function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
}

function fieldsWithinLimits(fields: ContactFields): boolean {
  return (
    fields.name.length <= MAX_NAME_LENGTH &&
    fields.message.length <= MAX_MESSAGE_LENGTH
  );
}

type TurnstileResult =
  | { ok: true }
  | { errorCodes?: unknown; ok: false; reason: string };

// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
async function verifyTurnstile(
  fetcher: typeof fetch,
  secret: string,
  token: string,
  remoteIp: string | null,
): Promise<TurnstileResult> {
  if (!token) {
    return { ok: false, reason: 'missing-token' };
  }

  const params = new URLSearchParams({ response: token, secret });
  if (remoteIp) {
    params.set('remoteip', remoteIp);
  }

  let payload: { success?: boolean; 'error-codes'?: unknown };
  try {
    const verifyResponse = await fetcher(TURNSTILE_VERIFY_URL, {
      body: params.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    });
    payload = await verifyResponse.json();
  } catch (error) {
    console.error('Turnstile verification request failed.', error);
    return { ok: false, reason: 'network-error' };
  }

  if (!payload.success) {
    return {
      errorCodes: payload['error-codes'],
      ok: false,
      reason: 'verification-failed',
    };
  }

  return { ok: true };
}

export interface ContactDependencies {
  env: ContactEnv;
  fetcher: typeof fetch;
  now?: () => Date;
}

export async function handleContact(
  request: Request,
  { env, fetcher, now = () => new Date() }: ContactDependencies,
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST', 'Cache-Control': 'no-store' },
      status: 405,
    });
  }

  if (!isAllowedOrigin(request)) {
    return respond(request, 403, 'suspicious', MESSAGES.suspicious);
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return respond(request, 413, 'invalid', MESSAGES.invalid);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return respond(request, 400, 'invalid', MESSAGES.invalid);
  }

  // Honeypot: bots that fill every field get a fake success.
  if (textValue(formData, 'bot-field')) {
    return respond(request, 200, 'success', MESSAGES.success);
  }

  const fields: ContactFields = {
    email: textValue(formData, 'email'),
    message: textValue(formData, 'message'),
    name: textValue(formData, 'name'),
  };

  if (!fields.name || !fields.email || !fields.message) {
    return respond(request, 400, 'missing', MESSAGES.missing);
  }

  if (!isValidEmail(fields.email) || !fieldsWithinLimits(fields)) {
    return respond(request, 400, 'invalid', MESSAGES.invalid);
  }

  if (isLikelySpam(fields).spam) {
    return respond(request, 400, 'suspicious', MESSAGES.suspicious);
  }

  if (!envReady(env)) {
    console.error('Missing Resend/Turnstile contact form secrets.');
    return respond(request, 500, 'error', MESSAGES.error);
  }

  const turnstileResult = await verifyTurnstile(
    fetcher,
    env.TURNSTILE_SECRET as string,
    textValue(formData, 'cf-turnstile-response'),
    request.headers.get('cf-connecting-ip'),
  );

  if (!turnstileResult.ok) {
    console.warn('Turnstile check failed on contact form.', turnstileResult);
    return respond(request, 400, 'suspicious', MESSAGES.suspicious);
  }

  const { html, text } = await renderContactEmail({
    ...fields,
    pageUrl: request.headers.get('referer') || `${SITE_URL}${CONTACT_PATH}`,
    submittedAt: formatTimestamp(
      now(),
      env.CONTACT_EMAIL_TIMEZONE || DEFAULT_TIMEZONE,
    ),
    userAgent: request.headers.get('user-agent') || 'unknown',
  });

  const bcc = bccRecipients(env);
  const resendResponse = await fetcher(RESEND_EMAILS_URL, {
    body: JSON.stringify({
      ...(bcc.length > 0 ? { bcc } : {}),
      from: env.CONTACT_EMAIL_FROM,
      html,
      reply_to: fields.email,
      subject: `${env.CONTACT_EMAIL_SUBJECT_PREFIX || DEFAULT_SUBJECT_PREFIX}: ${fields.name}`,
      text,
      to: [env.CONTACT_EMAIL_TO],
    }),
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!resendResponse.ok) {
    console.error(
      'Resend contact form delivery failed.',
      resendResponse.status,
      await resendResponse.text(),
    );
    return respond(request, 502, 'error', MESSAGES.error);
  }

  return respond(request, 200, 'success', MESSAGES.success);
}
