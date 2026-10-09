// Parses the answer to "which releases should be deleted?" in
// `npm run deploy:releases`. Pure, so it is unit-tested
// (src/test/deploy.test.ts).
//
//   a / all       every release except the live one
//   2,4  2 4  1-3 numbers and ranges from the printed list
//   q / empty     nothing

export type Selection =
  | { kind: 'none' }
  | { kind: 'indexes'; indexes: number[] }
  | { kind: 'invalid'; reason: string };

export function parseSelection(
  input: string,
  count: number,
  liveIndex: number | null,
): Selection {
  const answer = input.trim().toLowerCase();
  if (answer === '' || answer === 'q' || answer === 'quit') {
    return { kind: 'none' };
  }
  if (answer === 'a' || answer === 'all') {
    const indexes = Array.from(
      { length: count },
      (_, index) => index + 1,
    ).filter((index) => index !== liveIndex);
    return indexes.length > 0 ? { indexes, kind: 'indexes' } : { kind: 'none' };
  }

  const selected = new Set<number>();
  for (const part of answer.split(/[\s,]+/).filter(Boolean)) {
    const range = /^(\d+)-(\d+)$/.exec(part);
    const [from, to] = range
      ? [Number(range[1]), Number(range[2])]
      : [Number(part), Number(part)];
    if (!Number.isInteger(from) || !Number.isInteger(to) || from > to) {
      return { kind: 'invalid', reason: `"${part}" is not a number or range` };
    }
    for (let index = from; index <= to; index += 1) {
      if (index < 1 || index > count) {
        return { kind: 'invalid', reason: `${index} is not in the list` };
      }
      if (index === liveIndex) {
        return {
          kind: 'invalid',
          reason: `${index} is the live release and cannot be deleted`,
        };
      }
      selected.add(index);
    }
  }
  return { indexes: [...selected].sort((a, b) => a - b), kind: 'indexes' };
}
