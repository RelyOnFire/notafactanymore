export type SemanticAxis = 'error-pattern' | 'correction-mechanism';

export type ErrorPatternId =
  | 'appearance-as-reality'
  | 'intuitive-mechanism'
  | 'single-factor-reduction'
  | 'static-system'
  | 'universal-from-limited'
  | 'absence-as-impossibility'
  | 'association-as-causation'
  | 'proxy-as-outcome';

export type CorrectionMechanismId =
  | 'controlled-experiment'
  | 'instrument-enabled-observation'
  | 'causal-mechanism'
  | 'comparative-analysis'
  | 'population-outcomes'
  | 'dating-chronology'
  | 'counterexample-discovery'
  | 'converging-evidence';

export interface OntologyTerm {
  id: ErrorPatternId | CorrectionMechanismId;
  axis: SemanticAxis;
  label: { en: string; de: string };
  definition: { en: string; de: string };
  inclusionRule: string;
  exclusionRule: string;
}

export interface KnowledgeSemanticAssignment {
  errorPatterns: readonly ErrorPatternId[];
  correctionMechanisms: readonly CorrectionMechanismId[];
}

export const errorPatterns: readonly OntologyTerm[] = [
  {
    id: 'appearance-as-reality',
    axis: 'error-pattern',
    label: { en: 'Appearance taken as reality', de: 'Erscheinung als Wirklichkeit' },
    definition: {
      en: 'Visible appearance, apparent motion, or superficial resemblance was treated as the underlying structure or identity.',
      de: 'Sichtbarer Eindruck, scheinbare Bewegung oder oberflächliche Ähnlichkeit wurde mit der zugrunde liegenden Struktur oder Identität gleichgesetzt.',
    },
    inclusionRule: 'Use when the old claim materially depended on what something looked like, seemed to do, or resembled at the available observational resolution.',
    exclusionRule: 'Do not use merely because evidence was observational; the misleading appearance or resemblance must be central to the old model.',
  },
  {
    id: 'intuitive-mechanism',
    axis: 'error-pattern',
    label: { en: 'Intuitive causal story', de: 'Intuitive Kausalerklärung' },
    definition: {
      en: 'A plausible everyday mechanism was accepted because it made sense qualitatively, before the causal chain was directly tested.',
      de: 'Ein im Alltag plausibel wirkender Mechanismus wurde akzeptiert, bevor die Kausalkette direkt geprüft worden war.',
    },
    inclusionRule: 'Use when the old explanation was primarily a causal story inferred from common experience, analogy, or qualitative fit rather than demonstrated mechanism.',
    exclusionRule: 'Do not use for every incorrect causal claim; prefer association-as-causation, proxy-as-outcome, or single-factor-reduction when those are the more specific failure.',
  },
  {
    id: 'single-factor-reduction',
    axis: 'error-pattern',
    label: { en: 'Single-factor reduction', de: 'Reduktion auf einen Faktor' },
    definition: {
      en: 'A complex phenomenon was reduced to one dominant cause or process that could not account for the full pattern of evidence.',
      de: 'Ein komplexes Phänomen wurde auf eine dominante Ursache oder einen einzigen Prozess reduziert, der die gesamte Evidenz nicht erklären konnte.',
    },
    inclusionRule: 'Use when the correction required adding other major causes, pathways, or interacting factors rather than simply replacing one wrong cause with another.',
    exclusionRule: 'Do not use when the historical model proposed one cause only because no competing cause had yet been detected and the modern account is itself essentially single-cause.',
  },
  {
    id: 'static-system',
    axis: 'error-pattern',
    label: { en: 'Static-system assumption', de: 'Annahme eines statischen Systems' },
    definition: {
      en: 'A system that changes, moves, renews, evolves, or cycles was modeled as fixed or permanently settled.',
      de: 'Ein System, das sich verändert, bewegt, erneuert, entwickelt oder zyklisch verhält, wurde als fest oder dauerhaft unveränderlich modelliert.',
    },
    inclusionRule: 'Use when immobility, permanence, or a single stable endpoint was an explicit part of the old claim.',
    exclusionRule: 'Do not use merely because knowledge later changed; the subject of the claim itself must have been treated as static.',
  },
  {
    id: 'universal-from-limited',
    axis: 'error-pattern',
    label: { en: 'Universal rule from limited evidence', de: 'Universelle Regel aus begrenzter Evidenz' },
    definition: {
      en: 'A pattern seen in a limited sample, environment, time span, or measurement range was generalized into an absolute rule.',
      de: 'Ein Muster aus einer begrenzten Stichprobe, Umwelt, Zeitspanne oder Messreichweite wurde zu einer absoluten Regel verallgemeinert.',
    },
    inclusionRule: 'Use when a later exception, wider sample, or expanded range directly narrowed or overturned an absolute generalization.',
    exclusionRule: 'Do not use for ordinary uncertainty or estimates that were explicitly presented as provisional ranges.',
  },
  {
    id: 'absence-as-impossibility',
    axis: 'error-pattern',
    label: { en: 'Absence treated as impossibility', de: 'Nichtbeobachtung als Unmöglichkeit' },
    definition: {
      en: 'Failure to detect, observe, culture, or preserve something was treated as evidence that it did not exist or could not occur.',
      de: 'Das Ausbleiben eines Nachweises, einer Beobachtung, Kultivierung oder Erhaltung wurde als Beleg dafür genommen, dass etwas nicht existiere oder unmöglich sei.',
    },
    inclusionRule: 'Use when the old claim depended on a detection limit, sampling gap, preservation bias, or missing observation that was later overcome.',
    exclusionRule: 'Do not use whenever a claim happened to lack evidence; the inference from non-detection to non-existence must be identifiable.',
  },
  {
    id: 'association-as-causation',
    axis: 'error-pattern',
    label: { en: 'Association treated as causation', de: 'Zusammenhang als Kausalität' },
    definition: {
      en: 'An observed association was interpreted as a causal effect without adequately separating confounding, selection, or reverse causation.',
      de: 'Ein beobachteter Zusammenhang wurde als kausaler Effekt interpretiert, ohne Störfaktoren, Selektion oder umgekehrte Kausalität ausreichend zu trennen.',
    },
    inclusionRule: 'Use when non-randomized association or co-occurrence was a central reason for believing an intervention, exposure, or trait caused the outcome.',
    exclusionRule: 'Do not use for purely mechanistic speculation with no empirical association; use intuitive-mechanism instead.',
  },
  {
    id: 'proxy-as-outcome',
    axis: 'error-pattern',
    label: { en: 'Proxy treated as outcome', de: 'Surrogat als Endpunkt' },
    definition: {
      en: 'Improving an intermediate marker or surrogate was assumed to improve the real outcome that mattered.',
      de: 'Die Verbesserung eines Zwischenmarkers oder Surrogats wurde mit einer Verbesserung des eigentlich relevanten Endpunkts gleichgesetzt.',
    },
    inclusionRule: 'Use when treatment or theory success was inferred from a marker that later diverged from morbidity, mortality, function, or another substantive endpoint.',
    exclusionRule: 'Do not use for ordinary measurement error or for markers already validated against the relevant outcome.',
  },
];

