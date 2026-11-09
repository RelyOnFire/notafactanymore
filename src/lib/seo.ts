import type { SiteLocale } from './i18n';

const entryTitles: Record<SiteLocale, Record<string, string>> = {
  en: {
    'air-and-gases-have-no-weight': 'Does air have weight? How scientists established that gases have mass',
    'radioactivity-is-a-chemical-property': 'Is radioactivity a chemical or physical property?',
    'interstellar-space-is-empty': 'Is interstellar space empty? What fills the space between stars',
    'equilibrium-climate-sensitivity-likely-1-5-to-4-5c': 'Equilibrium climate sensitivity: why the likely range narrowed',
    'human-evolution-is-a-straight-line': 'Is human evolution a straight line? Why the family tree branches',
    'cosmic-rays-are-electromagnetic-waves': 'Are cosmic rays electromagnetic waves? What cosmic rays actually are',
    'fermentation-requires-living-cells': 'Can fermentation happen without living cells? Buchner’s discovery',
    'elements-cannot-transform': 'Can one element transform into another? Nuclear transmutation explained',
  },
  de: {
    'interstellar-space-is-empty': 'Was ist der interstellare Raum? Warum der Raum zwischen Sternen nicht leer ist',
  },
};

const institutionalTitles: Record<SiteLocale, Record<string, string>> = {
  en: {
    'paraffin-test-firearm-discharge': 'Paraffin test for gunshot residue: why the old firearm test failed',
    'sun-language-theory': 'Sun Language Theory: Turkey’s state-backed universal language claim',
    'routine-oxygen-heart-attack': 'Routine oxygen after heart attack: why guidelines changed',
  },
  de: {
    'paraffin-test-firearm-discharge': 'Paraffintest an der Hand: Warum der alte Schusswaffentest unzuverlässig ist',
    'routine-oxygen-heart-attack': 'Sauerstoff beim Herzinfarkt: Warum die Routinegabe ohne Hypoxämie endete',
  },
};

export const seoTitleForEntry = (id: string, locale: SiteLocale) =>
  entryTitles[locale][id];

export const seoTitleForInstitutional = (id: string, locale: SiteLocale) =>
  institutionalTitles[locale][id];
