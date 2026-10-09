// src/config/weather.ts is shared with the browser widget and annotates one
// constant with a DOM-only type. The Worker never uses that constant, so a
// structural stand-in is enough to type-check the shared file here without
// pulling the whole DOM library into the Worker's runtime types.
interface IntersectionObserverInit {
  root?: unknown;
  rootMargin?: string;
  threshold?: number | number[];
}
