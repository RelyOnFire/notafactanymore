import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const mediaId = z.string().regex(/^[a-z0-9][a-z0-9-]*$/);

const entryMedia = z.object({
  id: mediaId,
  type: z.enum(['image']),
  src: z.string().refine(
    (value) => value.startsWith('/') || /^https:\/\//.test(value),
    { message: 'media src must be a site-relative path or an https URL' },
  ),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().min(1),
  caption: z.string().min(1),
  credit: z.string().min(1),
  sourceLabel: z.string().min(1),
  sourceUrl: z.string().url(),
  rights: z.enum([
    'public-domain',
    'public-domain-no-known-restrictions',
    'licensed',
    'source-specific',
    'original',
  ]),
  licenseLabel: z.string().min(1).optional(),
  licenseUrl: z.string().url().optional(),
  derivative: z.boolean().optional().default(false),
  layout: z.enum(['inline', 'wide']).optional().default('wide'),
}).superRefine((media, ctx) => {
  if (media.rights === 'licensed' && (!media.licenseLabel || !media.licenseUrl)) {
    ctx.addIssue({
      code: 'custom',
      message: 'licensed media requires licenseLabel and licenseUrl',
      path: ['rights'],
    });
  }
});

const translatedEntryMedia = z.object({
  id: mediaId,
  src: z.string().refine(
    (value) => value.startsWith('/') || /^https:\/\//.test(value),
    { message: 'translated media src must be a site-relative path or an https URL' },
  ).optional(),
  alt: z.string().min(1),
  caption: z.string().min(1),
});

const entries = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/data/entries' }),
  schema: z.object({
    claim: z.string(),
    currentUnderstanding: z.string(),
    whyItChanged: z.string(),
    status: z.enum(['Overturned', 'Superseded', 'Narrowed', 'Reclassified', 'Corrected']),
    category: z.string(),
    acceptedApproximately: z.string(),

    // Representative year used for lifespan ordering/statistics.
    // acceptedApproximately remains the human-readable historical label.
    acceptedYear: z.number().int(),
    lifespanComparable: z.boolean().optional().default(true),

    changedApproximately: z.string(),

    // Representative year used only for chronological sorting/grouping.
    // changedApproximately remains the human-readable historical label.
    timelineYear: z.number().int(),

    summary: z.string(),
    featured: z.boolean().default(false),
    featuredOrder: z.number().int().positive().optional(),
    publishedAt: z.coerce.date(),
    reviewedAt: z.coerce.date(),
    media: z.array(entryMedia).optional().default([]),
    sources: z.array(
      z.object({
        title: z.string(),
        url: z.string().url(),
        publisher: z.string(),
        purpose: z.enum([
          'Previous belief',
          'Current evidence',
          'Historical context',
          'Primary research',
        ]),
        note: z.string(),
      }),
    ),
  }).refine((entry) => entry.acceptedYear < entry.timelineYear, {
    message: 'acceptedYear must be earlier than timelineYear',
    path: ['acceptedYear'],
  }),
});

const entryTranslations = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/data/translations' }),
  schema: z.object({
    locale: z.enum(['de', 'fr', 'es']),
    entryId: z.string(),
    sourceReviewedAt: z.coerce.date(),
    claim: z.string(),
    currentUnderstanding: z.string(),
    whyItChanged: z.string(),
    acceptedApproximately: z.string(),
    changedApproximately: z.string(),
    summary: z.string(),
    media: z.array(translatedEntryMedia).optional().default([]),
    sourceNotes: z.array(z.string()),
  }),
});


const glossarySource = z.object({
  title: z.string(),
  url: z.string().url(),
  publisher: z.string(),
  note: z.string(),
});

const glossary = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/data/glossary' }),
  schema: z.object({
    term: z.string(),
    aliases: z.array(z.string()).optional().default([]),
    shortDefinition: z.string(),
    longDefinition: z.string().optional(),
    relatedTerms: z.array(z.string()).optional().default([]),
    reviewedAt: z.coerce.date(),
    sources: z.array(glossarySource).min(1),
  }),
});

const glossaryTranslations = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/data/glossary-translations' }),
  schema: z.object({
    locale: z.enum(['de', 'fr', 'es']),
    entryId: z.string(),
    sourceReviewedAt: z.coerce.date(),
    term: z.string(),
    aliases: z.array(z.string()).optional().default([]),
    shortDefinition: z.string(),
    longDefinition: z.string().optional(),
  }),
});

const institutionalStrength = z.enum([
  'institutionally-influential',
  'officially-endorsed',
  'policy-basis',
  'enforced-doctrine',
]);

const institutionalType = z.enum([
  'government',
  'court',
  'academy',
  'university',
  'medical',
  'professional',
  'education',
  'military',
]);

