/**
 * Normalizes a free-form taxonomy term (tag, person name, ...) into a URL-safe
 * slug, matching Hugo's `urlize` behavior closely enough for our content:
 * lowercase, non-alphanumeric runs collapsed to a single hyphen, trimmed.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Turns a raw taxonomy term (typically kebab-case, e.g. from front matter or
 * a slug) into a display label, matching Hugo's `humanize` template func:
 * hyphens/underscores become spaces, and each word's first letter is
 * capitalized (e.g. "recht-und-ordnung" -> "Recht Und Ordnung"). Already
 * capitalized runs (acronyms like "TAT") are left as-is since only the first
 * letter is touched.
 */
export function humanize(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
