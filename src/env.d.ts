/// <reference types="astro/client" />

declare global {
  interface Window {
    // Matomo's tracker queue, pushed to by Analytics.astro. Optional because
    // it is only defined when analytics has loaded (see AGENTS.md § Analytics).
    _paq?: unknown[][];
  }
}

export {};
