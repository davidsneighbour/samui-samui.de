/** Keep shared navigation available while content scrolls, releasing at the footer. */
export function installStickyNavigation(): void {
  let cleanup: (() => void) | undefined;

  function initialise(): void {
    cleanup?.();
    cleanup = undefined;
    const navigation = document.querySelector<HTMLElement>(
      '[data-header-navigation]',
    );
    if (!navigation) return;
    const cleanupIndicator = installNavigationIndicator(navigation);
    const cleanupCompact = installCompactNavigation(navigation);
    const footer = document.querySelector<HTMLElement>('body > footer');
    const root = document.documentElement;
    let footerVisible = false;
    let active = true;

    function updateInset(): void {
      if (!navigation || !active) return;
      const released = footerVisible && !navigation.matches(':focus-within');
      root.style.setProperty(
        '--header-navigation-height',
        `${released ? 0 : navigation.getBoundingClientRect().height}px`,
      );
    }
    function updateFooter(visible: boolean): void {
      footerVisible = visible;
      navigation?.toggleAttribute('data-footer-visible', visible);
      updateInset();
    }
    function updateFocus(): void {
      // focusout fires before focus moves to the next control.
      queueMicrotask(updateInset);
    }
    if (footer) {
      const bounds = footer.getBoundingClientRect();
      updateFooter(bounds.top < innerHeight && bounds.bottom > 0);
    }
    const footerObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry) updateFooter(entry.isIntersecting);
    });
    if (footer) footerObserver.observe(footer);
    const sizeObserver = new ResizeObserver(updateInset);
    sizeObserver.observe(navigation);
    navigation.addEventListener('focusin', updateFocus);
    navigation.addEventListener('focusout', updateFocus);
    updateInset();

    cleanup = (): void => {
      active = false;
      cleanupIndicator();
      cleanupCompact();
      footerObserver.disconnect();
      sizeObserver.disconnect();
      navigation.removeEventListener('focusin', updateFocus);
      navigation.removeEventListener('focusout', updateFocus);
      navigation.removeAttribute('data-footer-visible');
      root.style.removeProperty('--header-navigation-height');
    };
  }

  document.addEventListener('astro:before-swap', () => {
    cleanup?.();
    cleanup = undefined;
  });
  document.addEventListener('astro:page-load', initialise);
  initialise();
}

/** Measure the shared underline without changing link layout or current-page semantics. */
function installNavigationIndicator(navigation: HTMLElement): () => void {
  const group = navigation.querySelector<HTMLElement>(
    '[data-navigation-links]',
  );
  const indicator = group?.querySelector<HTMLElement>(
    '[data-navigation-indicator]',
  );
  if (!group || !indicator)
    return () => {
      /* No indicator to clean up. */
    };
  const links = Array.from(group.querySelectorAll<HTMLAnchorElement>('a'));
  const current = links.find(
    (link) => link.getAttribute('aria-current') === 'page',
  );
  const hoverPointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let hovered: HTMLAnchorElement | undefined;
  let disposed = false;

  function update(instant = false): void {
    if (!group || !indicator || disposed) return;
    const focused = links.find((link) => link.matches(':focus-visible'));
    const target = hovered ?? focused ?? current;
    group.toggleAttribute(
      'data-indicator-instant',
      instant || Boolean(focused) || reducedMotion.matches,
    );
    if (!target) {
      indicator.style.opacity = '0';
      return;
    }
    const parent = group.getBoundingClientRect();
    const bounds = target.getBoundingClientRect();
    const lift = hovered && !reducedMotion.matches ? 2 : 0;
    indicator.style.transform = `translate(${bounds.left - parent.left}px, ${bounds.bottom - parent.top - 2 - lift}px) scaleX(${bounds.width})`;
    indicator.style.opacity = '1';
  }
  function enter(event: PointerEvent): void {
    if (!hoverPointer.matches || event.pointerType === 'touch') return;
    hovered = links.find((link) => link.contains(event.target as Node));
    update();
  }
  function leave(): void {
    hovered = undefined;
    update();
  }
  function focus(): void {
    queueMicrotask(() => update(true));
  }
  function resize(): void {
    update(true);
  }
  group.addEventListener('pointerover', enter);
  navigation.addEventListener('pointerleave', leave);
  group.addEventListener('focusin', focus);
  group.addEventListener('focusout', focus);
  hoverPointer.addEventListener('change', leave);
  reducedMotion.addEventListener('change', resize);
  const observer = new ResizeObserver(resize);
  observer.observe(group);
  for (const link of links) observer.observe(link);
  update(true);
  group.setAttribute('data-indicator-ready', '');
  return () => {
    disposed = true;
    observer.disconnect();
    group.removeEventListener('pointerover', enter);
    navigation.removeEventListener('pointerleave', leave);
    group.removeEventListener('focusin', focus);
    group.removeEventListener('focusout', focus);
    hoverPointer.removeEventListener('change', leave);
    reducedMotion.removeEventListener('change', resize);
  };
}

/** On phones, fold links and search behind two toggles so the sticky bar stays one row. */
function installCompactNavigation(navigation: HTMLElement): () => void {
  const nav = navigation.querySelector<HTMLElement>('.header-nav');
  const menuButton =
    nav?.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const searchButton = nav?.querySelector<HTMLButtonElement>(
    '[data-search-toggle]',
  );
  if (!nav || !menuButton || !searchButton)
    return () => {
      /* No compact controls to clean up. */
    };
  const panels = [
    {
      attribute: 'data-menu-open',
      button: menuButton,
      closed: 'Menü öffnen',
      open: 'Menü schließen',
    },
    {
      attribute: 'data-search-open',
      button: searchButton,
      closed: 'Suche öffnen',
      open: 'Suche schließen',
    },
  ] as const;
  type Panel = (typeof panels)[number];

  function set(panel: Panel, open: boolean): void {
    nav?.toggleAttribute(panel.attribute, open);
    panel.button.setAttribute('aria-expanded', String(open));
    panel.button.setAttribute('aria-label', open ? panel.open : panel.closed);
  }
  function toggle(panel: Panel): void {
    const open = !nav?.hasAttribute(panel.attribute);
    for (const other of panels) set(other, other === panel && open);
    if (open && panel.button === searchButton) {
      // Pagefind renders its input asynchronously inside the searchbox.
      requestAnimationFrame(() =>
        nav?.querySelector<HTMLInputElement>('.header-search input')?.focus(),
      );
    }
  }
  const handlers = panels.map((panel) => {
    const handler = (): void => toggle(panel);
    panel.button.addEventListener('click', handler);
    return { handler, panel };
  });
  function keydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    const panel = panels.find((item) => nav?.hasAttribute(item.attribute));
    if (!panel) return;
    set(panel, false);
    panel.button.focus();
  }
  nav.addEventListener('keydown', keydown);
  for (const panel of panels) panel.button.hidden = false;
  nav.setAttribute('data-compact', '');

  return () => {
    for (const { handler, panel } of handlers) {
      panel.button.removeEventListener('click', handler);
      set(panel, false);
    }
    nav.removeEventListener('keydown', keydown);
  };
}
