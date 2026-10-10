import { formatDate } from '../dates';
import { formatConversion, formatRateDate, validateAmount } from './conversion';
import {
  type ResolvedHistoricalCurrency,
  resolveHistoricalCurrency,
} from './historical';
import { type CurrencyRate, createRateService } from './rate';

const service = createRateService({
  fetch: window.fetch.bind(window),
  storage: () => window.localStorage,
});

function historicalRate(
  element: HTMLElement,
): ResolvedHistoricalCurrency | undefined {
  try {
    const raw = element
      .closest('[data-currency-history]')
      ?.getAttribute('data-currency-history');
    return raw ? resolveHistoricalCurrency(JSON.parse(raw)) : undefined;
  } catch {
    return undefined;
  }
}

function line(text: string, attribute?: string) {
  const node = document.createElement('span');
  node.className = 'block';
  node.textContent = text;
  if (attribute) node.setAttribute(attribute, '');
  return node;
}

function enhance(
  element: HTMLElement,
  current?: CurrencyRate,
  history?: ResolvedHistoricalCurrency,
) {
  try {
    const rate = history ?? current;
    if (!rate) return;
    const currency = element.getAttribute('currency') ?? '';
    const raw = element.getAttribute('amount');
    if (raw === null || raw.trim() === '') return;
    const amount = Number(raw);
    validateAmount(amount, currency);
    let content = element.querySelector<HTMLElement>('[data-tooltip-content]');
    if (!content) {
      const trigger = document.createElement('span');
      trigger.className =
        'tooltip__trigger inline-flex items-center justify-center focus-visible:focus-ring';
      trigger.dataset['tooltipTrigger'] = '';
      trigger.tabIndex = 0;
      trigger.append(...element.childNodes);
      content = document.createElement('span');
      content.className =
        'tooltip__content fixed z-50 w-max rounded-[calc(var(--radius)-4px)] border border-border bg-muted px-3 py-2 text-center text-xs leading-snug text-card-foreground opacity-0 shadow-md transition-[opacity,transform] duration-150 ease-out';
      content.dataset['tooltipContent'] = '';
      content.setAttribute('role', 'tooltip');
      content.setAttribute('aria-hidden', 'true');
      content.id = `currency-tooltip-${Array.from(document.querySelectorAll('dnb-currency')).indexOf(element)}`;
      trigger.setAttribute('aria-describedby', content.id);
      trigger.addEventListener('click', () => trigger.focus());
      element.classList.add('tooltip', 'inline-flex');
      element.dataset['tooltip'] = '';
      element.dataset['tooltipPlacement'] = 'top';
      element.append(trigger, content);
    }
    const comparison = history?.compareCurrent === true;
    const label = formatConversion(amount, currency, rate.rate);
    if (comparison) {
      content.classList.add('currency-comparison');
      if (typeof content.showPopover === 'function')
        content.setAttribute('popover', 'manual');
      const groups = document.createElement('span');
      groups.className = current
        ? 'grid grid-cols-2 gap-4 text-left'
        : 'grid grid-cols-1 text-left';
      const past = document.createElement('span');
      const pastValue = line(label, 'data-currency-conversion');
      pastValue.className = '';
      const pastHeading = line('Damals ');
      pastHeading.append(pastValue);
      past.append(
        pastHeading,
        line(formatDate(new Date(history.rateDate)), 'data-currency-rate-date'),
      );
      groups.append(past);
      if (current) {
        const today = document.createElement('span');
        const currentValue = line(
          formatConversion(amount, currency, current.rate),
          'data-currency-current-conversion',
        );
        currentValue.className = '';
        const currentHeading = line('Heute ');
        currentHeading.append(currentValue);
        today.append(
          currentHeading,
          line(
            formatDate(new Date(current.rateDate)),
            'data-currency-current-rate-date',
          ),
        );
        groups.append(today);
      }
      const source = line('EZB-Referenzkurs', 'data-currency-source');
      source.className = 'block mt-1 text-muted-foreground';
      // The source applies to both observations, so expose it only once.
      content.replaceChildren(groups, source);
    } else {
      content.replaceChildren(
        line(history ? `damals ${label}` : label, 'data-currency-conversion'),
        line(formatRateDate(rate.rateDate), 'data-currency-rate-date'),
      );
    }
    element.dataset['currencyReady'] = '';
    if (element.dataset['tooltipState'] === 'open')
      window.dispatchEvent(new Event('resize'));
  } catch {
    /* Preserve the original source amount. */
  }
}

export function initialiseCurrencies() {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>('dnb-currency'),
  );
  if (!elements.length) return;
  const entries = elements.map((element) => ({
    element,
    history: historicalRate(element),
  }));
  for (const { element, history } of entries)
    if (history) enhance(element, undefined, history);
  // Historical-only hints need no visitor network traffic at all.
  const dynamic = entries.filter(
    ({ history }) => !history || history.compareCurrent,
  );
  if (!dynamic.length) return;
  const { rate, updated } = service.lookup();
  if (rate)
    for (const { element, history } of dynamic) enhance(element, rate, history);
  void updated.then((newRate) => {
    if (newRate)
      for (const { element, history } of dynamic)
        if (element.isConnected) enhance(element, newRate, history);
  });
}

initialiseCurrencies();
document.addEventListener('astro:page-load', initialiseCurrencies);
