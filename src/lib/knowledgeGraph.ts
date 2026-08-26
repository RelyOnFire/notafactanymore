import type { CollectionEntry } from 'astro:content';
import { categoryLabel, statusLabel, translationMatchesEntry, type SiteLocale } from './i18n';

export type KnowledgeNodeKind = 'claim' | 'concept' | 'category';
export type KnowledgeEdgeKind = 'category' | 'concept' | 'related-concept';

export interface KnowledgeNode {
  id: string;
  sourceId: string;
  kind: KnowledgeNodeKind;
  label: string;
  summary?: string;
  category?: string;
  categoryLabel?: string;
  status?: string;
  statusLabel?: string;
  timelineYear?: number;
  changedApproximately?: string;
  href?: string;
  weight: number;
  x: number;
  y: number;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  kind: KnowledgeEdgeKind;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  claimCount: number;
  conceptCount: number;
  categoryCount: number;
}

type Entry = CollectionEntry<'entries'>;
type EntryTranslation = CollectionEntry<'entryTranslations'>;
type GlossaryEntry = CollectionEntry<'glossary'>;
type GlossaryTranslation = CollectionEntry<'glossaryTranslations'>;

const GLOSSARY_REF_PATTERN = /glossary:([a-z0-9][a-z0-9-]*)/g;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const stableHash = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const refsForEntry = (entry: Entry) => {
  const text = `${JSON.stringify(entry.data)}\n${entry.body ?? ''}`;
  const ids = new Set<string>();
  GLOSSARY_REF_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = GLOSSARY_REF_PATTERN.exec(text)) !== null) ids.add(match[1]);
  return [...ids];
};

const edgeId = (kind: KnowledgeEdgeKind, source: string, target: string) => {
  const [a, b] = kind === 'related-concept' && source > target
    ? [target, source]
    : [source, target];
  return `${kind}:${a}:${b}`;
};

