import { stableTooltipId } from '@utils/tooltip/stable-id';
import { describe, expect, it } from 'vitest';

describe('stableTooltipId', () => {
  it('is identical across builds for the same text', () => {
    expect(stableTooltipId({}, 'Aktualisiert am 10. September 2023')).toBe(
      stableTooltipId({}, 'Aktualisiert am 10. September 2023'),
    );
  });

  it('stays unique when one page repeats the same tooltip', () => {
    const page = {};
    const first = stableTooltipId(page, 'RSS');
    const second = stableTooltipId(page, 'RSS');
    expect(second).not.toBe(first);
    expect(second).toBe(`${first}-2`);
    expect(stableTooltipId(page, 'Andere')).not.toBe(first);
  });
});
