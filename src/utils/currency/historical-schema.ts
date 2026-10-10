import { z } from 'zod';

export const calendarDate = z.iso.date();
const frontmatterDate = z.preprocess(
  (value) =>
    value instanceof Date && Number.isFinite(value.valueOf())
      ? value.toISOString().slice(0, 10)
      : value,
  calendarDate,
);
export const historicalCurrencySchema = z
  .object({
    base: z.literal('EUR').optional(),
    compareCurrent: z.boolean().default(false),
    dateBasis: z.enum(['publication', 'override']).optional(),
    mode: z.literal('historical'),
    provider: z.literal('ECB').optional(),
    quote: z.literal('THB').optional(),
    rate: z.number().positive().optional(),
    rateDate: frontmatterDate.optional(),
    requestedDate: frontmatterDate.optional(),
    resolvedFor: frontmatterDate.optional(),
    schema: z.literal(1).optional(),
    source: z.literal('frankfurter').optional(),
  })
  .strict()
  .refine(
    (value) =>
      !value.rateDate ||
      !value.requestedDate ||
      value.rateDate <= value.requestedDate,
    { message: 'Historical rateDate must not follow requestedDate.' },
  );
export type HistoricalCurrency = z.infer<typeof historicalCurrencySchema>;