export const buildKnowledgeGraph = ({
  entries,
  glossaryEntries,
  entryTranslations = [],
  glossaryTranslations = [],
  locale = 'en',
}: {
  entries: Entry[];
  glossaryEntries: GlossaryEntry[];
  entryTranslations?: EntryTranslation[];
  glossaryTranslations?: GlossaryTranslation[];
  locale?: SiteLocale;
}): KnowledgeGraphData => {
  const localizedEntries = new Map<string, EntryTranslation>();
  if (locale === 'de') {
    for (const translation of entryTranslations) {
      if (translation.data.locale !== 'de') continue;
      const entry = entries.find((candidate) => candidate.id === translation.data.entryId);
      if (entry && translationMatchesEntry(entry, translation)) localizedEntries.set(entry.id, translation);
    }
  }

  const localizedGlossary = new Map<string, GlossaryTranslation>();
  if (locale === 'de') {
    const glossaryById = new Map(glossaryEntries.map((entry) => [entry.id, entry]));
    for (const translation of glossaryTranslations) {
      if (translation.data.locale !== 'de') continue;
      const source = glossaryById.get(translation.data.entryId);
      if (
        source &&
        translation.data.sourceReviewedAt.getTime() === source.data.reviewedAt.getTime()
      ) {
        localizedGlossary.set(source.id, translation);
      }
    }
  }

  const entryRefs = new Map(entries.map((entry) => [entry.id, refsForEntry(entry)]));
  const usedConceptIds = new Set([...entryRefs.values()].flat());
  const glossaryById = new Map(glossaryEntries.map((entry) => [entry.id, entry]));

  const categoryGroups = [...new Set(entries.map((entry) => entry.data.category))]
    .map((category) => ({
      category,
      label: categoryLabel(category, locale),
      entries: entries.filter((entry) => entry.data.category === category),
    }))
    .sort((a, b) =>
      b.entries.length - a.entries.length || a.label.localeCompare(b.label, locale)
    );

  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  const positions = new Map<string, { x: number; y: number }>();
  const claimsByConcept = new Map<string, string[]>();

  categoryGroups.forEach((group, categoryIndex) => {
    const angle = categoryIndex * GOLDEN_ANGLE;
    const radius = categoryIndex === 0 ? 0 : 245 + 245 * Math.sqrt(categoryIndex);
    const center = {
      x: Math.cos(angle) * radius * 1.2,
      y: Math.sin(angle) * radius * 0.82,
    };
    const categoryNodeId = `category:${group.category}`;

    positions.set(categoryNodeId, center);
    nodes.push({
      id: categoryNodeId,
      sourceId: group.category,
      kind: 'category',
      label: group.label,
      weight: group.entries.length,
      x: center.x,
      y: center.y,
      href: `${locale === 'de' ? '/de' : ''}/categories/${encodeURIComponent(group.category.toLowerCase())}/`,
    });

    const sortedEntries = [...group.entries].sort((a, b) =>
      a.data.timelineYear - b.data.timelineYear || a.id.localeCompare(b.id)
    );

    sortedEntries.forEach((entry, claimIndex) => {
      const localAngle = claimIndex * GOLDEN_ANGLE + (stableHash(entry.id) % 360) * (Math.PI / 180);
      const localRadius = 72 + 34 * Math.sqrt(claimIndex + 1);
      const position = {
        x: center.x + Math.cos(localAngle) * localRadius,
        y: center.y + Math.sin(localAngle) * localRadius,
      };
      const claimNodeId = `claim:${entry.id}`;
      const translation = localizedEntries.get(entry.id);

      positions.set(claimNodeId, position);
      nodes.push({
        id: claimNodeId,
        sourceId: entry.id,
        kind: 'claim',
        label: translation?.data.claim ?? entry.data.claim,
        summary: translation?.data.summary ?? entry.data.summary,
        category: entry.data.category,
        categoryLabel: categoryLabel(entry.data.category, locale),
        status: entry.data.status,
        statusLabel: statusLabel(entry.data.status, locale),
        timelineYear: entry.data.timelineYear,
        changedApproximately:
          translation?.data.changedApproximately ?? entry.data.changedApproximately,
        href: `${locale === 'de' ? '/de' : ''}/entries/${entry.id}/`,
        weight: 1,
        x: position.x,
        y: position.y,
      });

      edges.push({
        id: edgeId('category', claimNodeId, categoryNodeId),
        source: claimNodeId,
        target: categoryNodeId,
        kind: 'category',
      });

      for (const conceptId of entryRefs.get(entry.id) ?? []) {
        if (!glossaryById.has(conceptId)) continue;
        const connected = claimsByConcept.get(conceptId) ?? [];
        connected.push(claimNodeId);
        claimsByConcept.set(conceptId, connected);
      }
    });
  });

  const conceptNodes: KnowledgeNode[] = [];
  [...usedConceptIds].sort().forEach((conceptId) => {
    const source = glossaryById.get(conceptId);
    if (!source) return;
    const linkedClaims = claimsByConcept.get(conceptId) ?? [];
    if (linkedClaims.length === 0) return;

    const claimPositions = linkedClaims
      .map((id) => positions.get(id))
      .filter((position): position is { x: number; y: number } => Boolean(position));
    const meanX = claimPositions.reduce((sum, position) => sum + position.x, 0) / claimPositions.length;
    const meanY = claimPositions.reduce((sum, position) => sum + position.y, 0) / claimPositions.length;
    const hash = stableHash(conceptId);
    const offsetAngle = (hash % 360) * (Math.PI / 180);
    const offsetRadius = linkedClaims.length > 1 ? 58 : 38;
    const position = {
      x: meanX + Math.cos(offsetAngle) * offsetRadius,
      y: meanY + Math.sin(offsetAngle) * offsetRadius,
    };
    const translation = localizedGlossary.get(conceptId);
    const conceptNodeId = `concept:${conceptId}`;

    positions.set(conceptNodeId, position);
    conceptNodes.push({
      id: conceptNodeId,
      sourceId: conceptId,
      kind: 'concept',
      label: translation?.data.term ?? source.data.term,
      summary: translation?.data.shortDefinition ?? source.data.shortDefinition,
      href: `${locale === 'de' ? '/de' : ''}/glossary/#${conceptId}`,
      weight: linkedClaims.length,
      x: position.x,
      y: position.y,
    });

    for (const claimNodeId of linkedClaims) {
      edges.push({
        id: edgeId('concept', claimNodeId, conceptNodeId),
        source: claimNodeId,
        target: conceptNodeId,
        kind: 'concept',
      });
    }
  });

  nodes.push(...conceptNodes);

  const conceptNodeIds = new Set(conceptNodes.map((node) => node.id));
  const relatedEdgeIds = new Set<string>();
  for (const source of glossaryEntries) {
    const sourceNodeId = `concept:${source.id}`;
    if (!conceptNodeIds.has(sourceNodeId)) continue;

    for (const relatedId of source.data.relatedTerms) {
      const targetNodeId = `concept:${relatedId}`;
      if (!conceptNodeIds.has(targetNodeId)) continue;
      const id = edgeId('related-concept', sourceNodeId, targetNodeId);
      if (relatedEdgeIds.has(id)) continue;
      relatedEdgeIds.add(id);
      edges.push({ id, source: sourceNodeId, target: targetNodeId, kind: 'related-concept' });
    }
  }

  return {
    nodes,
    edges,
    claimCount: entries.length,
    conceptCount: conceptNodes.length,
    categoryCount: categoryGroups.length,
  };
};
