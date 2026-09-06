// Author life-stats for the "Lebenszeit, pedantisch aufgeteilt" footer graph
// (see src/content/sitewide/authorfooter/index.mdx). Both dates are fixed
// personal facts confirmed by Patrick, not editorial content -- do not infer
// or adjust them from other sources such as src/data/life-timeline.json,
// which is deliberately only year-precise for the map feature.
const MS_PER_DAY = 86_400_000;

export const AUTHOR_BIRTH_DATE = new Date(Date.UTC(1975, 6, 5));
export const AUTHOR_SAMUI_MOVE_DATE = new Date(Date.UTC(2005, 0, 8));

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export interface LifeStats {
  totalDays: number;
  preSamuiDays: number;
  samuiDays: number;
  samuiSharePercent: number;
  hasSamuiMajority: boolean;
  /** Days remaining until, or elapsed since, samuiDays first exceeds preSamuiDays. */
  daysUntilOrSinceSamuiMajority: number;
}

export function getLifeStats(referenceDate: Date = new Date()): LifeStats {
  const totalDays = daysBetween(AUTHOR_BIRTH_DATE, referenceDate);
  const preSamuiDays = daysBetween(AUTHOR_BIRTH_DATE, AUTHOR_SAMUI_MOVE_DATE);
  const samuiDays = totalDays - preSamuiDays;
  const samuiMajorityDay = preSamuiDays + 1;
  const hasSamuiMajority = samuiDays >= samuiMajorityDay;

  return {
    daysUntilOrSinceSamuiMajority: hasSamuiMajority
      ? samuiDays - samuiMajorityDay
      : samuiMajorityDay - samuiDays,
    hasSamuiMajority,
    preSamuiDays,
    samuiDays,
    samuiSharePercent: (samuiDays / totalDays) * 100,
    totalDays,
  };
}

export function formatNumberDE(value: number): string {
  return new Intl.NumberFormat('de-DE').format(value);
}

export function formatPercentDE(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}
