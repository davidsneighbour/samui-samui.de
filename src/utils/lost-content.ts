import type { Element } from 'hast';
import { h } from 'hastscript';
import { z } from 'zod';

export const lostContentTypeSchema = z.enum([
  'text',
  'image',
  'video',
  'audio',
  'unknown',
]);
export type LostContentType = z.infer<typeof lostContentTypeSchema>;
const messages: Record<LostContentType, string> = {
  audio: 'Ursprüngliche Tonaufnahme nicht mehr verfügbar.',
  image: 'Ursprüngliche Abbildung nicht mehr verfügbar.',
  text: 'Originaltext nicht mehr rekonstruierbar.',
  unknown: 'Originalinhalt nicht mehr rekonstruierbar.',
  video: 'Ursprüngliches Video nicht mehr verfügbar.',
};

export function buildLostContent(
  type: LostContentType = 'unknown',
  language?: string,
): Element {
  lostContentTypeSchema.parse(type);
  let message = messages[type];
  if (language) {
    // The annotation is German, even when the missing original was not.
    const name = new Intl.DisplayNames(['de'], {
      fallback: 'none',
      type: 'language',
    }).of(language);
    if (!name) throw new Error(`Unknown lost-content language: ${language}`);
    message =
      type === 'text' && language === 'th'
        ? 'Thailändischer Originaltext nicht mehr rekonstruierbar.'
        : `${message} Originalsprache: ${name}.`;
  }
  return h(
    'span',
    {
      className: ['lost-content', 'italic'],
      'data-pagefind-ignore': '',
      lang: 'de',
      role: 'note',
    },
    `[${message}]`,
  );
}
