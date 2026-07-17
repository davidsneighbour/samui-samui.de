// Shared Tailwind Typography classes for rendering markdown content inside a
// --color-card surface. Centralized because @tailwindcss/typography's
// default palette assumes a light page background -- unscoped `class="prose"`
// on this site's dark body renders illegibly (dark-on-dark), so every prose
// block site-wide must carry these card-aware overrides.
export const proseClasses =
  'prose prose-neutral mx-auto max-w-none prose-headings:font-normal prose-headings:text-card-foreground prose-a:text-link prose-a:no-underline prose-a:hover:underline prose-strong:text-card-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-img:rounded-(--radius)';
