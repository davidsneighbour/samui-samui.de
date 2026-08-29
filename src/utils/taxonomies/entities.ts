import type { CollectionEntry } from 'astro:content';

export type EntityCollectionName =
  | 'leute'
  | 'orte'
  | 'ereignisse'
  | 'feiertage';
export type TaxonomyReference<
  C extends EntityCollectionName = EntityCollectionName,
> =
  | string
  | {
      collection: C;
      id: string;
    };

export interface TaxonomyLink {
  href: string;
  label: string;
}

export interface PostTaxonomyGroup {
  label: string;
  items: TaxonomyLink[];
}

type EntityEntry<C extends EntityCollectionName> = CollectionEntry<C>;

export function getReferenceId(reference: TaxonomyReference): string {
  return typeof reference === 'string' ? reference : reference.id;
}

export function isPublicEntity(entry: {
  data: { draft?: boolean | undefined };
}): boolean {
  return entry.data.draft !== true;
}

export function entityHref(
  collection: EntityCollectionName,
  id: string,
): string {
  if (collection === 'feiertage') return '/feiertage/';
  return `/${collection}/${id}/`;
}

export function entityFallbackDescription(
  collection: EntityCollectionName,
  title: string,
): string {
  if (collection === 'orte') return `Beiträge über den Ort ${title}`;
  if (collection === 'ereignisse') {
    return `Beiträge zum Ereignis ${title}`;
  }
  return `Beiträge über ${title}`;
}

export function getEntityDescription<C extends EntityCollectionName>(
  collection: C,
  entry: EntityEntry<C>,
): string {
  return (
    entry.data.description ??
    entityFallbackDescription(collection, entry.data.title)
  );
}

export function groupPostsByEntity<C extends EntityCollectionName>(
  posts: CollectionEntry<'posts'>[],
  collection: C,
  entityId: string,
): CollectionEntry<'posts'>[] {
  return posts
    .filter((post) =>
      (post.data[collection] as TaxonomyReference<C>[] | undefined)?.some(
        (reference) => getReferenceId(reference) === entityId,
      ),
    )
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

function entityTitleMap<C extends EntityCollectionName>(
  entries: EntityEntry<C>[],
): Map<string, EntityEntry<C>> {
  return new Map(entries.map((entry) => [entry.id, entry]));
}

function resolveEntityLinks<C extends EntityCollectionName>(
  references: TaxonomyReference<C>[] | undefined,
  collection: C,
  entries: EntityEntry<C>[],
): TaxonomyLink[] {
  const byId = entityTitleMap(entries);
  return (references ?? []).map((reference) => {
    const id = getReferenceId(reference);
    const entry = byId.get(id);
    if (!entry) {
      throw new Error(
        `Fehlende Taxonomie-Referenz: ${collection}:${id}. Fuehre npm run validate:taxonomies aus.`,
      );
    }
    return {
      href: entityHref(collection, id),
      label: entry.data.title,
    };
  });
}

export function resolvePostTaxonomyGroups(options: {
  post: CollectionEntry<'posts'>;
  feiertage: CollectionEntry<'feiertage'>[];
  leute: CollectionEntry<'leute'>[];
  orte: CollectionEntry<'orte'>[];
  ereignisse: CollectionEntry<'ereignisse'>[];
}): PostTaxonomyGroup[] {
  const groups: PostTaxonomyGroup[] = [
    {
      items: resolveEntityLinks(options.post.data.orte, 'orte', options.orte),
      label: 'Orte',
    },
    {
      items: resolveEntityLinks(
        options.post.data.ereignisse,
        'ereignisse',
        options.ereignisse,
      ),
      label: 'Ereignisse',
    },
    {
      items: resolveEntityLinks(
        options.post.data.feiertage,
        'feiertage',
        options.feiertage,
      ),
      label: 'Feiertage',
    },
    {
      items: resolveEntityLinks(
        options.post.data.leute,
        'leute',
        options.leute,
      ),
      label: 'Personen',
    },
  ];

  return groups.filter((group) => group.items.length > 0);
}

export function sortEntitiesByTitle<C extends EntityCollectionName>(
  entries: EntityEntry<C>[],
): EntityEntry<C>[] {
  return [...entries].sort((a, b) =>
    a.data.title.localeCompare(b.data.title, 'de-DE'),
  );
}
