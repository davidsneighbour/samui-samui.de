import { isValidLucideIconName } from './icons';
import { DEFAULT_REGISTRY_PATH, loadNoticeRegistry } from './registry';
import type { NoticeVariant } from './schema';

export const DEFAULT_DISMISS_LABEL = 'Hinweis schließen';
export const DEFAULT_VARIANT: NoticeVariant = 'note';

export interface NoticeOverrides {
  /** Component body / `<dnb-notice>` element body content, used as a description override. */
  bodyDescription?: string | undefined;
  /** Explicit `description` prop/attribute -- highest-precedence description source. */
  description?: string | undefined;
  dismissible?: boolean | undefined;
  dismissLabel?: string | undefined;
  icon?: string | undefined;
  slug?: string | undefined;
  /** Included in error messages when available (e.g. the post's file path). */
  sourceFile?: string | undefined;
  title?: string | undefined;
  variant?: NoticeVariant | undefined;
}

export type NoticeDescriptionSource = 'prop' | 'body' | 'registry';

export interface ResolvedNotice {
  description: string;
  /**
   * Where the winning `description` came from. Both integration points
   * treat `prop`/`registry` descriptions as Markdown source and render
   * them through `renderNoticeDescription()`. `body` means the winning
   * value came from `overrides.bodyDescription`: the plain-Markdown
   * `<dnb-notice>` transform extracts raw Markdown source there too (so it
   * renders the same way), but the MDX `<Notice>` component's default
   * slot is already-compiled HTML by the time Astro sees it -- see
   * Notice.astro, which uses the rendered slot output directly instead of
   * re-running it through the Markdown pipeline when this is `'body'`.
   */
  descriptionSource: NoticeDescriptionSource;
  dismissible: boolean;
  dismissLabel: string;
  icon: string;
  title: string;
  variant: NoticeVariant;
}

function locationSuffix(overrides: NoticeOverrides): string {
  const parts: string[] = [];
  if (overrides.slug) parts.push(`slug "${overrides.slug}"`);
  if (overrides.sourceFile) parts.push(`in ${overrides.sourceFile}`);
  return parts.length > 0 ? ` (${parts.join(', ')})` : '';
}

function resolveDescription(
  overrides: NoticeOverrides,
  registryDescription: string | undefined,
) {
  if (overrides.description !== undefined) {
    return { source: 'prop' as const, value: overrides.description };
  }
  if (overrides.bodyDescription !== undefined) {
    return { source: 'body' as const, value: overrides.bodyDescription };
  }
  if (registryDescription !== undefined) {
    return { source: 'registry' as const, value: registryDescription };
  }
  return undefined;
}

/**
 * Resolves a `<Notice>` / `<dnb-notice>` usage against the notice registry,
 * applying the documented precedence: explicit property > body-content
 * description override > registry value > component default. Shared by
 * both the MDX component and the plain-Markdown rehype transform so they
 * can never drift apart -- see documentation/notices.md.
 */
export function resolveNotice(
  overrides: NoticeOverrides,
  registryPath = DEFAULT_REGISTRY_PATH,
): ResolvedNotice {
  const registry = loadNoticeRegistry(registryPath);

  const base = overrides.slug ? registry[overrides.slug] : undefined;
  if (overrides.slug && !base) {
    const slugs = Object.keys(registry).sort();
    throw new Error(
      `Unknown notice slug "${overrides.slug}"${overrides.sourceFile ? ` in ${overrides.sourceFile}` : ''}.\n` +
        `Valid slugs: ${slugs.length > 0 ? slugs.join(', ') : '(the notice registry is empty)'}`,
    );
  }

  const title = overrides.title ?? base?.title;
  const description = resolveDescription(overrides, base?.description);
  const icon = overrides.icon ?? base?.icon;
  const variant = overrides.variant ?? base?.variant ?? DEFAULT_VARIANT;
  const dismissible = overrides.dismissible ?? base?.dismissible ?? false;
  const dismissLabel = overrides.dismissLabel ?? DEFAULT_DISMISS_LABEL;

  const missing = [
    !title && 'title',
    !description && 'description',
    !icon && 'icon',
  ].filter((value): value is string => Boolean(value));
  if (missing.length > 0) {
    throw new Error(
      `Notice is missing required field(s): ${missing.join(', ')}${locationSuffix(overrides)}.`,
    );
  }

  if (!isValidLucideIconName(icon as string)) {
    throw new Error(
      `Unsupported Lucide icon "${icon}"${locationSuffix(overrides)}.`,
    );
  }

  return {
    description: (description as NonNullable<typeof description>).value,
    descriptionSource: (description as NonNullable<typeof description>).source,
    dismissible,
    dismissLabel,
    icon: icon as string,
    title: title as string,
    variant,
  };
}
