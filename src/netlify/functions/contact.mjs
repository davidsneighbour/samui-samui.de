import { renderContactEmail } from './lib/email.mjs';
import { isLikelySpam } from './lib/spam.mjs';

// Keep in sync with Astro.site in astro.config.ts.
const SITE_URL = 'https://samui-samui.de';
const CONTACT_PATH = '/kontakt/';

// Koh Samui is ICT (UTC+7, no DST). Override with any IANA zone name via
// CONTACT_EMAIL_TIMEZONE if the recipient is ever somewhere else.
const DEFAULT_TIMEZONE = 'Asia/Bangkok';

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;

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
};

function textValue(formData, key) {
  return String(formData.get(key) || '').trim();
}

function wantsJson(request) {
  return request.headers.get('accept')?.includes('application/json') ?? false;
}

function responsePayload(request, status, result, message) {
  const ok = result === 'success';

  if (wantsJson(request)) {
    return Response.json({ message, ok, status: result }, { status });
  }

  return new Response(
    `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
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
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status,
    },
  );
}

function pageUrlFrom(request) {
  return request.headers.get('referer') || `${SITE_URL}${CONTACT_PATH}`;
}

function userAgentFrom(request) {
  return request.headers.get('user-agent') || 'unknown';
}

function formatTimestamp(date) {
  const timeZone = process.env.CONTACT_EMAIL_TIMEZONE || DEFAULT_TIMEZONE;

  let formatter;
  try {
    formatter = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
      month: '2-digit',
      timeZone,
      timeZoneName: 'short',
      year: 'numeric',
    });
  } catch (error) {
    console.error(
      `Invalid CONTACT_EMAIL_TIMEZONE "${timeZone}", falling back to ${DEFAULT_TIMEZONE}.`,
      error,
    );
    formatter = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
      month: '2-digit',
      timeZone: DEFAULT_TIMEZONE,
      timeZoneName: 'short',
      year: 'numeric',
    });
  }

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} ${parts.timeZoneName}`;
}

function bccRecipients() {
  return String(process.env.CONTACT_EMAIL_BCC || '')
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean);
}

async function resendPayload(fields) {
  const subjectPrefix =
    process.env.CONTACT_EMAIL_SUBJECT_PREFIX || 'Samui? Samui!';
  const bcc = bccRecipients();
  const { html, text } = await renderContactEmail(fields);

  return {
    ...(bcc.length > 0 ? { bcc } : {}),
    from: process.env.CONTACT_EMAIL_FROM,
    html,
    reply_to: fields.email,
    subject: `${subjectPrefix}: ${fields.name}`,
    text,
    to: [process.env.CONTACT_EMAIL_TO],
  };
}

function envReady() {
  return Boolean(
    process.env.RESEND_API_KEY &&
      process.env.CONTACT_EMAIL_FROM &&
      process.env.CONTACT_EMAIL_TO &&
      process.env.TURNSTILE_SECRET,
  );
}

function isValidEmail(email) {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
}

function fieldsWithinLimits(fields) {
  return (
    fields.name.length <= MAX_NAME_LENGTH &&
    fields.message.length <= MAX_MESSAGE_LENGTH
  );
}

// Verifies a Cloudflare Turnstile token against the siteverify endpoint.
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
async function verifyTurnstile(token, remoteIp) {
  if (!token) {
    return { ok: false, reason: 'missing-token' };
  }

  const params = new URLSearchParams({
    response: token,
    secret: process.env.TURNSTILE_SECRET,
  });
  if (remoteIp) {
    params.set('remoteip', remoteIp);
  }

  let payload;
  try {
    const verifyResponse = await fetch(TURNSTILE_VERIFY_URL, {
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

export default async function handler(request, context) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405,
    });
  }

  const formData = await request.formData();

  if (textValue(formData, 'bot-field')) {
    return responsePayload(request, 200, 'success', MESSAGES.success);
  }

  const fields = {
    email: textValue(formData, 'email'),
    message: textValue(formData, 'message'),
    name: textValue(formData, 'name'),
  };

  if (!fields.name || !fields.email || !fields.message) {
    return responsePayload(request, 400, 'missing', MESSAGES.missing);
  }

  if (!isValidEmail(fields.email) || !fieldsWithinLimits(fields)) {
    return responsePayload(request, 400, 'invalid', MESSAGES.invalid);
  }

  if (isLikelySpam(fields).spam) {
    return responsePayload(request, 400, 'suspicious', MESSAGES.suspicious);
  }

  if (!envReady()) {
    console.error(
      'Missing Resend/Turnstile contact form environment variables.',
    );
    return responsePayload(request, 500, 'error', MESSAGES.error);
  }

  const turnstileToken = textValue(formData, 'cf-turnstile-response');
  const turnstileResult = await verifyTurnstile(turnstileToken, context?.ip);

  if (!turnstileResult.ok) {
    console.warn('Turnstile check failed on contact form.', turnstileResult);
    return responsePayload(request, 400, 'suspicious', MESSAGES.suspicious);
  }

  const payload = await resendPayload({
    ...fields,
    pageUrl: pageUrlFrom(request),
    submittedAt: formatTimestamp(new Date()),
    userAgent: userAgentFrom(request),
  });

  const resendResponse = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!resendResponse.ok) {
    console.error(
      'Resend contact form delivery failed.',
      await resendResponse.text(),
    );
    return responsePayload(request, 502, 'error', MESSAGES.error);
  }

  return responsePayload(request, 200, 'success', MESSAGES.success);
}
