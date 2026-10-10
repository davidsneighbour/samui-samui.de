export type Currency = 'THB' | 'EUR';

export function validateAmount(
  amount: number,
  currency: string,
): asserts currency is Currency {
  if (!Number.isFinite(amount) || (currency !== 'THB' && currency !== 'EUR')) {
    throw new Error('Currency requires a finite amount and THB or EUR.');
  }
}

export function convertCurrency(
  amount: number,
  currency: Currency,
  rate: number,
): number {
  validateAmount(amount, currency);
  if (!Number.isFinite(rate) || rate <= 0)
    throw new Error('Invalid currency rate.');
  const result = currency === 'THB' ? amount / rate : amount * rate;
  if (!Number.isFinite(result))
    throw new Error('Currency conversion overflow.');
  return result;
}

export function formatCurrency(amount: number, currency: Currency): string {
  validateAmount(amount, currency);
  const number = new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: currency === 'EUR' ? 2 : 0,
    minimumFractionDigits: currency === 'EUR' ? 2 : 0,
  }).format(amount);
  return `${number}\u00a0${currency === 'EUR' ? '€' : '฿'}`;
}

export function formatConversion(
  amount: number,
  currency: Currency,
  rate: number,
): string {
  return `ca. ${formatCurrency(convertCurrency(amount, currency, rate), currency === 'THB' ? 'EUR' : 'THB')}`;
}