export const correctionMechanisms: readonly OntologyTerm[] = [
  {
    id: 'controlled-experiment',
    axis: 'correction-mechanism',
    label: { en: 'Controlled experiment', de: 'Kontrolliertes Experiment' },
    definition: {
      en: 'A manipulation, comparison, or controlled test separated competing explanations and exposed a failed prediction.',
      de: 'Eine Manipulation, ein Vergleich oder ein kontrollierter Test trennte konkurrierende Erklärungen und machte eine falsche Vorhersage sichtbar.',
    },
    inclusionRule: 'Use when deliberately changing conditions or assigning interventions was central to the correction.',
    exclusionRule: 'Do not use for passive measurement alone, even when the measurement was precise.',
  },
  {
    id: 'instrument-enabled-observation',
    axis: 'correction-mechanism',
    label: { en: 'Instrument-enabled observation', de: 'Instrumentengestützte Beobachtung' },
    definition: {
      en: 'A new instrument, imaging method, detector, or measurement technique revealed structure or behavior that unaided observation had missed.',
      de: 'Ein neues Instrument, Bildgebungsverfahren, Detektor oder Messverfahren machte Strukturen oder Verhalten sichtbar, die der direkten Beobachtung entgangen waren.',
    },
    inclusionRule: 'Use when improved observational reach or resolution was a decisive part of the correction.',
    exclusionRule: 'Do not use just because instruments were present; the new capability must have changed what could be observed or measured.',
  },
  {
    id: 'causal-mechanism',
    axis: 'correction-mechanism',
    label: { en: 'Causal mechanism identified', de: 'Kausaler Mechanismus identifiziert' },
    definition: {
      en: 'The correction became compelling when a concrete causal agent, pathway, vector, or physical process was identified and linked to the effect.',
      de: 'Die Korrektur wurde überzeugend, als ein konkreter Erreger, Pfad, Vektor oder physikalischer Prozess identifiziert und mit dem Effekt verknüpft wurde.',
    },
    inclusionRule: 'Use when identifying how the effect is produced materially changed the accepted explanation.',
    exclusionRule: 'Do not use merely because the modern theory contains mechanisms; the historical correction must have depended on establishing one.',
  },
  {
    id: 'comparative-analysis',
    axis: 'correction-mechanism',
    label: { en: 'Comparative / molecular analysis', de: 'Vergleichende / molekulare Analyse' },
    definition: {
      en: 'Systematic comparison across organisms, specimens, populations, structures, or molecular sequences exposed relationships hidden by the older classification.',
      de: 'Systematische Vergleiche zwischen Organismen, Funden, Populationen, Strukturen oder Molekülsequenzen zeigten Beziehungen, die die ältere Einordnung verdeckt hatte.',
    },
    inclusionRule: 'Use when cross-case comparison, anatomy, genetics, phylogeny, or molecular evidence was central to reclassification or reconstruction.',
    exclusionRule: 'Do not use for a single decisive specimen unless its force came from comparison with a broader reference set.',
  },
  {
    id: 'population-outcomes',
    axis: 'correction-mechanism',
    label: { en: 'Population and outcome evidence', de: 'Populations- und Endpunktdaten' },
    definition: {
      en: 'Trials, cohorts, epidemiology, or outcome tracking tested what happened to people or populations rather than relying on theory or surrogate markers.',
      de: 'Studien, Kohorten, Epidemiologie oder Endpunktverfolgung prüften, was mit Menschen oder Populationen tatsächlich geschah, statt sich auf Theorie oder Surrogatmarker zu verlassen.',
    },
    inclusionRule: 'Use when comparative rates, randomized outcomes, or population-level patterns were decisive.',
    exclusionRule: 'Do not use for laboratory experiments whose endpoint was not a population or clinical/ecological outcome.',
  },
  {
    id: 'dating-chronology',
    axis: 'correction-mechanism',
    label: { en: 'Dating and chronology', de: 'Datierung und Chronologie' },
    definition: {
      en: 'Improved dating, stratigraphy, sequencing, or chronological constraints made the old historical order untenable.',
      de: 'Verbesserte Datierung, Stratigraphie, Sequenzierung oder chronologische Grenzen machten die alte zeitliche Einordnung unhaltbar.',
    },
    inclusionRule: 'Use when establishing when something happened was a direct reason the old historical claim failed.',
    exclusionRule: 'Do not use when dates are merely background metadata rather than evidence in the correction.',
  },
  {
    id: 'counterexample-discovery',
    axis: 'correction-mechanism',
    label: { en: 'Decisive counterexample', de: 'Entscheidendes Gegenbeispiel' },
    definition: {
      en: 'A specimen, site, event, environment, or observation directly violated a claim that had been framed as universal or impossible.',
      de: 'Ein Fund, Ort, Ereignis, Lebensraum oder eine Beobachtung widersprach direkt einer Behauptung, die als universell oder unmöglich formuliert war.',
    },
    inclusionRule: 'Use when one or more well-verified exceptions were logically sufficient to break the old absolute claim.',
    exclusionRule: 'Do not use when the correction depended mainly on a gradual statistical shift rather than a clear violating case.',
  },
  {
    id: 'converging-evidence',
    axis: 'correction-mechanism',
    label: { en: 'Converging independent evidence', de: 'Konvergierende unabhängige Evidenz' },
    definition: {
      en: 'Several independent lines of evidence, often from different methods, converged on one replacement model.',
      de: 'Mehrere unabhängige Evidenzlinien, oft aus unterschiedlichen Methoden, liefen auf dasselbe neue Modell hinaus.',
    },
    inclusionRule: 'Use when no single observation carried the correction and the strength came from mutually reinforcing evidence streams.',
    exclusionRule: 'Do not use simply because a mature theory now has many supporting facts; convergence must characterize the historical correction itself.',
  },
];

