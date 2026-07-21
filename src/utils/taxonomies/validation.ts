import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import { parseDocument } from 'yaml';
import { taxonomyEntryId } from './ids.ts';

export type ValidationField =
  | 'leute'
  | 'orte'
  | 'ereignisse'
  | 'parent'
  | 'aliases'
  | 'endDate';

export interface TaxonomyValidationIssue {
  file: string;
  field: ValidationField;
  reference: string;
  message: string;
}

interface EntityRecord {
  id: string;
  file: string;
  data: Record<string, unknown>;
}

interface LoadedCollections {
  leute: EntityRecord[];
  orte: EntityRecord[];
  ereignisse: EntityRecord[];
}

const registeredCollections = ['leute', 'orte', 'ereignisse'] as const;

function readFrontmatter(source: string): string | undefined {
  return /^---\n([\s\S]*?)\n---/.exec(source)?.[1];
}

function readYamlFrontmatter(file: string): Record<string, unknown> {
  const source = fs.readFileSync(file, 'utf8');
  const frontmatter = readFrontmatter(source);
  if (!frontmatter) return {};
  return (parseDocument(frontmatter).toJS() ?? {}) as Record<string, unknown>;
}

function referenceId(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (
    value &&
    typeof value === 'object' &&
    'id' in value &&
    typeof value.id === 'string'
  ) {
    return value.id;
  }
  return undefined;
}

function referenceList(data: Record<string, unknown>, field: string): string[] {
  const value = data[field];
  if (!Array.isArray(value)) return [];
  return value
    .map(referenceId)
    .filter((reference): reference is string => Boolean(reference));
}

function loadEntityCollection(
  root: string,
  collection: string,
): EntityRecord[] {
  const base = path.join(root, 'src/content', collection);
  if (!fs.existsSync(base)) return [];

  return globSync('**/_index.md', { cwd: base })
    .sort()
    .map((file) => {
      const absolute = path.join(base, file);
      return {
        data: readYamlFrontmatter(absolute),
        file: path.relative(root, absolute),
        id: taxonomyEntryId(file),
      };
    });
}

function loadRegisteredCollections(root: string): LoadedCollections {
  return {
    ereignisse: loadEntityCollection(root, 'ereignisse'),
    leute: loadEntityCollection(root, 'leute'),
    orte: loadEntityCollection(root, 'orte'),
  };
}

function entityIds(entries: EntityRecord[]): Set<string> {
  return new Set(entries.map((entry) => entry.id));
}

function validateReferenceList(options: {
  issues: TaxonomyValidationIssue[];
  file: string;
  field: ValidationField;
  ids: Set<string>;
  references: string[];
  collectionPath: string;
}): void {
  for (const reference of options.references) {
    if (options.ids.has(reference)) continue;
    options.issues.push({
      field: options.field,
      file: options.file,
      message: `Kein Eintrag in ${options.collectionPath}/ gefunden.`,
      reference,
    });
  }
}

function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date;
}

function validateAliasConflicts(
  issues: TaxonomyValidationIssue[],
  collection: keyof LoadedCollections,
  entries: EntityRecord[],
): void {
  const seen = new Map<string, EntityRecord>();

  for (const entry of entries) {
    const aliases = referenceList(entry.data, 'aliases');
    for (const alias of aliases) {
      const key = alias.toLocaleLowerCase('de-DE');
      const previous = seen.get(key);
      if (previous && previous.id !== entry.id) {
        issues.push({
          field: 'aliases',
          file: entry.file,
          message: `Alias kollidiert mit ${previous.file}.`,
          reference: `${collection}:${alias}`,
        });
      } else {
        seen.set(key, entry);
      }
    }
  }
}

export function validateTaxonomyIntegrity(
  root = process.cwd(),
): TaxonomyValidationIssue[] {
  const collections = loadRegisteredCollections(root);
  const ids = {
    ereignisse: entityIds(collections.ereignisse),
    leute: entityIds(collections.leute),
    orte: entityIds(collections.orte),
  };
  const issues: TaxonomyValidationIssue[] = [];

  const postsBase = path.join(root, 'src/content/posts');
  for (const file of globSync('**/index.md', { cwd: postsBase }).sort()) {
    const absolute = path.join(postsBase, file);
    const data = readYamlFrontmatter(absolute);
    const postId = file.replace(/\/index\.md$/, '');

    for (const collection of registeredCollections) {
      validateReferenceList({
        collectionPath: `src/content/${collection}`,
        field: collection,
        file: postId,
        ids: ids[collection],
        issues,
        references: referenceList(data, collection),
      });
    }
  }

  for (const place of collections.orte) {
    const parent = referenceId(place.data.parent);
    if (!parent) continue;
    validateReferenceList({
      collectionPath: 'src/content/orte',
      field: 'parent',
      file: place.file,
      ids: ids.orte,
      issues,
      references: [parent],
    });
  }

  for (const event of collections.ereignisse) {
    validateReferenceList({
      collectionPath: 'src/content/orte',
      field: 'orte',
      file: event.file,
      ids: ids.orte,
      issues,
      references: referenceList(event.data, 'orte'),
    });
    validateReferenceList({
      collectionPath: 'src/content/leute',
      field: 'leute',
      file: event.file,
      ids: ids.leute,
      issues,
      references: referenceList(event.data, 'leute'),
    });

    const startDate = parseDate(event.data.startDate);
    const endDate = parseDate(event.data.endDate);
    if (startDate && endDate && endDate.valueOf() < startDate.valueOf()) {
      issues.push({
        field: 'endDate',
        file: event.file,
        message: 'Das Ende eines Ereignisses liegt vor dem Start.',
        reference: String(event.data.endDate),
      });
    }
  }

  for (const collection of registeredCollections) {
    validateAliasConflicts(issues, collection, collections[collection]);
  }

  return issues;
}

export function formatTaxonomyValidationIssues(
  issues: TaxonomyValidationIssue[],
): string {
  if (issues.length === 0) {
    return 'Taxonomie-Referenzen sind gültig.';
  }

  const details = issues
    .map(
      (issue) => `- Beitrag/Eintrag: ${issue.file}
  Feld: ${issue.field}
  Referenz: ${issue.reference}
  Fehler: ${issue.message}`,
    )
    .join('\n\n');

  return `Fehlende oder ungültige Taxonomie-Referenzen gefunden:\n\n${details}\n\n${issues.length} ungültige Referenzen gefunden.`;
}
