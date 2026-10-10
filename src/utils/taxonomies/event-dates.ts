import { z } from 'zod';

// Calendar dates have no time or timezone. This also emits format: date
// in Astro's generated editor schema, rather than format: date-time.
export const eventDateSchema = z.string().date();

interface DatedEvent {
  id: string;
  data: {
    title: string;
    startDate?: string | undefined;
  };
}

export function groupEventsByYear<T extends DatedEvent>(events: readonly T[]) {
  const sorted = [...events].sort((a, b) => {
    const aDate = a.data.startDate;
    const bDate = b.data.startDate;
    if (aDate && !bDate) return -1;
    if (!aDate && bDate) return 1;
    return (
      (bDate ?? '').localeCompare(aDate ?? '') ||
      a.data.title.localeCompare(b.data.title, 'de') ||
      a.id.localeCompare(b.id)
    );
  });
  const groups: { year: string | null; events: T[] }[] = [];
  for (const event of sorted) {
    const year = event.data.startDate?.slice(0, 4) ?? null;
    const previous = groups.at(-1);
    if (previous?.year === year) {
      previous.events.push(event);
    } else {
      groups.push({ events: [event], year });
    }
  }
  return groups;
}
