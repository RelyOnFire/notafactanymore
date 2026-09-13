import { getCollection } from 'astro:content';
import { z } from 'astro/zod';
import roster from '../data/young-explorers.json';
import { localizedPath, translationMatchesEntry, type SiteLocale } from './i18n';

const copySchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  then: z.string().min(1),
  evidence: z.string().min(1),
  now: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  caption: z.string().min(1),
});
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const storySchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.enum(['animals', 'earth', 'space', 'experiments']),
  visual: z.enum(['branches', 'crystal', 'stone', 'paint', 'prism', 'rings', 'plates', 'barnacle', 'coral', 'fish', 'cobra', 'plant']),
  sourceReviewedAt: date,
  reviewedAt: date,
  en: copySchema,
  de: copySchema,
});

// Deliberately curated adaptations. Never populate this list from a category filter
// or render the general catalogue's Markdown inside a children's story.
export const explorerStories = z.array(storySchema).min(1).parse(roster);
export type ExplorerStory = (typeof explorerStories)[number];
export type ExplorerCategory = ExplorerStory['category'];

export const explorerCategories: Record<SiteLocale, Record<ExplorerCategory, string>> = {
  en: { animals: 'Animals', earth: 'Earth & the past', space: 'Space', experiments: 'Light & life' },
  de: { animals: 'Tiere', earth: 'Erde & Vergangenheit', space: 'Weltraum', experiments: 'Licht & Leben' },
};

export function explorerPath(id: string, locale: SiteLocale) {
  return localizedPath(`/kids/stories/${id}/`, locale);
}

// A canonical revision must trigger another audience review in both languages.
// Fail the build instead of silently publishing an unreviewed revision or fallback.
export async function getReviewedExplorerStories() {
  const [entries, translations] = await Promise.all([
    getCollection('entries'),
    getCollection('entryTranslations'),
  ]);
  const ids = new Set<string>();
  return explorerStories.map((story) => {
    if (ids.has(story.id)) throw new Error(`Duplicate Young Explorers story: ${story.id}`);
    ids.add(story.id);
    const entry = entries.find((candidate) => candidate.id === story.id);
    const translation = translations.find((candidate) => candidate.data.entryId === story.id && candidate.data.locale === 'de');
    if (!entry || !translation || !translationMatchesEntry(entry, translation)) {
      throw new Error(`Young Explorers needs a current EN/DE source pair: ${story.id}`);
    }
    if (entry.data.reviewedAt.toISOString().slice(0, 10) !== story.sourceReviewedAt || story.reviewedAt < story.sourceReviewedAt) {
      throw new Error(`Review both Young Explorers adaptations after the source revision: ${story.id}`);
    }
    return { story, entry, translation };
  });
}
