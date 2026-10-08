import { localizedPath, type SiteLocale } from './i18n';

type ReadingCollection = 'entries' | 'institutions';

interface ReadingStep {
  collection: ReadingCollection;
  id: string;
  sourceAnchor: string;
  copy: Record<SiteLocale, {
    title: string;
    focus: string;
    description: string;
    question: string;
    sourceAction: string;
  }>;
}

// One sequence drives the guide and the navigation on its existing case pages.
const steps: ReadingStep[] = [
  {
    collection: 'entries',
    id: 'humans-have-48-chromosomes',
    sourceAnchor: 'sources',
    copy: {
      en: {
        title: 'Counting human chromosomes',
        focus: 'Better measurement',
        description: 'Improved chromosome preparations made an accepted count possible to check again.',
        question: 'What made the new count more reliable, and which cells does it describe?',
        sourceAction: 'Compare the source notes',
      },
      de: {
        title: 'Die Chromosomen des Menschen zählen',
        focus: 'Bessere Messung',
        description: 'Verbesserte Chromosomenpräparate ermöglichten es, eine akzeptierte Zahl erneut zu überprüfen.',
        question: 'Was machte die neue Zählung verlässlicher, und auf welche Zellen bezieht sie sich?',
        sourceAction: 'Quellenerläuterungen vergleichen',
      },
    },
  },
  {
    collection: 'entries',
    id: 'peptic-ulcers',
    sourceAnchor: 'sources',
    copy: {
      en: {
        title: 'Peptic ulcers',
        focus: 'A new explanation, with limits',
        description: 'The case sets out the evidence for H. pylori and NSAIDs, while keeping the role of stress in context.',
        question: 'How do the source notes support the main causes without claiming one cause explains every ulcer?',
        sourceAction: 'Compare the source notes',
      },
      de: {
        title: 'Peptische Geschwüre',
        focus: 'Eine neue Erklärung mit Grenzen',
        description: 'Der Eintrag erläutert die Evidenz zu H. pylori und NSAR und ordnet die Rolle von Stress ein.',
        question: 'Wie belegen die Quellen die Hauptursachen, ohne eine einzige Ursache für jedes Geschwür zu behaupten?',
        sourceAction: 'Quellenerläuterungen vergleichen',
      },
    },
  },
  {
    collection: 'institutions',
    id: 'routine-oxygen-heart-attack',
    sourceAnchor: 'united-states-acc-aha-2004-2013',
    copy: {
      en: {
        title: 'Routine oxygen for heart attacks',
        focus: 'Professional guidance changes',
        description: 'Follow a recommendation from its original evidence level through clinical trials to revised guidance.',
        question: 'Which patients did the recommendation concern, and what did the institution actually change?',
        sourceAction: 'Examine the guideline episode',
      },
      de: {
        title: 'Routine-Sauerstoff bei Herzinfarkt',
        focus: 'Fachleitlinien ändern sich',
        description: 'Verfolge eine Empfehlung von ihrem ursprünglichen Evidenzgrad über klinische Studien bis zur geänderten Leitlinie.',
        question: 'Welche Patienten betraf die Empfehlung, und was änderte die Institution tatsächlich?',
        sourceAction: 'Die Leitlinien-Episode ansehen',
      },
    },
  },
  {
    collection: 'institutions',
    id: 'lysenkoist-heredity',
    sourceAnchor: 'ussr-1948-1964',
    copy: {
      en: {
        title: 'Lysenkoist heredity',
        focus: 'When challenge is suppressed',
        description: 'Read how staffing, teaching and research controls gave a doctrine authority, then compare the institutional responses.',
        question: 'Which consequences are directly documented, and which wider historical outcomes require more cautious attribution?',
        sourceAction: 'Explore the country episodes',
      },
      de: {
        title: 'Lyssenkistische Vererbungslehre',
        focus: 'Wenn Widerspruch unterdrückt wird',
        description: 'Lies, wie Personal-, Lehrplan- und Forschungssteuerung einer Doktrin Autorität verliehen, und vergleiche die institutionellen Reaktionen.',
        question: 'Welche Folgen sind unmittelbar belegt, und welche größeren historischen Entwicklungen verlangen eine vorsichtigere Zuschreibung?',
        sourceAction: 'Die Länder-Episoden erkunden',
      },
    },
  },
];

export const readingPath = (locale: SiteLocale) => steps.map((step, index) => ({
  ...step.copy[locale],
  collection: step.collection,
  id: step.id,
  number: index + 1,
  href: localizedPath(`/${step.collection}/${step.id}/`, locale),
  sourceAnchor: step.sourceAnchor,
}));

export const readingPosition = (collection: ReadingCollection, id: string, locale: SiteLocale) => {
  const path = readingPath(locale);
  const index = path.findIndex(step => step.collection === collection && step.id === id);
  return index < 0 ? undefined : {
    step: path[index],
    previous: path[index - 1],
    next: path[index + 1],
    total: path.length,
  };
};
