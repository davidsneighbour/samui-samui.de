/**
 * Short German location label for a search result, derived from its URL, for
 * example `Blog › 2006 › Februar` or `Archiv › Themen`. It is not a full
 * breadcrumb: it only tells the reader what kind of page a result is.
 * Runs in the browser (search result template), so it has no dependencies.
 */

const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

const SECTIONS: Record<string, string> = {
  archiv: 'Archiv',
  'digitale-archaeologie': 'Digitale Archäologie',
  feiertage: 'Feiertage',
  iumas: 'IUMAS',
  kleingedrucktes: 'Kleingedrucktes',
  kontakt: 'Kontakt',
  suche: 'Suche',
  timeline: 'Timeline',
  'ueber-mich': 'Über mich',
};

const ARCHIVE_SECTIONS: Record<string, string> = {
  ereignisse: 'Ereignisse',
  orte: 'Orte',
  personen: 'Personen',
  relikte: 'Relikte',
  themen: 'Themen',
};

export function searchResultCrumb(url: string): string[] {
  const path = new URL(url, 'https://samui-samui.de').pathname;
  const [first, second] = path.split('/').filter(Boolean);
  if (!first) return ['Startseite'];

  if (/^\d{4}$/.test(first)) {
    const month = MONTHS[Number(second) - 1];
    return month ? ['Blog', first, month] : ['Blog', first];
  }

  const section = SECTIONS[first];
  if (!section) return ['Seite'];
  if (first !== 'archiv' || !second) return [section];
  if (/^\d{4}$/.test(second)) return [section, second];
  const archiveSection = ARCHIVE_SECTIONS[second];
  return archiveSection ? [section, archiveSection] : [section];
}
