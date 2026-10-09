// Deterministic tooltip ids: a short hash of the tooltip text, plus a suffix
// when the same text appears more than once on one page. The counter is kept
// per page render (keyed by that render's `Astro.locals` object), so ids are
// unique within a page and identical across builds.

const pageCounters = new WeakMap<object, Map<string, number>>();

// 32-bit FNV-1a -- tiny, dependency-free, and stable across runtimes.
export function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function stableTooltipId(page: object, text: string): string {
  const base = `tooltip-${fnv1a(text)}`;
  let counters = pageCounters.get(page);
  if (!counters) {
    counters = new Map();
    pageCounters.set(page, counters);
  }
  const seen = counters.get(base) ?? 0;
  counters.set(base, seen + 1);
  return seen === 0 ? base : `${base}-${seen + 1}`;
}
