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

export const institutionalRegionLabels: Record<SiteLocale, Record<string, string>> = {
  en: {},
  de: {
    Africa: 'Afrika',
    Caucasus: 'Kaukasus',
    'Central Africa': 'Zentralafrika',
    'Central Asia': 'Zentralasien',
    'Cross-regional': 'Regionenübergreifend',
    'East Africa': 'Ostafrika',
    'East Asia': 'Ostasien',
    'Eastern Europe': 'Osteuropa',
    Eurasia: 'Eurasien',
    Europe: 'Europa',
    'Europe and Asia': 'Europa und Asien',
    Global: 'Global',
    'Latin America': 'Lateinamerika',
    'Latin America & Caribbean': 'Lateinamerika und Karibik',
    'Middle East': 'Naher Osten',
    'North Africa': 'Nordafrika',
    'North America': 'Nordamerika',
    'Northern Europe': 'Nordeuropa',
    Oceania: 'Ozeanien',
    'South America': 'Südamerika',
    'South Asia': 'Südasien',
    'Southeast Asia': 'Südostasien',
    'Southern Africa': 'Südliches Afrika',
    'West Africa': 'Westafrika',
    'Western Europe': 'Westeuropa',
  },
};

interface InstitutionalPeriodOptions {
  startYear: number;
  endYear: number;
  endOpen?: boolean;
  periodLabel?: string;
  translatedPeriodLabel?: string;
}

const germanInstitutionalPeriodLabel = (label: string) =>
  label
    .replace(/\bCOVID-19 emergency period\b/gi, 'COVID-19-Notstandsphase')
    .replace(/\bearly[\s-]+(\d{4})s\b/gi, 'Anfang der $1er')
    .replace(/\bmid[\s-]+(\d{4})s\b/gi, 'Mitte der $1er')
    .replace(/\blate[\s-]+(\d{4})s\b/gi, 'Ende der $1er')
    .replace(/\bat least\s+(\d{4})\b/gi, 'mindestens $1')
    .replace(/\bpresent\b/gi, 'heute')
    .replace(/\bcirca\s+(\d{4})\b/gi, 'ca. $1')
    .replace(/\bc\.\s*(\d{4})\b/gi, 'ca. $1')
    .replace(/\b(\d{4})s\b/g, '$1er');

export const institutionalRegionLabel = (region: string, locale: SiteLocale) =>
  institutionalRegionLabels[locale][region] ?? region;

export const formatInstitutionalPeriod = (
  {
    startYear,
    endYear,
    endOpen = false,
    periodLabel,
    translatedPeriodLabel,
  }: InstitutionalPeriodOptions,
  locale: SiteLocale,
) => {
  const authoredLabel = locale === 'de'
    ? translatedPeriodLabel ?? (periodLabel ? germanInstitutionalPeriodLabel(periodLabel) : undefined)
    : periodLabel;

  if (authoredLabel) return authoredLabel;
  if (startYear === endYear) return `${startYear}${endOpen ? '+' : ''}`;
  return `${startYear}–${endYear}${endOpen ? '+' : ''}`;
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