const institutionalSourceV1 = z.object({
  title: z.string(),
  url: z.string().url(),
  publisher: z.string(),
  note: z.string(),
});

const institutionalImpactHighlight = z.object({
  value: z.union([z.string().min(1), z.number()]).transform(String),
  label: z.string().min(1),
  note: z.string().min(1).optional(),
});

const institutionalImpact = z.object({
  summary: z.string().min(1),
  context: z.array(z.string().min(1)).optional().default([]),
  highlights: z.array(institutionalImpactHighlight).optional().default([]),
});

const institutionalImpactHighlightV2 = z.object({
  value: z.union([z.string().min(1), z.number()]).transform(String),
  label: z.string().min(1),
  note: z.string().min(1).optional(),
}).strict();

const institutionalImpactV2 = z.object({
  summary: z.string().min(1),
  context: z.array(z.string().min(1)).optional().default([]),
  highlights: z.array(institutionalImpactHighlightV2).optional().default([]),
}).strict();

const institutionalEpisodeFields = {
  id: mediaId,
  polity: z.string().min(1),
  region: z.string().min(1),
  startYear: z.number().int(),
  endYear: z.number().int(),
  endOpen: z.boolean().optional().default(false),
  periodLabel: z.string().min(1).optional(),
  strength: institutionalStrength,
  institutionTypes: z.array(institutionalType).min(1),
  institutions: z.array(z.string().min(1)).min(1),
  institutionalContext: z.string().min(1).optional(),
  consequences: z.array(z.string().min(1)).min(1),
  summary: z.string().min(1),
};

const institutionalEpisodeV1 = z.object({
  ...institutionalEpisodeFields,
  sources: z.array(institutionalSourceV1).min(1),
}).refine((episode) => episode.startYear <= episode.endYear, {
  message: 'institutional episode startYear must be earlier than or equal to endYear',
  path: ['startYear'],
});

const institutionalMechanismKind = z.enum([
  'endorsement',
  'classification',
  'standard-setting',
  'administrative-adoption',
  'education',
  'publication',
  'funding',
  'credentialing',
  'enforcement',
  'suppression',
  'other',
]);

const institutionalMechanism = z.object({
  kind: institutionalMechanismKind.optional(),
  summary: z.string().min(1),
}).strict();

const institutionalCorrectionStatus = z.enum([
  'corrected',
  'partial',
  'uncorrected',
  'ongoing',
  'undocumented',
]);

const institutionalCorrection = z.object({
  status: institutionalCorrectionStatus,
  periodLabel: z.string().min(1).optional(),
  action: z.string().min(1).optional(),
  summary: z.string().min(1),
}).strict();

const institutionalEpisodeV2 = z.object({
  ...institutionalEpisodeFields,
  mechanism: institutionalMechanism,
  institutionalCorrection,
}).strict().refine((episode) => episode.startYear <= episode.endYear, {
  message: 'institutional episode startYear must be earlier than or equal to endYear',
  path: ['startYear'],
});

const institutionalSourceV2 = z.object({
  id: mediaId,
  title: z.string().min(1),
  url: z.string().url(),
  publisher: z.string().min(1),
}).strict();

const institutionalEvidenceTarget = z.discriminatedUnion('scope', [
  z.object({
    scope: z.literal('belief'),
    aspect: z.enum(['proposition', 'correction', 'impact']),
  }).strict(),
  z.object({
    scope: z.literal('episode'),
    episodeId: mediaId,
    aspect: z.enum([
      'carrier',
      'mechanism',
      'consequences',
      'institutional-correction',
      'context',
    ]),
  }).strict(),
]);

const institutionalEvidence = z.object({
  id: mediaId,
  sourceId: mediaId,
  relation: z.enum(['documents', 'supports', 'contextualizes', 'disputes']),
  target: institutionalEvidenceTarget,
  locator: z.string().min(1).optional(),
  note: z.string().min(1).optional(),
}).strict();

const institutionalBeliefV1 = z.object({
  schemaVersion: z.literal(1),
  title: z.string().min(1),
  claim: z.string().min(1),
  currentUnderstanding: z.string().min(1),
  category: z.string().min(1),
  entryId: z.string().min(1).optional(),
  reviewedAt: z.coerce.date(),
  impact: institutionalImpact.optional(),
  episodes: z.array(institutionalEpisodeV1).min(1),
});