export const ontologyTerms: readonly OntologyTerm[] = [...errorPatterns, ...correctionMechanisms];

// Curated rather than inferred. An entry is included only when the historical narrative
// supports at least one specific error pattern and one specific correction mechanism.
// Categories are deliberately not semantic edges: they remain a filter in the UI.
export const knowledgeAssignments = {
  'all-life-depends-on-sunlight': {
    errorPatterns: ['universal-from-limited'],
    correctionMechanisms: ['counterexample-discovery', 'causal-mechanism'],
  },
  'all-life-fits-five-kingdoms': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['comparative-analysis'],
  },
  'all-mammals-give-live-birth': {
    errorPatterns: ['universal-from-limited'],
    correctionMechanisms: ['counterexample-discovery'],
  },
  'all-prokaryotes-are-bacteria': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['comparative-analysis'],
  },
  'fungi-are-plants': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['comparative-analysis'],
  },
  'corals-are-plants': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['comparative-analysis'],
  },
  'sponges-are-plants': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['comparative-analysis'],
  },
  'blue-green-algae-are-algae': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['comparative-analysis'],
  },
  'giant-pandas-are-raccoons': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['comparative-analysis'],
  },
  'species-are-immutable': {
    errorPatterns: ['static-system'],
    correctionMechanisms: ['converging-evidence'],
  },
  'natural-selection-is-always-slow': {
    errorPatterns: ['universal-from-limited'],
    correctionMechanisms: ['counterexample-discovery', 'population-outcomes'],
  },
  'coelacanth-extinct': {
    errorPatterns: ['absence-as-impossibility'],
    correctionMechanisms: ['counterexample-discovery'],
  },
  'most-microorganisms-can-be-cultured': {
    errorPatterns: ['universal-from-limited'],
    correctionMechanisms: ['instrument-enabled-observation', 'comparative-analysis'],
  },
  'bacteria-have-no-cytoskeleton': {
    errorPatterns: ['absence-as-impossibility'],
    correctionMechanisms: ['instrument-enabled-observation'],
  },
  'adult-brain-cannot-make-new-neurons': {
    errorPatterns: ['absence-as-impossibility'],
    correctionMechanisms: ['instrument-enabled-observation', 'counterexample-discovery'],
  },
  'earth-centered-universe': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['instrument-enabled-observation', 'converging-evidence'],
  },
  'comets-are-atmospheric-phenomena': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['instrument-enabled-observation'],
  },
  'mercury-synchronous-rotation': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['instrument-enabled-observation'],
  },
  'heavens-are-immutable': {
    errorPatterns: ['static-system'],
    correctionMechanisms: ['instrument-enabled-observation', 'counterexample-discovery'],
  },
  'stars-are-fixed-in-place': {
    errorPatterns: ['static-system'],
    correctionMechanisms: ['instrument-enabled-observation'],
  },
  'milky-way-entire-universe': {
    errorPatterns: ['universal-from-limited'],
    correctionMechanisms: ['instrument-enabled-observation', 'converging-evidence'],
  },
  'universe-is-static': {
    errorPatterns: ['static-system'],
    correctionMechanisms: ['instrument-enabled-observation'],
  },
  'mars-is-crossed-by-canals': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['instrument-enabled-observation'],
  },
  'planetary-moons-are-geologically-dead': {
    errorPatterns: ['absence-as-impossibility'],
    correctionMechanisms: ['instrument-enabled-observation', 'counterexample-discovery'],
  },
  'moon-is-completely-dry': {
    errorPatterns: ['absence-as-impossibility'],
    correctionMechanisms: ['instrument-enabled-observation', 'counterexample-discovery'],
  },
  'heavier-objects-fall-faster': {
    errorPatterns: ['intuitive-mechanism'],
    correctionMechanisms: ['controlled-experiment'],
  },
  'heat-is-caloric-fluid': {
    errorPatterns: ['intuitive-mechanism'],
    correctionMechanisms: ['controlled-experiment'],
  },
  'white-light-is-simple': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['controlled-experiment'],
  },
  'light-requires-luminiferous-ether': {
    errorPatterns: ['intuitive-mechanism'],
    correctionMechanisms: ['controlled-experiment'],
  },
  'atoms-are-indivisible': {
    errorPatterns: ['universal-from-limited'],
    correctionMechanisms: ['instrument-enabled-observation', 'counterexample-discovery'],
  },
  'air-is-a-single-element': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['controlled-experiment'],
  },
  'water-is-an-element': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['controlled-experiment'],
  },
  'combustion-releases-phlogiston': {
    errorPatterns: ['intuitive-mechanism'],
    correctionMechanisms: ['controlled-experiment'],
  },
  'organic-compounds-require-living-organisms': {
    errorPatterns: ['universal-from-limited'],
    correctionMechanisms: ['controlled-experiment', 'counterexample-discovery'],
  },
  'noble-gases-are-completely-inert': {
    errorPatterns: ['universal-from-limited'],
    correctionMechanisms: ['controlled-experiment', 'counterexample-discovery'],
  },
  'one-atom-thick-materials-cannot-exist': {
    errorPatterns: ['absence-as-impossibility'],
    correctionMechanisms: ['controlled-experiment', 'counterexample-discovery'],
  },
  'fixed-continents-plate-tectonics': {
    errorPatterns: ['static-system'],
    correctionMechanisms: ['instrument-enabled-observation', 'converging-evidence'],
  },
  'earth-magnetic-field-never-reverses': {
    errorPatterns: ['static-system'],
    correctionMechanisms: ['instrument-enabled-observation', 'converging-evidence'],
  },
  'meteor-crater-is-volcanic': {
    errorPatterns: ['intuitive-mechanism'],
    correctionMechanisms: ['converging-evidence'],
  },
  'deep-ocean-floor-flat-featureless': {
    errorPatterns: ['absence-as-impossibility'],
    correctionMechanisms: ['instrument-enabled-observation'],
  },
  'deep-ocean-lifeless': {
    errorPatterns: ['absence-as-impossibility'],
    correctionMechanisms: ['instrument-enabled-observation', 'counterexample-discovery'],
  },
  'deep-ocean-water-is-stagnant': {
    errorPatterns: ['static-system'],
    correctionMechanisms: ['instrument-enabled-observation'],
  },
  'glaciers-never-covered-northern-continents': {
    errorPatterns: ['absence-as-impossibility'],
    correctionMechanisms: ['converging-evidence'],
  },
  'oceanic-crust-as-old-as-continental': {
    errorPatterns: ['static-system'],
    correctionMechanisms: ['dating-chronology', 'converging-evidence'],
  },
  'malaria-caused-by-bad-air': {
    errorPatterns: ['intuitive-mechanism'],
    correctionMechanisms: ['causal-mechanism'],
  },
  'cholera-caused-by-miasma': {
    errorPatterns: ['intuitive-mechanism'],
    correctionMechanisms: ['population-outcomes', 'causal-mechanism'],
  },
  'peptic-ulcers': {
    errorPatterns: ['single-factor-reduction'],
    correctionMechanisms: ['causal-mechanism', 'controlled-experiment'],
  },
  'radical-mastectomy-best-survival': {
    errorPatterns: ['intuitive-mechanism'],
    correctionMechanisms: ['population-outcomes'],
  },
  'suppressing-arrhythmias-after-heart-attack-saves-lives': {
    errorPatterns: ['proxy-as-outcome'],
    correctionMechanisms: ['population-outcomes'],
  },
  'hormone-therapy-prevents-heart-disease': {
    errorPatterns: ['association-as-causation'],
    correctionMechanisms: ['population-outcomes'],
  },
  'pregnancy-bed-rest-prevents-preterm-birth': {
    errorPatterns: ['intuitive-mechanism'],
    correctionMechanisms: ['population-outcomes'],
  },
  'routine-episiotomy-protects-mothers': {
    errorPatterns: ['intuitive-mechanism'],
    correctionMechanisms: ['population-outcomes'],
  },
  'babies-should-sleep-face-down': {
    errorPatterns: ['intuitive-mechanism'],
    correctionMechanisms: ['population-outcomes'],
  },
  'schizophrenia-caused-by-family-dynamics': {
    errorPatterns: ['single-factor-reduction'],
    correctionMechanisms: ['converging-evidence'],
  },
  'memory-is-a-faithful-recording': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['controlled-experiment'],
  },
  'infant-attachment-is-driven-by-feeding': {
    errorPatterns: ['single-factor-reduction'],
    correctionMechanisms: ['controlled-experiment'],
  },
  'venting-anger-reduces-aggression': {
    errorPatterns: ['intuitive-mechanism'],
    correctionMechanisms: ['controlled-experiment'],
  },
  'autism-caused-by-cold-parenting': {
    errorPatterns: ['single-factor-reduction'],
    correctionMechanisms: ['converging-evidence'],
  },
  'clovis-were-first-americans': {
    errorPatterns: ['universal-from-limited'],
    correctionMechanisms: ['dating-chronology', 'converging-evidence'],
  },
  'north-american-humans-arrived-after-last-glacial-maximum': {
    errorPatterns: ['universal-from-limited'],
    correctionMechanisms: ['dating-chronology', 'converging-evidence'],
  },
  'classical-statues-were-unpainted-white': {
    errorPatterns: ['appearance-as-reality'],
    correctionMechanisms: ['instrument-enabled-observation', 'converging-evidence'],
  },
  'precolumbian-amazon-was-pristine-wilderness': {
    errorPatterns: ['absence-as-impossibility'],
    correctionMechanisms: ['instrument-enabled-observation', 'converging-evidence'],
  },
  'stonehenge-was-built-by-druids': {
    errorPatterns: ['universal-from-limited'],
    correctionMechanisms: ['dating-chronology'],
  },
  'homo-floresiensis-was-a-diseased-human': {
    errorPatterns: ['single-factor-reduction'],
    correctionMechanisms: ['comparative-analysis', 'converging-evidence'],
  },
} satisfies Record<string, KnowledgeSemanticAssignment>;

export const ontologyTermById = new Map(ontologyTerms.map((term) => [term.id, term]));
