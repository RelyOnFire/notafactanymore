import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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

export const collections = { entries, entryTranslations, glossary, glossaryTranslations };
