import { getCollection, type CollectionEntry } from 'astro:content';
import { categoryLabel, localizedPath, translationMatchesEntry, type SiteLocale } from './i18n';
import { knowledgeAssignments, errorPatterns, correctionMechanisms, type KnowledgeSemanticAssignment } from '../data/knowledgeOntology';
import { comparisons } from '../data/knowledgeComparisons';
import { sourceAnchor } from './sourceAnchors';

export const assignments: Readonly<Partial<Record<string, KnowledgeSemanticAssignment>>> = knowledgeAssignments;
export const cellId = (pattern: string, method: string) => `${pattern}--${method}`;
export const comparisonPath = (id: string, locale: SiteLocale) => localizedPath(`/graph/${id}/`, locale);

// A contrast follows one shared edge and requires the other axis to differ completely.
// Category only enforces a different field; no words from either entry enter the selection.
export function findContrast(entry: CollectionEntry<'entries'>, candidates: CollectionEntry<'entries'>[]) {
  const start = assignments[entry.id];
  if (!start) return;
  for (const [sharedAxis, differentAxis] of [
    ['errorPatterns', 'correctionMechanisms'], ['correctionMechanisms', 'errorPatterns'],
  ] as const) {
    for (const term of start[sharedAxis]) {
      const other = candidates.filter(candidate => {
        const links = assignments[candidate.id];
        return candidate.data.category !== entry.data.category && links
          && links[sharedAxis].some(id => id === term)
          && !links[differentAxis].some(id => start[differentAxis].some(original => original === id));
      }).sort((a, b) => a.id.localeCompare(b.id))[0];
      if (other) return { other, term, sharedAxis, here: start[differentAxis], there: assignments[other.id]![differentAxis] };
    }
  }
}

export async function loadKnowledgeMap(locale: SiteLocale) {
  const entries = await getCollection('entries');
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  const translations = locale === 'de' ? await getCollection('entryTranslations', t => t.data.locale === 'de') : [];
  const byTranslation = new Map(translations.map(t => [t.data.entryId, t]));
  const cases = Object.entries(knowledgeAssignments).map(([id, links]) => {
    const entry = byId.get(id);
    if (!entry) throw new Error(`Knowledge map refers to missing entry: ${id}`);
    const candidate = byTranslation.get(id);
    const translation = candidate && translationMatchesEntry(entry, candidate) ? candidate : undefined;
    const language = translation ? 'de' : 'en';
    return {
      id, entry, links: links as KnowledgeSemanticAssignment, language,
      claim: translation?.data.claim ?? entry.data.claim,
      category: categoryLabel(entry.data.category, locale),
      href: localizedPath(`/entries/${id}/`, language),
    };
  });

  const caseById = new Map(cases.map(item => [item.id, item]));
  const readings = comparisons.map(reading => ({
    ...reading,
    cases: reading.cases.map(item => {
      const record = caseById.get(item.entry)!;
      const { links } = record;
      if (![...links.errorPatterns, ...links.correctionMechanisms].includes(reading.term)) {
        throw new Error(`Comparison ${reading.id}: ${item.entry} has no ${reading.term} edge`);
      }
      const source = record.entry.data.sources.find(s => s.url === item.source.url && s.purpose === item.source.purpose);
      if (!source) throw new Error(`Comparison ${reading.id}: missing source for ${item.entry}`);
      return { ...item, record, sourceHref: `${record.href}#${sourceAnchor(source)}`, publisher: source.publisher };
    }),
  }));
  const rows = errorPatterns.map(pattern => ({
    pattern,
    cells: correctionMechanisms.map(method => ({
      method, id: cellId(pattern.id, method.id),
      cases: cases.filter(item => item.links.errorPatterns.some(id => id === pattern.id)
        && item.links.correctionMechanisms.some(id => id === method.id))
        .sort((a, b) => a.category.localeCompare(b.category, locale) || a.claim.localeCompare(b.claim, locale)),
    })),
  }));
  return { rows, readings, mapped: cases.length, total: entries.length };
}
