import type { CollectionEntry } from 'astro:content';
import {
  formatInstitutionalPeriod,
  institutionalRegionLabel,
  type SiteLocale,
} from './i18n';

export type InstitutionalBeliefEntry = CollectionEntry<'institutionalBeliefs'>;
export type InstitutionalBeliefTranslationEntry =
  CollectionEntry<'institutionalBeliefTranslations'>;

type InstitutionalBeliefData = InstitutionalBeliefEntry['data'];
type InstitutionalEpisode = InstitutionalBeliefData['episodes'][number];
type InstitutionalEvidence = InstitutionalBeliefData['evidence'][number];
type InstitutionalSource = InstitutionalBeliefData['sources'][number];
type InstitutionalImpact = NonNullable<InstitutionalBeliefData['impact']>;

export interface NormalizedInstitutionalSource {
  id: string;
  evidenceId: string;
  title: string;
  url: string;
  publisher: string;
  note?: string;
  relation: InstitutionalEvidence['relation'];
  target: InstitutionalEvidence['target'];
  locator?: string;
}

export type NormalizedInstitutionalEvidence = Omit<InstitutionalEvidence, 'note'> & {
  note?: string;
};

export interface NormalizedInstitutionalEpisode {
  id: string;
  polity: string;
  region: string;
  regionLabel: string;
  startYear: number;
  endYear: number;
  endOpen: boolean;
  periodLabel?: string;
  period: string;
  strength: InstitutionalEpisode['strength'];
  institutionTypes: InstitutionalEpisode['institutionTypes'];
  institutions: string[];
  institutionalContext?: string;
  consequences: string[];
  summary: string;
  mechanism: InstitutionalEpisode['mechanism'];
  institutionalCorrection: InstitutionalEpisode['institutionalCorrection'];
  sources: NormalizedInstitutionalSource[];
}

export interface NormalizedInstitutionalBelief {
  id: string;
  title: string;
  proposition: string;
  correction: string;
  category: string;
  entryId?: string;
  reviewedAt: Date;
  impact?: InstitutionalImpact;
  episodes: NormalizedInstitutionalEpisode[];
  sources: InstitutionalSource[];
  evidence: NormalizedInstitutionalEvidence[];
}

const idsMatchInOrder = (
  canonical: ReadonlyArray<{ id: string }>,
  translated: ReadonlyArray<{ id: string }>,
) =>
  canonical.length === translated.length &&
  canonical.every((item, index) => item.id === translated[index]?.id);

export const institutionalTranslationMatchesBelief = (
  belief: InstitutionalBeliefEntry,
  translation: InstitutionalBeliefTranslationEntry,
) => {
  if (
    translation.data.entryId !== belief.id ||
    translation.data.schemaVersion !== belief.data.schemaVersion ||
    translation.data.sourceReviewedAt.getTime() !== belief.data.reviewedAt.getTime() ||
    !idsMatchInOrder(belief.data.episodes, translation.data.episodes)
  ) {
    return false;
  }

  return idsMatchInOrder(belief.data.evidence, translation.data.evidence);
};

export const currentInstitutionalTranslationMap = (
  beliefs: InstitutionalBeliefEntry[],
  translations: InstitutionalBeliefTranslationEntry[],
  locale: Exclude<SiteLocale, 'en'> = 'de',
) => {
  const beliefById = new Map(beliefs.map((belief) => [belief.id, belief]));
  const current = new Map<string, InstitutionalBeliefTranslationEntry>();

  for (const translation of translations) {
    if (translation.data.locale !== locale || current.has(translation.data.entryId)) continue;

    const belief = beliefById.get(translation.data.entryId);
    if (belief && institutionalTranslationMatchesBelief(belief, translation)) {
      current.set(belief.id, translation);
    }
  }

  return current;
};

