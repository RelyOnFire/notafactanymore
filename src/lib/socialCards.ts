import { createHash } from 'node:crypto';
import { getCollection } from 'astro:content';
import { categoryLabel, localizedPath, translationMatchesEntry, type SiteLocale } from './i18n';
import { currentInstitutionalTranslationMap, normalizeInstitutionalBelief } from './institutionalBeliefs';

export const socialCardSize = { width: 1200, height: 630 };

export interface SocialCard {
  path: string;
  locale: SiteLocale;
  title: string;
  label: string;
  description: string;
  shareTitle: string;
  imagePath: string;
}

export const plainText = (text: string) => text
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/[*_`]/g, '')
  .replace(/\s+/g, ' ').trim();

export const historicalDescription = (proposition: string, locale: SiteLocale) =>
  `${locale === 'de' ? 'Historische institutionelle Überzeugung' : 'Historical institutional belief'}: ${plainText(proposition)} ${locale === 'de' ? 'Der Fall dokumentiert die institutionelle Praxis und die heutige Evidenz.' : 'This case documents institutional practice and what the evidence supports now.'}`;

const normalizedPath = (path: string) => decodeURIComponent(path).replace(/\/+$/, '') || '/';
let cardsPromise: Promise<Map<string, SocialCard>> | undefined;

export const getSocialCards = () => cardsPromise ??= buildCards();

async function buildCards() {
  const [entries, translations, beliefs, beliefTranslations] = await Promise.all([
    getCollection('entries'), getCollection('entryTranslations'),
    getCollection('institutionalBeliefs'), getCollection('institutionalBeliefTranslations'),
  ]);
  const cards = new Map<string, SocialCard>();
  const add = (path: string, locale: SiteLocale, title: string, label: string, description: string, shareTitle = title) => {
    path = normalizedPath(path);
    const text = { path, locale, title: plainText(title), label: plainText(label), description: plainText(description), shareTitle: plainText(shareTitle) };
    // Version the image URL when copy or the template changes, so cached previews can refresh.
    const hash = createHash('sha256').update(JSON.stringify({ template: 1, ...text })).digest('hex').slice(0, 12);
    const key = path.replace(/^\/de(?=\/|$)/, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';
    cards.set(path, { ...text, imagePath: `/social/${locale}/${key}-${hash}.png` });
  };
  const landingPages = [
    ['/', 'Knowledge changes. The record should too.', 'Wissen verändert sich. Der Katalog sollte es auch.', 'Facts have a history.', 'Fakten haben eine Geschichte.', 'Explore how accepted claims changed when stronger evidence arrived.', 'Entdecke, wie sich akzeptierte Aussagen durch bessere Evidenz verändert haben.'],
    ['/browse', 'Browse the catalogue', 'Den Katalog durchsuchen', 'The catalogue', 'Der Katalog', 'Search scientific and scholarly claims, their former standing and their current understanding.', 'Durchsuche wissenschaftliche Aussagen, ihre frühere Anerkennung und den heutigen Wissensstand.'],
    ['/timeline', 'When knowledge changed', 'Wann sich Wissen veränderte', 'Timeline', 'Zeitleiste', 'Follow corrections and discoveries through history, or explore what changed since your school years.', 'Verfolge Korrekturen und Entdeckungen durch die Geschichte oder seit deiner Schulzeit.'],
    ['/institutions', 'Institutional beliefs', 'Institutionelle Überzeugungen', 'When claims acquire power', 'Wenn Aussagen Macht erhalten', 'Explore documented cases of claims embedded in research, education, medicine, law and public policy.', 'Entdecke dokumentierte Fälle von Aussagen, die Forschung, Bildung, Medizin, Recht und staatliche Praxis prägten.'],
    ['/lifespans', 'How long did an accepted claim last?', 'Wie lange hatte eine akzeptierte Aussage Bestand?', 'Lifespans', 'Lebensdauer', 'Compare approximate durations in this curated catalogue, with historical boundaries and limits made explicit.', 'Vergleiche ungefähre Zeitspannen in diesem kuratierten Katalog mit ausdrücklich benannten historischen Grenzen.'],
    ['/glossary', 'The words behind the evidence', 'Die Begriffe hinter der Evidenz', 'Glossary', 'Glossar', 'Definitions and sources for scientific, historical and technical terms used in the catalogue.', 'Definitionen und Quellen zu wissenschaftlichen, historischen und technischen Begriffen im Katalog.'],
    ['/categories', 'Explore by subject', 'Nach Fachgebiet entdecken', 'Subjects', 'Fachgebiete', 'Find cases across scientific and scholarly subjects, from astronomy to medicine.', 'Finde Fälle aus wissenschaftlichen Fachgebieten, von Astronomie bis Medizin.'],
    ['/about', 'About Not a Fact Anymore', 'Über Not a Fact Anymore', 'About the project', 'Über das Projekt', 'An independent catalogue maintained by Isaac Mattoo, with AI assistance and an open correction process.', 'Ein unabhängiger Katalog, den Isaac Mattoo mit KI-Unterstützung pflegt und der offen für Korrekturen ist.'],
    ['/methodology', 'How a claim earns its place', 'Wann eine Aussage in den Katalog gehört', 'Editorial standard', 'Redaktioneller Maßstab', 'Read the inclusion standards, evidence labels, review limits and correction process.', 'Lies die Aufnahmekriterien, Evidenzkennzeichnungen, Grenzen der Prüfung und den Ablauf von Korrekturen.'],
    ['/submit', 'Propose a sourced claim', 'Eine belegte Aussage vorschlagen', 'Contribute', 'Mitwirken', 'Provide evidence for a formerly accepted claim and the understanding that replaced it.', 'Belege eine früher akzeptierte Aussage und den Wissensstand, der sie ersetzt hat.'],
    ['/corrections', 'Help improve the catalogue', 'Den Katalog verbessern', 'Suggest a correction', 'Korrektur vorschlagen', 'Report a factual error, source problem, missing context, translation issue or usability problem.', 'Melde sachliche Fehler, Quellenprobleme, fehlenden Kontext, Übersetzungsfehler oder Probleme bei der Bedienung.'],
    ['/impressum', 'Project information', 'Projektinformationen', 'Impressum', 'Impressum', 'Contact and disclosure information for Not a Fact Anymore.', 'Kontakt und Offenlegung für Not a Fact Anymore.'],
  ];
  for (const [path, enTitle, deTitle, enLabel, deLabel, enDescription, deDescription] of landingPages) {
    add(path, 'en', enTitle, enLabel, enDescription);
    add(localizedPath(path, 'de'), 'de', deTitle, deLabel, deDescription);
  }
  const translationById = new Map(translations.filter(t => t.data.locale === 'de').map(t => [t.data.entryId, t]));
  for (const entry of entries) {
    add(`/entries/${entry.id}`, 'en', entry.data.claim, `Formerly accepted claim · ${entry.data.category}`, entry.data.summary, `Historical claim: ${entry.data.claim}`);
    const translated = translationById.get(entry.id);
    if (translated && translationMatchesEntry(entry, translated)) {
      add(`/de/entries/${entry.id}`, 'de', translated.data.claim, `Früher akzeptierte Aussage · ${categoryLabel(entry.data.category, 'de')}`, translated.data.summary, `Historische Aussage: ${translated.data.claim}`);
    }
  }
  const beliefTranslationById = currentInstitutionalTranslationMap(beliefs, beliefTranslations.filter(t => t.data.locale === 'de'));
  for (const belief of beliefs) {
    for (const locale of ['en', 'de'] as const) {
      const translation = beliefTranslationById.get(belief.id);
      if (locale === 'de' && !translation) continue;
      const entry = normalizeInstitutionalBelief(belief, locale, locale === 'de' ? translation : undefined);
      const label = locale === 'de' ? 'Historische institutionelle Überzeugung' : 'Historical institutional belief';
      add(localizedPath(`/institutions/${belief.id}`, locale), locale, entry.title, label, entry.correction, `${entry.title} — ${label}`);
    }
  }
  for (const category of new Set(entries.map(entry => entry.data.category))) {
    for (const locale of ['en', 'de'] as const) {
      const title = categoryLabel(category, locale);
      add(localizedPath(`/categories/${category.toLowerCase()}`, locale), locale, title,
        locale === 'de' ? 'Ein Fachgebiet entdecken' : 'Explore a subject',
        locale === 'de' ? `Entdecke, wie sich akzeptierte Aussagen im Fachgebiet ${title} verändert haben.` : `Explore how accepted claims in ${title} changed when stronger evidence arrived.`);
    }
  }
  return cards;
}

export async function getSocialCard(path: string, locale: SiteLocale) {
  const cards = await getSocialCards();
  return cards.get(normalizedPath(path)) ?? cards.get(locale === 'de' ? '/de' : '/')!;
}

const escapeXml = (value: string) => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[ch]!);

// Conservative character widths keep the typography inside the card without a browser dependency.
const textWidth = (text: string, size: number) => [...text].reduce((sum, ch) => sum +
  (/[MW@%]/.test(ch) ? 0.95 : /[ilI1.,:;'!| ]/.test(ch) ? 0.32 : /[A-ZÄÖÜ]/.test(ch) ? 0.74 : 0.65) * size, 0);

const wrap = (text: string, size: number, width: number) => {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && textWidth(`${line} ${word}`, size) > width) { lines.push(line); line = ''; }
    if (line) line += ' ';
    // Split an unusually long token rather than allowing it to escape the image.
    for (const ch of word) {
      if (textWidth(line + ch, size) > width) { lines.push(line); line = ''; }
      line += ch;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.map(line => line.trim());
};

export function socialCardSvg(card: SocialCard) {
  let size = 76;
  let titleLines = wrap(card.title, size, 1050);
  while ((titleLines.length * size * 1.13 > 284) && size > 30) {
    size -= 2;
    titleLines = wrap(card.title, size, 1050);
  }
  const titleTop = 181 + size;
  const title = titleLines.map((line, index) => `<text x="72" y="${titleTop + index * size * 1.13}" font-size="${size}" font-weight="700">${escapeXml(line)}</text>`).join('');
  const description = wrap(card.description, 23, 1050).slice(0, 2);
  const allDescription = wrap(card.description, 23, 1050);
  if (allDescription.length > 2) description[1] = description[1].replace(/\s+\S+$/, '') + '…';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#f5f1e8"/>
    <rect width="14" height="630" fill="#c83d29"/>
    <g font-family="DejaVu Sans, sans-serif" fill="#191919">
      <circle cx="94" cy="72" r="25" fill="#c83d29"/>
      <text x="94" y="79" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">NF</text>
      <text x="137" y="80" font-size="26" font-weight="700">Not a Fact Anymore</text>
      <text x="1128" y="79" text-anchor="end" font-size="19" fill="#625e58">notafactanymore.com · ${card.locale.toUpperCase()}</text>
      <path d="M72 115H1128" stroke="#cec5b6"/>
      <text x="72" y="158" font-size="20" font-weight="700" fill="#b62e1d">${escapeXml(card.label)}</text>
      ${title}
      <path d="M72 495H1128" stroke="#c83d29" stroke-width="3"/>
      ${description.map((line, index) => `<text x="72" y="${540 + index * 33}" font-size="23" fill="#625e58">${escapeXml(line)}</text>`).join('')}
    </g>
  </svg>`;
}
