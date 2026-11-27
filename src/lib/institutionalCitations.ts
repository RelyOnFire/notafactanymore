import type { NormalizedInstitutionalBelief, NormalizedInstitutionalEvidence } from './institutionalBeliefs';

export interface CitationReference {
  id: string;
  noteId: string;
  number: number;
  sourceTitle: string;
}

export interface CitationNote {
  id: string;
  number: number;
  backlinks: string[];
}

export function indexInstitutionalCitations(
  entry: NormalizedInstitutionalBelief,
  chronologicalEpisodes: NormalizedInstitutionalBelief['episodes'],
) {
  const titles = new Map(entry.sources.map(source => [source.id, source.title]));
  const evidence = new Map(entry.evidence.map(item => [item.id, item]));
  const notes = new Map<string, CitationNote>();
  const placements = new Map<string, CitationReference[]>();

  function noteFor(id: string) {
    let note = notes.get(id);
    if (!note) {
      note = { id: `evidence-${entry.id}-${id}`, number: notes.size + 1, backlinks: [] };
      notes.set(id, note);
    }
    return note;
  }

  function place(key: string, evidenceIds: string[] = []) {
    const references = (entry.inlineCitations[key] ?? evidenceIds).map(id => {
      const item = evidence.get(id);
      if (!item) throw new Error(`${entry.id}: missing evidence ${id} at ${key}`);
      const note = noteFor(id);
      const referenceId = `cite-${key}-${id}`;
      note.backlinks.push(referenceId);
      return { id: referenceId, number: note.number, noteId: note.id, sourceTitle: titles.get(item.sourceId)! };
    });
    placements.set(key, references);
  }

  // Existing evidence targets refer to a whole field, never to individual statistics or list items.
  function directNotes(aspect: NormalizedInstitutionalEvidence['target']['aspect'], episodeId?: string) {
    return entry.evidence.filter(({ target, relation }) =>
      (relation === 'documents' || relation === 'supports') && target.aspect === aspect &&
      (target.scope === 'episode' ? target.episodeId === episodeId : episodeId === undefined)
    ).map(item => item.id);
  }

  place('proposition', directNotes('proposition'));
  place('correction', directNotes('correction'));
  for (const section of entry.sections) {
    section.paragraphs.forEach((paragraph, i) => place(`section-${section.id}-p${i + 1}`, paragraph.evidenceIds));
  }
  if (entry.impact) {
    place('impact-summary');
    entry.impact.context.forEach((_, i) => place(`impact-context-${i + 1}`));
    entry.impact.highlights.forEach((_, i) => place(`impact-highlight-${i + 1}`));
  }

  for (const episode of chronologicalEpisodes) {
    place(`${episode.id}-summary`);
    place(`${episode.id}-institutions`, directNotes('carrier', episode.id));
    if (episode.institutionalContext) place(`${episode.id}-context`);
    place(`${episode.id}-mechanism`, directNotes('mechanism', episode.id));
    if (episode.institutionalCorrection.action) place(`${episode.id}-action`);
    place(`${episode.id}-correction`, directNotes('institutional-correction', episode.id));
    const items = episode.consequences.map((_, i) => `${episode.id}-consequence-${i + 1}`);
    const hasIndividualCitations = items.some(key => Object.hasOwn(entry.inlineCitations, key));
    place(`${episode.id}-consequences`, hasIndividualCitations ? [] : directNotes('consequences', episode.id));
    items.forEach(key => place(key));
  }
  // Uncited contextual and dissenting notes remain available in the original evidence panels.
  entry.evidence.forEach(item => noteFor(item.id));
  return { at: (key: string) => placements.get(key) ?? [], noteFor };
}
