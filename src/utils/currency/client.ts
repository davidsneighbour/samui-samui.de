import { formatConversion, validateAmount } from './conversion';
import { type CurrencyRate, createRateService } from './rate';

const service = createRateService({
  fetch: window.fetch.bind(window),
  storage: () => window.localStorage,
});

function enhance(element: HTMLElement, rate: CurrencyRate) {
  try {
    const currency = element.getAttribute('currency') ?? '';
    const raw = element.getAttribute('amount');
    if (raw === null || raw.trim() === '') return;
    const amount = Number(raw);
    validateAmount(amount, currency);
    const label = formatConversion(amount, currency, rate.rate);
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
      // Runtime-only IDs never enter static build checksums.
      content.id = `currency-tooltip-${Array.from(document.querySelectorAll('dnb-currency')).indexOf(element)}`;
      trigger.setAttribute('aria-describedby', content.id);
      trigger.addEventListener('click', () => trigger.focus());
      element.classList.add('tooltip', 'inline-flex');
      element.dataset['tooltip'] = '';
      element.dataset['tooltipPlacement'] = 'top';
      element.append(trigger, content);
    }
    content.textContent = label;
    element.dataset['currencyReady'] = '';
  } catch {
    /* Invalid input leaves the original amount readable. */
  }
}

export function initialiseCurrencies() {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>('dnb-currency'),
  );
  if (!elements.length) return;
  const { rate, updated } = service.lookup();
  if (rate) for (const element of elements) enhance(element, rate);
  void updated.then((newRate) => {
    if (newRate)
      for (const element of elements)
        if (element.isConnected) enhance(element, newRate);
  });
}

initialiseCurrencies();
document.addEventListener('astro:page-load', initialiseCurrencies);
