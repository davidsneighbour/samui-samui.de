// The shared `[data-tooltip]` hover/keyboard-focus controller, shared
// between `src/components/ui/tooltip.astro` (its own `<script is:inline
// set:html>`) and the plain-Markdown `<dnb-person>` rehype transform
// (src/scripts/rehype/person-link.ts, spliced as a `<script>` hast node),
// so any page with a `[data-tooltip]` element gets working hover/focus
// behaviour regardless of which integration point rendered it. Guarded by
// a `window` flag, so repeating this script for multiple tooltips on one
// page -- or one already rendered by `Tooltip.astro` -- is a harmless
// no-op rather than duplicate listeners. See documentation/components/tooltips.md.
export const TOOLTIP_CONTROLLER_SCRIPT = `(() => {
    if (window.__samuiTooltipController) return;
    window.__samuiTooltipController = true;

    const tooltipSelector = '[data-tooltip]';
    const triggerSelector = '[data-tooltip-trigger]';
    const contentSelector = '[data-tooltip-content]';
    const openTooltips = new Set();
    const margin = 16;
    const gap = 10;

    const getParts = (tooltip) => {
      const trigger = tooltip.querySelector(triggerSelector);
      const content = tooltip.querySelector(contentSelector);
      if (!(trigger instanceof HTMLElement)) return undefined;
      if (!(content instanceof HTMLElement)) return undefined;
      return { content, trigger };
    };

    const positionTooltip = (tooltip) => {
      const parts = getParts(tooltip);
      if (!parts) return;

      const { trigger, content } = parts;
      const triggerRect = trigger.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const triggerCenter = triggerRect.left + triggerRect.width / 2;
      const maxLeft = window.innerWidth - contentRect.width - margin;
      const left = Math.min(
        Math.max(triggerCenter - contentRect.width / 2, margin),
        Math.max(margin, maxLeft),
      );
      const placement =
        tooltip.dataset.tooltipPlacement === 'top' ? 'top' : 'bottom';
      const top =
        placement === 'top'
          ? Math.max(margin, triggerRect.top - contentRect.height - gap)
          : triggerRect.bottom + gap;
      const arrowLeft = Math.min(
        Math.max(triggerCenter - left, 12),
        contentRect.width - 12,
      );

      content.style.setProperty('--tooltip-left', \`\${left}px\`);
      content.style.setProperty('--tooltip-top', \`\${top}px\`);
      content.style.setProperty('--tooltip-arrow-left', \`\${arrowLeft}px\`);
    };

    const showTooltip = (tooltip) => {
      const parts = getParts(tooltip);
      if (!parts) return;

      positionTooltip(tooltip);
      tooltip.dataset.tooltipState = 'open';
      parts.content.setAttribute('aria-hidden', 'false');
      openTooltips.add(tooltip);
    };

    const hideTooltip = (tooltip) => {
      const parts = getParts(tooltip);
      if (!parts) return;

      delete tooltip.dataset.tooltipState;
      parts.content.setAttribute('aria-hidden', 'true');
      openTooltips.delete(tooltip);
    };

    const syncOpenTooltips = () => {
      openTooltips.forEach(positionTooltip);
    };

    const getTooltipFromTarget = (target) => {
      if (!(target instanceof Element)) return undefined;
      const trigger = target.closest(triggerSelector);
      const tooltip = trigger?.closest(tooltipSelector);
      return tooltip instanceof HTMLElement ? tooltip : undefined;
    };

    document.addEventListener('mouseover', (event) => {
      const tooltip = getTooltipFromTarget(event.target);
      const related = event.relatedTarget;
      const parts = tooltip ? getParts(tooltip) : undefined;
      if (!tooltip || !parts) return;
      if (related instanceof Node && parts.trigger.contains(related)) return;
      showTooltip(tooltip);
    });

    document.addEventListener('mouseout', (event) => {
      const tooltip = getTooltipFromTarget(event.target);
      const related = event.relatedTarget;
      const parts = tooltip ? getParts(tooltip) : undefined;
      if (!tooltip || !parts) return;
      if (related instanceof Node && parts.trigger.contains(related)) return;
      hideTooltip(tooltip);
    });

    document.addEventListener('focusin', (event) => {
      const tooltip = getTooltipFromTarget(event.target);
      if (tooltip) showTooltip(tooltip);
    });

    document.addEventListener('focusout', (event) => {
      const tooltip = getTooltipFromTarget(event.target);
      if (tooltip) hideTooltip(tooltip);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      openTooltips.forEach((tooltip) => {
        const parts = getParts(tooltip);
        hideTooltip(tooltip);
        parts?.trigger.blur();
      });
    });

    window.addEventListener('resize', syncOpenTooltips);
    window.addEventListener('scroll', syncOpenTooltips, true);
  })();`;
