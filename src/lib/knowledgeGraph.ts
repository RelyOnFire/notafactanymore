import type { CollectionEntry } from 'astro:content';
import { categoryLabel, statusLabel, translationMatchesEntry, type SiteLocale } from './i18n';
import {
  knowledgeAssignments,
  ontologyTermById,
  type KnowledgeSemanticAssignment,
  type SemanticAxis,
} from '../data/knowledgeOntology';

export type KnowledgeNodeKind = 'claim' | 'error-pattern' | 'correction-mechanism';
export type KnowledgeEdgeKind = 'error-pattern' | 'correction-mechanism';

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
  mappedClaimCount: number;
  errorPatternCount: number;
  correctionMechanismCount: number;
}

type Entry = CollectionEntry<'entries'>;
type EntryTranslation = CollectionEntry<'entryTranslations'>;
type CuratedEntry = {
  id: string;
  assignment: KnowledgeSemanticAssignment;
  entry: Entry;
};

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const stableHash = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const edgeId = (kind: KnowledgeEdgeKind, claimId: string, ontologyId: string) =>
  `${kind}:${claimId}:${ontologyId}`;

const axisNodeId = (axis: SemanticAxis, id: string) => `${axis}:${id}`;

// These two calibrators make the narrowest error-pattern terms genuinely cross-disciplinary:
// proxy-as-outcome links a clinical surrogate failure to environmental safety inference,
// while association-as-causation links clinical confounding to an archaeological mobility model.
const semanticAssignments: Record<string, KnowledgeSemanticAssignment> = {
  ...knowledgeAssignments,
  'ddt-is-environmentally-harmless': {
    errorPatterns: ['proxy-as-outcome'],
    correctionMechanisms: ['population-outcomes', 'causal-mechanism'],
  },
  'yamnaya-expansion-was-powered-by-domestic-horses': {
    errorPatterns: ['association-as-causation'],
    correctionMechanisms: ['dating-chronology', 'comparative-analysis'],
  },
};

export const buildKnowledgeGraph = ({
  entries,
  entryTranslations = [],
  locale = 'en',
}: {
  entries: Entry[];
  entryTranslations?: EntryTranslation[];
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

  const entryById = new Map(entries.map((entry) => [entry.id, entry]));
  const curatedEntries: CuratedEntry[] = Object.entries(semanticAssignments)
    .map(([id, assignment]) => {
      const entry = entryById.get(id);
      return entry ? { id, assignment, entry } : null;
    })
    .filter((item): item is CuratedEntry => item !== null);

  const usage = new Map<string, number>();
  for (const { assignment } of curatedEntries) {
    for (const id of [...assignment.errorPatterns, ...assignment.correctionMechanisms]) {
      usage.set(id, (usage.get(id) ?? 0) + 1);
    }
  }

  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];
  const hubPositions = new Map<string, { x: number; y: number }>();

  const errorIds = [...new Set(curatedEntries.flatMap(({ assignment }) => [...assignment.errorPatterns]))];
  const correctionIds = [...new Set(curatedEntries.flatMap(({ assignment }) => [...assignment.correctionMechanisms]))];

  errorIds.sort((a, b) => (usage.get(b) ?? 0) - (usage.get(a) ?? 0) || a.localeCompare(b));
  correctionIds.sort((a, b) => (usage.get(b) ?? 0) - (usage.get(a) ?? 0) || a.localeCompare(b));

  const placeHubColumn = (ids: string[], axis: SemanticAxis, x: number) => {
    const span = 1100;
    ids.forEach((id, index) => {
      const y = ids.length === 1 ? 0 : -span / 2 + (span * index) / (ids.length - 1);
      const hash = stableHash(id);
      const position = {
        x: x + ((hash % 47) - 23),
        y: y + (((hash >>> 8) % 31) - 15),
      };
      const term = ontologyTermById.get(id);
      if (!term) return;
      const nodeId = axisNodeId(axis, id);
      hubPositions.set(nodeId, position);
      nodes.push({
        id: nodeId,
        sourceId: id,
        kind: axis,
        label: term.label[locale],
        summary: term.definition[locale],
        weight: usage.get(id) ?? 1,
        x: position.x,
        y: position.y,
      });
    });
  };

  // The two semantic axes are spatially explicit: old-model failure modes on the left,
  // correction mechanisms on the right. Claims sit between the hubs they connect.
  placeHubColumn(errorIds, 'error-pattern', -900);
  placeHubColumn(correctionIds, 'correction-mechanism', 900);

  curatedEntries
    .sort((a, b) => a.entry.data.timelineYear - b.entry.data.timelineYear || a.id.localeCompare(b.id))
    .forEach(({ id, assignment, entry }, index) => {
      const connectedHubIds = [
        ...assignment.errorPatterns.map((termId) => axisNodeId('error-pattern', termId)),
        ...assignment.correctionMechanisms.map((termId) => axisNodeId('correction-mechanism', termId)),
      ];
      const positions = connectedHubIds
        .map((nodeId) => hubPositions.get(nodeId))
        .filter((position): position is { x: number; y: number } => Boolean(position));

      const mean = positions.length > 0
        ? {
            x: positions.reduce((sum, position) => sum + position.x, 0) / positions.length,
            y: positions.reduce((sum, position) => sum + position.y, 0) / positions.length,
          }
        : { x: 0, y: 0 };
      const hash = stableHash(id);
      const angle = index * GOLDEN_ANGLE + (hash % 360) * (Math.PI / 180);
      const radius = 38 + (hash % 86);
      const position = {
        x: mean.x + Math.cos(angle) * radius,
        y: mean.y + Math.sin(angle) * radius,
      };
      const translation = localizedEntries.get(id);
      const claimNodeId = `claim:${id}`;

      nodes.push({
        id: claimNodeId,
        sourceId: id,
        kind: 'claim',
        label: translation?.data.claim ?? entry.data.claim,
        summary: translation?.data.summary ?? entry.data.summary,
        category: entry.data.category,
        categoryLabel: categoryLabel(entry.data.category, locale),
        status: entry.data.status,
        statusLabel: statusLabel(entry.data.status, locale),
        timelineYear: entry.data.timelineYear,
        changedApproximately: translation?.data.changedApproximately ?? entry.data.changedApproximately,
        href: `${locale === 'de' ? '/de' : ''}/entries/${id}/`,
        weight: connectedHubIds.length,
        x: position.x,
        y: position.y,
      });

      assignment.errorPatterns.forEach((termId) => {
        const target = axisNodeId('error-pattern', termId);
        edges.push({
          id: edgeId('error-pattern', claimNodeId, target),
          source: claimNodeId,
          target,
          kind: 'error-pattern',
        });
      });

      assignment.correctionMechanisms.forEach((termId) => {
        const target = axisNodeId('correction-mechanism', termId);
        edges.push({
          id: edgeId('correction-mechanism', claimNodeId, target),
          source: claimNodeId,
          target,
          kind: 'correction-mechanism',
        });
      });
    });

  return {
    nodes,
    edges,
    claimCount: entries.length,
    mappedClaimCount: curatedEntries.length,
    errorPatternCount: errorIds.length,
    correctionMechanismCount: correctionIds.length,
  };
};