const institutionalBeliefV2 = z.object({
  schemaVersion: z.literal(2),
  title: z.string().min(1),
  proposition: z.object({
    summary: z.string().min(1),
  }).strict(),
  correction: z.object({
    summary: z.string().min(1),
  }).strict(),
  category: z.string().min(1),
  entryId: z.string().min(1).optional(),
  reviewedAt: z.coerce.date(),
  impact: institutionalImpactV2.optional(),
  episodes: z.array(institutionalEpisodeV2).min(1),
  sources: z.array(institutionalSourceV2).min(1),
  evidence: z.array(institutionalEvidence).min(1),
}).strict().superRefine((belief, ctx) => {
  const episodeIds = new Set<string>();
  const sourceIds = new Set<string>();
  const evidenceIds = new Set<string>();
  const usedSourceIds = new Set<string>();
  const validEvidenceIndexes = new Set<number>();

  belief.episodes.forEach((episode, index) => {
    if (episodeIds.has(episode.id)) {
      ctx.addIssue({
        code: 'custom',
        message: `duplicate institutional episode id: ${episode.id}`,
        path: ['episodes', index, 'id'],
      });
    }
    episodeIds.add(episode.id);
  });

  belief.sources.forEach((source, index) => {
    if (sourceIds.has(source.id)) {
      ctx.addIssue({
        code: 'custom',
        message: `duplicate institutional source id: ${source.id}`,
        path: ['sources', index, 'id'],
      });
    }
    sourceIds.add(source.id);
  });

  belief.evidence.forEach((item, index) => {
    if (evidenceIds.has(item.id)) {
      ctx.addIssue({
        code: 'custom',
        message: `duplicate institutional evidence id: ${item.id}`,
        path: ['evidence', index, 'id'],
      });
    }
    evidenceIds.add(item.id);

    const sourceIsValid = sourceIds.has(item.sourceId);
    let targetIsValid = true;

    if (!sourceIsValid) {
      ctx.addIssue({
        code: 'custom',
        message: `institutional evidence references unknown source: ${item.sourceId}`,
        path: ['evidence', index, 'sourceId'],
      });
    }

    if (item.target.scope === 'belief') {
      if (item.target.aspect === 'impact' && !belief.impact) {
        targetIsValid = false;
        ctx.addIssue({
          code: 'custom',
          message: 'institutional evidence targets absent impact',
          path: ['evidence', index, 'target', 'aspect'],
        });
      }
    } else {
      const episode = belief.episodes.find(({ id }) => id === item.target.episodeId);

      if (!episode) {
        targetIsValid = false;
        ctx.addIssue({
          code: 'custom',
          message: `institutional evidence references unknown episode: ${item.target.episodeId}`,
          path: ['evidence', index, 'target', 'episodeId'],
        });
      } else if (item.target.aspect === 'context' && !episode.institutionalContext) {
        targetIsValid = false;
        ctx.addIssue({
          code: 'custom',
          message: `institutional evidence targets absent context for episode: ${item.target.episodeId}`,
          path: ['evidence', index, 'target', 'aspect'],
        });
      }
    }

    if (sourceIsValid && targetIsValid) {
      usedSourceIds.add(item.sourceId);
      validEvidenceIndexes.add(index);
    }
  });

  belief.sources.forEach((source, index) => {
    if (!usedSourceIds.has(source.id)) {
      ctx.addIssue({
        code: 'custom',
        message: `institutional source has no evidence link: ${source.id}`,
        path: ['sources', index, 'id'],
      });
    }
  });

  const validEvidence = belief.evidence.filter(
    (_item, index) => validEvidenceIndexes.has(index),
  );
  const isSupporting = (relation: string) =>
    relation === 'documents' || relation === 'supports';
  const hasBeliefSupport = (aspect: 'proposition' | 'correction' | 'impact') =>
    validEvidence.some((item) =>
      isSupporting(item.relation) &&
      item.target.scope === 'belief' &&
      item.target.aspect === aspect
    );
  const hasEpisodeSupport = (
    episodeId: string,
    aspect: 'carrier' | 'mechanism' | 'consequences' | 'institutional-correction',
  ) => validEvidence.some((item) =>
    isSupporting(item.relation) &&
    item.target.scope === 'episode' &&
    item.target.episodeId === episodeId &&
    item.target.aspect === aspect
  );

  if (!hasBeliefSupport('proposition')) {
    ctx.addIssue({
      code: 'custom',
      message: 'institutional proposition requires documents or supports evidence',
      path: ['evidence'],
    });
  }
  if (!hasBeliefSupport('correction')) {
    ctx.addIssue({
      code: 'custom',
      message: 'institutional correction requires documents or supports evidence',
      path: ['evidence'],
    });
  }
  if (belief.impact && !hasBeliefSupport('impact')) {
    ctx.addIssue({
      code: 'custom',
      message: 'institutional impact requires documents or supports evidence',
      path: ['evidence'],
    });
  }

  belief.episodes.forEach((episode, index) => {
    for (const aspect of ['carrier', 'mechanism', 'consequences'] as const) {
      if (!hasEpisodeSupport(episode.id, aspect)) {
        ctx.addIssue({
          code: 'custom',
          message: `institutional episode ${episode.id} requires ${aspect} evidence`,
          path: ['episodes', index],
        });
      }
    }

    if (
      episode.institutionalCorrection.status !== 'undocumented' &&
      !hasEpisodeSupport(episode.id, 'institutional-correction')
    ) {
      ctx.addIssue({
        code: 'custom',
        message: `institutional episode ${episode.id} requires institutional-correction evidence`,
        path: ['episodes', index, 'institutionalCorrection'],
      });
    }
  });
});

