// Free, dependency-free spam heuristics for the contact form. None of this
// calls a paid API: it's a first line of defense alongside Cloudflare
// Turnstile and the honeypot field.

const URL_PATTERN = /https?:\/\/|www\./gi;
const MAX_URLS = 2;

const REPEATED_CHARACTER_PATTERN = /(.)\1{9,}/;

// Terms that legitimate messages essentially never use, borrowed from common
// comment/contact-form spam. Keep this list short and specific to avoid
// false positives.
const SPAM_KEYWORDS = [
  'viagra',
  'cialis',
  'casino',
  'porn',
  'xxx',
  'crypto',
  'bitcoin wallet',
  'forex trading',
  'loan approval',
  'seo service',
  'backlink',
  'escort',
  'weight loss pills',
  'replica watches',
  'cheap jerseys',
  'adult dating',
  'payday loan',
  'work from home opportunity',
  'click here to win',
  'free bitcoin',
];

// Free throwaway-inbox domains. Small and hand-maintained on purpose: it
// only needs to catch the handful of services spam tooling defaults to, not
// be an exhaustive disposable-email list (that would need a maintained
// dependency to stay current).
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
]);

function excessiveLinks(message) {
  const matches = message.match(URL_PATTERN) ?? [];
  return matches.length > MAX_URLS;
}

function containsSpamKeyword(text) {
  const haystack = text.toLowerCase();
  return SPAM_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function excessiveCaps(message) {
  const letters = message.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 30) {
    return false;
  }
  const upper = letters.replace(/[^A-Z]/g, '');
  return upper.length / letters.length > 0.6;
}

function hasRepeatedCharacters(message) {
  return REPEATED_CHARACTER_PATTERN.test(message);
}

function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase().trim();
  return Boolean(domain && DISPOSABLE_EMAIL_DOMAINS.has(domain));
}

export function isLikelySpam({ email, message, name }) {
  const reasons = [];

  if (excessiveLinks(message)) {
    reasons.push('excessive-links');
  }
  if (containsSpamKeyword(message) || containsSpamKeyword(name)) {
    reasons.push('blocklisted-keyword');
  }
  if (excessiveCaps(message)) {
    reasons.push('excessive-caps');
  }
  if (hasRepeatedCharacters(message)) {
    reasons.push('repeated-characters');
  }
  if (isDisposableEmail(email)) {
    reasons.push('disposable-email');
  }

  return { reasons, spam: reasons.length > 0 };
}
