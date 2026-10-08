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
