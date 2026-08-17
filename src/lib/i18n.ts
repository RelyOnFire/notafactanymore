import type { CollectionEntry } from 'astro:content';

export type SiteLocale = 'en' | 'de';

export const localeMeta = {
  en: {
    languageName: 'English',
    shortName: 'EN',
    htmlLang: 'en',
    ogLocale: 'en_US',
    dateLocale: 'en-GB',
  },
  de: {
    languageName: 'Deutsch',
    shortName: 'DE',
    htmlLang: 'de',
    ogLocale: 'de_AT',
    dateLocale: 'de-AT',
  },
} as const;

export const localizedPath = (pathname: string, locale: SiteLocale) => {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const withoutGerman = normalized.replace(/^\/de(?=\/|$)/, '') || '/';

  if (locale === 'de') {
    return withoutGerman === '/' ? '/de/' : `/de${withoutGerman}`;
  }

  return withoutGerman;
};

export const statusLabels: Record<SiteLocale, Record<string, string>> = {
  en: {
    Overturned: 'Overturned',
    Superseded: 'Superseded',
    Narrowed: 'Narrowed',
    Reclassified: 'Reclassified',
    Corrected: 'Corrected',
  },
  de: {
    Overturned: 'Widerlegt',
    Superseded: 'Abgelöst',
    Narrowed: 'Eingeschränkt',
    Reclassified: 'Neu eingeordnet',
    Corrected: 'Korrigiert',
  },
};

export const categoryLabels: Record<SiteLocale, Record<string, string>> = {
  en: {},
  de: {
    Aerospace: 'Luft- und Raumfahrt',
    'Animal Behavior': 'Tierverhalten',
    Archaeology: 'Archäologie',
    Astrochemistry: 'Astrochemie',
    Astronomy: 'Astronomie',
    'Atmospheric Science': 'Atmosphärenwissenschaften',
    Biochemistry: 'Biochemie',
    Biology: 'Biologie',
    Botany: 'Botanik',
    'Cell Biology': 'Zellbiologie',
    Chemistry: 'Chemie',
    Cosmology: 'Kosmologie',
    'Earth Science': 'Geowissenschaften',
    Ecology: 'Ökologie',
    'Environmental Science': 'Umweltwissenschaften',
    Evolution: 'Evolution',
    Genetics: 'Genetik',
    'Human Evolution': 'Menschliche Evolution',
    Immunology: 'Immunologie',
    'Materials Science': 'Materialwissenschaften',
    Measurement: 'Metrologie',
    Medicine: 'Medizin',
    Microbiology: 'Mikrobiologie',
    Neuroscience: 'Neurowissenschaften',
    'Ocean Science': 'Ozeanwissenschaften',
    Oceanography: 'Ozeanografie',
    Paleoclimate: 'Paläoklima',
    Paleontology: 'Paläontologie',
    Physics: 'Physik',
    'Planetary Science': 'Planetenwissenschaften',
    Psychology: 'Psychologie',
    'Public Health': 'Öffentliche Gesundheit',
    Technology: 'Technologie',
    Virology: 'Virologie',
    Zoology: 'Zoologie',
  },
};

export const sourcePurposeLabels: Record<SiteLocale, Record<string, string>> = {
  en: {
    'Previous belief': 'Previous belief',
    'Current evidence': 'Current evidence',
    'Historical context': 'Historical context',
    'Primary research': 'Primary research',
  },
  de: {
    'Previous belief': 'Frühere Auffassung',
    'Current evidence': 'Aktuelle Evidenz',
    'Historical context': 'Historischer Kontext',
    'Primary research': 'Primärforschung',
  },
};

export const categoryLabel = (category: string, locale: SiteLocale) =>
  categoryLabels[locale][category] ?? category;

export const statusLabel = (status: string, locale: SiteLocale) =>
  statusLabels[locale][status] ?? status;

export const sourcePurposeLabel = (purpose: string, locale: SiteLocale) =>
  sourcePurposeLabels[locale][purpose] ?? purpose;

export const formatApproxYearsLocalized = (years: number, locale: SiteLocale) => {
  const rounded = Number.isInteger(years) ? years : Math.round(years * 10) / 10;

  if (locale === 'de') {
    const value = rounded.toLocaleString('de-AT');
    return `≈${value} ${rounded === 1 ? 'Jahr' : 'Jahre'}`;
  }

  const value = rounded.toLocaleString('en-US');
  return `≈${value} ${rounded === 1 ? 'year' : 'years'}`;
};

export type EntryTranslation = CollectionEntry<'entryTranslations'>;
export type Entry = CollectionEntry<'entries'>;

export const translationMatchesEntry = (entry: Entry, translation: EntryTranslation) =>
  translation.data.entryId === entry.id &&
  translation.data.sourceReviewedAt.getTime() === entry.data.reviewedAt.getTime();
