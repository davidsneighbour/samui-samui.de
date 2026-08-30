# Contact form

The contact page renders editorial copy in the normal prose wrapper, but `src/components/features/contact/ContactForm.astro` sits outside that wrapper so form controls and helper text can keep their compact spacing.

The form posts to the Netlify Function in `src/netlify/functions/contact.mjs`. Function helpers live beside it in `src/netlify/functions/lib/`, and the React Email notification template lives in `src/netlify/emails/contact-notification.tsx` so the whole contact-delivery surface stays under the Netlify source tree.

Links inside the form therefore do not receive `prose-a:text-link` automatically. Any form-local legal or helper copy with anchors must style those anchors with the global `link` token so the contact page keeps the same reddish link treatment as the surrounding Markdown.

Text inputs and textareas intentionally use the normal 16px body size rather than the compact helper-text size. This avoids iOS Safari's focused-field zoom while labels and legal copy can remain visually smaller.

Submit feedback uses the existing `muted`, `border`, `primary`, and `link` tokens instead of standalone success/error hex colors. The message text carries the actual result, while the left border gives a compact visual cue without adding a new semantic color palette.

Cloudflare Turnstile legal copy is shown only when `TURNSTILE_SITE_KEY` is set. Its privacy-policy and terms links are colored with `var(--color-link)` and underlined in the component stylesheet because the disclaimer is not prose content.