const injectLegacyInstitutionalSchemaVersion = (input: unknown) => {
  if (
    input !== null &&
    typeof input === 'object' &&
    !Array.isArray(input) &&
    !Object.prototype.hasOwnProperty.call(input, 'schemaVersion')
  ) {
    return { ...input, schemaVersion: 1 };
  }

  return input;
};

const institutionalBeliefs = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/data/institutional-beliefs' }),
  schema: z.preprocess(
    injectLegacyInstitutionalSchemaVersion,
    z.discriminatedUnion('schemaVersion', [institutionalBeliefV1, institutionalBeliefV2]),
  ),
});

const translatedInstitutionalImpactHighlight = z.object({
  value: z.union([z.string().min(1), z.number()]).transform(String),
  label: z.string().min(1),
  note: z.string().min(1).optional(),
});

const translatedInstitutionalImpact = z.object({
  summary: z.string().min(1),
  context: z.array(z.string().min(1)).optional().default([]),
  highlights: z.array(translatedInstitutionalImpactHighlight).optional().default([]),
});

const translatedInstitutionalImpactHighlightV2 = z.object({
  value: z.union([z.string().min(1), z.number()]).transform(String),
  label: z.string().min(1),
  note: z.string().min(1).optional(),
}).strict();

const translatedInstitutionalImpactV2 = z.object({
  summary: z.string().min(1),
  context: z.array(z.string().min(1)).optional().default([]),
  highlights: z.array(translatedInstitutionalImpactHighlightV2).optional().default([]),
}).strict();

const translatedInstitutionalEpisodeFields = {
  id: mediaId,
  polity: z.string().min(1),
  periodLabel: z.string().min(1).optional(),
  institutions: z.array(z.string().min(1)).min(1).optional(),
  institutionalContext: z.string().min(1).optional(),
  summary: z.string().min(1),
  consequences: z.array(z.string().min(1)).min(1),
};

const translatedInstitutionalEpisodeV1 = z.object({
  ...translatedInstitutionalEpisodeFields,
});

const translatedInstitutionalEpisodeV2 = z.object({
  ...translatedInstitutionalEpisodeFields,
  mechanism: z.object({
    summary: z.string().min(1),
  }).strict(),
  institutionalCorrection: z.object({
    periodLabel: z.string().min(1).optional(),
    action: z.string().min(1).optional(),
    summary: z.string().min(1),
  }).strict(),
}).strict();

const translatedInstitutionalEvidence = z.object({
  id: mediaId,
  note: z.string().min(1).optional(),
}).strict();

const institutionalBeliefTranslationV1 = z.object({
  schemaVersion: z.literal(1),
  locale: z.enum(['de', 'fr', 'es']),
  entryId: z.string().min(1),
  sourceReviewedAt: z.coerce.date(),
  title: z.string().min(1),
  claim: z.string().min(1),
  currentUnderstanding: z.string().min(1),
  impact: translatedInstitutionalImpact.optional(),
  episodes: z.array(translatedInstitutionalEpisodeV1).min(1),
});

const institutionalBeliefTranslationV2 = z.object({
  schemaVersion: z.literal(2),
  locale: z.enum(['de', 'fr', 'es']),
  entryId: z.string().min(1),
  sourceReviewedAt: z.coerce.date(),
  title: z.string().min(1),
  proposition: z.object({
    summary: z.string().min(1),
  }).strict(),
  correction: z.object({
    summary: z.string().min(1),
  }).strict(),
  impact: translatedInstitutionalImpactV2.optional(),
  episodes: z.array(translatedInstitutionalEpisodeV2).min(1),
  evidence: z.array(translatedInstitutionalEvidence).min(1),
}).strict();

const institutionalBeliefTranslations = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/data/institutional-belief-translations' }),
  schema: z.preprocess(
    injectLegacyInstitutionalSchemaVersion,
    z.discriminatedUnion('schemaVersion', [
      institutionalBeliefTranslationV1,
      institutionalBeliefTranslationV2,
    ]),
  ),
});

export const collections = {
  entries,
  entryTranslations,
  glossary,
  glossaryTranslations,
  institutionalBeliefs,
  institutionalBeliefTranslations,
};
