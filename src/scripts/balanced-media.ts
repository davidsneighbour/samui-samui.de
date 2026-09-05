// Progressive-enhancement behaviour for the non-featured BlogList.astro
// cards (documentation/components/blog-list-previews.md#balanced-media-width).
// Widens each card's media column (up to --balanced-media-width's 50% cap)
// so its rendered height approximately matches the content column's, using
// the pure search in @utils/balanced-media-width.
import { findBalancedMediaWidthRatio } from '@utils/balanced-media-width';

const CONTAINER_SELECTOR = '[data-balanced-media]';
const CONTENT_SELECTOR = ':scope > [data-balanced-media-content]';
const FIGURE_SELECTOR = ':scope > figure';
const CSS_VARIABLE = '--balanced-media-width';
// Matches the `md:` Tailwind breakpoint the two-column layout switches on.
const TWO_COLUMN_QUERY = '(min-width: 768px)';

function toPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(3)}%`;
}

// The figure itself is a flex item in a row, so by default it stretches
// (align-items: stretch) to match the row's height -- reading the figure's
// own height would always report the taller sibling's height, masking the
// real height difference this whole feature exists to close. The actual
// image/video element inside keeps its own aspect-ratio-driven height
// regardless of that stretch (it's laid out in normal flow inside the
// figure, not as a flex item itself), so measure that instead. Astro's dev
// server can additionally inline a component's hoisted <script> as a sibling
// inside the figure at its first usage, so skip non-visual children.
function findVisualMediaElement(figure: HTMLElement): HTMLElement | null {
  for (const child of figure.children) {
    if (child.tagName === 'SCRIPT' || child.tagName === 'FIGCAPTION') continue;
    return child as HTMLElement;
  }
  return null;
}

class BalancedMediaCard {
  readonly #container: HTMLElement;
  readonly #mediaEl: HTMLElement;
  readonly #contentEl: HTMLElement;
  readonly #resizeObserver: ResizeObserver;
  #scheduled = false;
  #ignoreObservations = false;

  constructor(
    container: HTMLElement,
    mediaEl: HTMLElement,
    contentEl: HTMLElement,
  ) {
    this.#container = container;
    this.#mediaEl = mediaEl;
    this.#contentEl = contentEl;

    // Observing all three catches viewport/breakpoint resizes (container),
    // and content reflow from causes other than our own writes -- fonts
    // swapping in, taxonomy labels wrapping differently, etc. (mediaEl and
    // contentEl). Writes made during our own #run() are guarded by
    // #ignoreObservations so they don't retrigger this callback.
    this.#resizeObserver = new ResizeObserver(() => {
      if (this.#ignoreObservations) return;
      this.schedule();
    });
    this.#resizeObserver.observe(this.#container);
    this.#resizeObserver.observe(this.#mediaEl);
    this.#resizeObserver.observe(this.#contentEl);
  }

  schedule(): void {
    if (this.#scheduled) return;
    this.#scheduled = true;
    requestAnimationFrame(() => {
      this.#scheduled = false;
      this.#run();
    });
  }

  #run(): void {
    if (!window.matchMedia(TWO_COLUMN_QUERY).matches) {
      // Single-column mobile layout: stay on the static one-third fallback.
      this.#container.style.removeProperty(CSS_VARIABLE);
      return;
    }

    this.#ignoreObservations = true;
    try {
      const result = findBalancedMediaWidthRatio((ratio) => {
        this.#container.style.setProperty(CSS_VARIABLE, toPercent(ratio));
        return {
          contentHeightPx: this.#contentEl.getBoundingClientRect().height,
          mediaHeightPx: this.#mediaEl.getBoundingClientRect().height,
        };
      });
      this.#container.style.setProperty(CSS_VARIABLE, toPercent(result.ratio));
    } finally {
      // Let the layout settle from the final write before trusting the
      // observers again, otherwise that write's own resize notification
      // would immediately reschedule another pass.
      requestAnimationFrame(() => {
        this.#ignoreObservations = false;
      });
    }
  }
}

function initBalancedMediaCards(): void {
  if (typeof ResizeObserver === 'undefined') return;

  const cards: BalancedMediaCard[] = [];
  const containers = document.querySelectorAll<HTMLElement>(CONTAINER_SELECTOR);

  for (const container of containers) {
    const figure = container.querySelector<HTMLElement>(FIGURE_SELECTOR);
    const contentEl = container.querySelector<HTMLElement>(CONTENT_SELECTOR);
    const mediaEl = figure && findVisualMediaElement(figure);
    if (!mediaEl || !contentEl) continue;

    const card = new BalancedMediaCard(container, mediaEl, contentEl);
    cards.push(card);
    card.schedule();
  }

  if (cards.length === 0) return;

  const twoColumnQuery = window.matchMedia(TWO_COLUMN_QUERY);
  twoColumnQuery.addEventListener('change', () => {
    for (const card of cards) card.schedule();
  });

  // Web fonts swapping in after first paint can shift line-wrap points,
  // changing content height without any element resizing in a way the
  // resize observers above would catch on their own initiative.
  void document.fonts?.ready?.then(() => {
    for (const card of cards) card.schedule();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBalancedMediaCards, {
    once: true,
  });
} else {
  initBalancedMediaCards();
}
