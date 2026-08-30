import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import SiteAge from '../components/content/date/SiteAge.astro';

async function renderSiteAge(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(SiteAge, { props });
}

describe('SiteAge.astro', () => {
  it('renders a custom duration format', async () => {
    const html = await renderSiteAge({
      format: '%y Jahre, %m Monate, und %d Tage',
      sinceDate: '2005-01-08',
      untilDate: '2026-07-20',
    });

    expect(html).toBe('21 Jahre, 6 Monate, und 12 Tage');
  });

  it('renders a single total unit', async () => {
    const html = await renderSiteAge({
      sinceDate: '2005-01-08',
      unit: 'days',
      untilDate: '2026-07-20',
    });

    expect(html).toBe('7863');
  });
});
