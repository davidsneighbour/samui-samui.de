import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, it } from 'vitest';
import Currency from '../components/content/currency/Currency.astro';

it('renders a complete original amount without JavaScript in both directions', async () => {
  const container = await AstroContainer.create();
  const thb = await container.renderToString(Currency, {
    props: { amount: 1000, currency: 'THB' },
  });
  expect(thb).toContain('amount="1000" currency="THB"');
  expect(thb).toContain('1.000\u00a0฿');
  expect(thb).not.toContain('tabindex');
  const eur = await container.renderToString(Currency, {
    props: { amount: 25, currency: 'EUR' },
    slots: { default: '25 €' },
  });
  expect(eur).toContain('25 €');
});
