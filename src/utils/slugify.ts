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
