export function taxonomyEntryId(entry: string): string {
  return entry
    .replace(/\\/g, '/')
    .replace(/\/_index\.md$/, '')
    .replace(/\/index\.md$/, '')
    .replace(/\.md$/, '');
}