const normalizeEpisodeBase = (
  episode: InstitutionalEpisode,
  locale: SiteLocale,
  translatedEpisode?: {
    polity: string;
    periodLabel?: string;
    institutions?: string[];
    institutionalContext?: string;
    summary: string;
    consequences: string[];
  },
) => ({
  id: episode.id,
  polity: translatedEpisode?.polity ?? episode.polity,
  region: episode.region,
  regionLabel: institutionalRegionLabel(episode.region, locale),
  startYear: episode.startYear,
  endYear: episode.endYear,
  endOpen: episode.endOpen,
  periodLabel: episode.periodLabel,
  period: formatInstitutionalPeriod(
    {
      startYear: episode.startYear,
      endYear: episode.endYear,
      endOpen: episode.endOpen,
      periodLabel: episode.periodLabel,
      translatedPeriodLabel: translatedEpisode?.periodLabel,
    },
    locale,
  ),
  strength: episode.strength,
  institutionTypes: episode.institutionTypes,
  institutions: translatedEpisode?.institutions ?? episode.institutions,
  institutionalContext:
    translatedEpisode?.institutionalContext ?? episode.institutionalContext,
  consequences: translatedEpisode?.consequences ?? episode.consequences,
  summary: translatedEpisode?.summary ?? episode.summary,
});

const normalizeBelief = (
  belief: InstitutionalBeliefEntry,
  locale: SiteLocale,
  translation?: InstitutionalBeliefTranslationEntry,
): NormalizedInstitutionalBelief => {
  const localized = locale === 'de' && translation
    ? translation
    : undefined;
  const translatedEpisodes = new Map(
    localized?.data.episodes.map((episode) => [episode.id, episode]) ?? [],
  );
  const translatedEvidence = new Map(
    localized?.data.evidence.map((item) => [item.id, item]) ?? [],
  );
  const sourceById = new Map(belief.data.sources.map((source) => [source.id, source]));
  const evidence: NormalizedInstitutionalEvidence[] = belief.data.evidence.map((item) => ({
    ...item,
    note: locale === 'de'
      ? translatedEvidence.get(item.id)?.note
      : item.note,
  }));

  return {
    id: belief.id,
    title: localized?.data.title ?? belief.data.title,
    proposition: localized?.data.proposition.summary ?? belief.data.proposition.summary,
    correction: localized?.data.correction.summary ?? belief.data.correction.summary,
    category: belief.data.category,
    entryId: belief.data.entryId,
    reviewedAt: belief.data.reviewedAt,
    impact: locale === 'de' ? localized?.data.impact : belief.data.impact,
    episodes: belief.data.episodes.map((episode) => {
      const translatedEpisode = translatedEpisodes.get(episode.id);
      const episodeEvidence = evidence.filter(
        (item) => item.target.scope === 'episode' && item.target.episodeId === episode.id,
      );
      const evidenceBySourceId = new Map<string, NormalizedInstitutionalEvidence[]>();

      for (const item of episodeEvidence) {
        const sourceEvidence = evidenceBySourceId.get(item.sourceId);
        if (sourceEvidence) sourceEvidence.push(item);
        else evidenceBySourceId.set(item.sourceId, [item]);
      }

      const sources = [...sourceById.values()].flatMap((source) => {
        const sourceEvidence = evidenceBySourceId.get(source.id);
        if (!sourceEvidence?.length) return [];

        const representative = sourceEvidence.find((item) => item.note) ?? sourceEvidence[0];
        if (!representative) return [];

        return [{
          ...source,
          evidenceId: representative.id,
          note: representative.note,
          relation: representative.relation,
          target: representative.target,
          locator: representative.locator,
        }];
      });

      return {
        ...normalizeEpisodeBase(episode, locale, translatedEpisode),
        mechanism: {
          ...episode.mechanism,
          summary: translatedEpisode?.mechanism.summary ?? episode.mechanism.summary,
        },
        institutionalCorrection: {
          ...episode.institutionalCorrection,
          summary:
            translatedEpisode?.institutionalCorrection.summary ??
            episode.institutionalCorrection.summary,
          periodLabel: locale === 'de'
            ? translatedEpisode?.institutionalCorrection.periodLabel
            : episode.institutionalCorrection.periodLabel,
          action: locale === 'de'
            ? translatedEpisode?.institutionalCorrection.action
            : episode.institutionalCorrection.action,
        },
        sources,
      };
    }),
    sources: belief.data.sources,
    evidence,
  };
};

export const normalizeInstitutionalBelief = (
  belief: InstitutionalBeliefEntry,
  locale: SiteLocale = 'en',
  translation?: InstitutionalBeliefTranslationEntry,
): NormalizedInstitutionalBelief => {
  const localized = translation && institutionalTranslationMatchesBelief(belief, translation)
    ? translation
    : undefined;

  return normalizeBelief(belief, locale, localized);
};
