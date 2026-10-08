export const evidenceRelations = [
  {
    id: 'documents',
    label: { en: 'Documents', de: 'Dokumentiert' },
    description: {
      en: 'Records a historical assertion, institutional action or practice. Read the target and note to see precisely what is documented.',
      de: 'Hält eine historische Behauptung, institutionelle Maßnahme oder Praxis fest. Ziel und Erläuterung zeigen, was genau dokumentiert wird.',
    },
  },
  {
    id: 'supports',
    label: { en: 'Supports', de: 'Stützt' },
    description: {
      en: 'Provides evidence for the specific part of the account named by the target. A historical-belief target can concern evidence that a claim was accepted.',
      de: 'Liefert Belege für den durch das Ziel benannten Teil der Darstellung. Beim Ziel „Historische Überzeugung“ kann es darum gehen, dass eine Aussage akzeptiert wurde.',
    },
  },
  {
    id: 'contextualizes',
    label: { en: 'Contextualizes', de: 'Ordnet ein' },
    description: {
      en: 'Adds historical, methodological or interpretive context. The note explains how far that context bears on the target assertion.',
      de: 'Ergänzt historischen, methodischen oder interpretativen Kontext. Die Erläuterung zeigt, inwieweit dieser Kontext die Zielaussage betrifft.',
    },
  },
  {
    id: 'disputes',
    label: { en: 'Disputes', de: 'Widerspricht' },
    description: {
      en: 'Challenges or qualifies the assertion named by the target. Read the note for the disagreement and its scope.',
      de: 'Widerspricht der durch das Ziel benannten Aussage oder schränkt sie ein. Die Erläuterung beschreibt den Einwand und seine Reichweite.',
    },
  },
] as const;

export const institutionalCorrectionStates = [
  {
    id: 'corrected',
    label: { en: 'Corrected', de: 'Korrigiert' },
    description: {
      en: 'The case documents an institutional action addressing the belief or practice. The accompanying account defines the scope of that correction.',
      de: 'Der Fall dokumentiert eine institutionelle Maßnahme zur Korrektur der Überzeugung oder Praxis. Die zugehörige Darstellung benennt deren Reichweite.',
    },
  },
  {
    id: 'partial',
    label: { en: 'Partially corrected', de: 'Teilweise korrigiert' },
    description: {
      en: 'Documented changes address part of the belief or practice, while important elements remain or the institutional response is incomplete.',
      de: 'Dokumentierte Änderungen betreffen einen Teil der Überzeugung oder Praxis; wichtige Elemente bestehen fort oder die institutionelle Reaktion bleibt unvollständig.',
    },
  },
  {
    id: 'uncorrected',
    label: { en: 'Uncorrected', de: 'Nicht korrigiert' },
    description: {
      en: 'The cited record supports a finding that the specified institution has not corrected the relevant belief or practice, within the scope and period described.',
      de: 'Die angeführten Quellen stützen die Feststellung, dass die benannte Institution die betreffende Überzeugung oder Praxis im beschriebenen Umfang und Zeitraum nicht korrigiert hat.',
    },
  },
  {
    id: 'ongoing',
    label: { en: 'Ongoing', de: 'Laufend' },
    description: {
      en: 'The case documents a correction process still underway at the entry’s recorded review date.',
      de: 'Der Fall dokumentiert einen Korrekturprozess, der zum vermerkten Prüfdatum des Eintrags noch lief.',
    },
  },
  {
    id: 'undocumented',
    label: { en: 'Undocumented', de: 'Nicht dokumentiert' },
    description: {
      en: 'The sources used for this episode do not adequately establish what institutional correction occurred. The catalogue leaves that outcome open.',
      de: 'Die für diese Episode verwendeten Quellen belegen nicht hinreichend, welche institutionelle Korrektur erfolgte. Der Katalog lässt diesen Ausgang offen.',
    },
  },
] as const;
