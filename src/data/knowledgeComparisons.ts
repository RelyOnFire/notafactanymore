import type { ErrorPatternId, CorrectionMechanismId } from './knowledgeOntology';
import { knowledgeAssignments } from './knowledgeOntology';
import type { SiteLocale } from '../lib/i18n';

type Copy = Record<SiteLocale, string>;
type Case = {
  entry: keyof typeof knowledgeAssignments;
  name: Copy;
  finding: Copy;
  source: { url: string; purpose: string };
};
type Comparison = {
  id: string;
  term: ErrorPatternId | CorrectionMechanismId;
  question: Copy;
  insight: Copy;
  limit: Copy;
  cases: [Case, Case];
};

export const comparisons: Comparison[] = [
  {
    id: 'what-repeated-observations-miss',
    term: 'appearance-as-reality',
    question: {
      en: 'When can a hundred observations repeat the same mistake?',
      de: 'Wann können hundert Beobachtungen denselben Irrtum bestätigen?',
    },
    insight: {
      en: 'Another night at the telescope and another statue in a museum could each reinforce an error. The crucial question was what had to happen for a particular view to reach the observer at all.',
      de: 'Eine weitere Nacht am Teleskop und eine weitere Statue im Museum konnten einen Irrtum festigen. Entscheidend war, unter welchen Bedingungen die Beobachter überhaupt etwas zu sehen bekamen.',
    },
    cases: [
      {
        entry: 'mercury-synchronous-rotation',
        name: { en: 'The face of Mercury', de: 'Merkurs scheinbar unverändertes Gesicht' },
        finding: {
          en: 'At favorable viewing times, Mercury repeatedly presented nearly the same terrain. That made an 88-day rotation look plausible. In 1965 radar measured the spin independently of recognizable surface markings and put it at about 59 days.',
          de: 'Zu günstigen Beobachtungszeiten zeigte Merkur immer wieder fast dieselbe Landschaft. Eine Drehung in 88 Tagen erschien plausibel. 1965 ergab eine Radarmessung rund 59 Tage, ohne dass dafür Oberflächenmerkmale wiedererkannt werden mussten.',
        },
        source: { url: 'https://ui.adsabs.harvard.edu/abs/1965Natur.206Q1240P', purpose: 'Primary research' },
      },
      {
        entry: 'classical-statues-were-unpainted-white',
        name: { en: 'The color of ancient marble', de: 'Die Farbe antiker Marmorstatuen' },
        finding: {
          en: 'Marble survived centuries of weathering and cleaning better than its paint. A gallery full of pale statues could therefore give remarkably consistent evidence about what survives. Pigment traces recovered on the stone answered the different question of what viewers once saw.',
          de: 'Marmor überstand Verwitterung und Reinigung besser als seine Bemalung. Ein ganzer Saal heller Statuen konnte also zuverlässig zeigen, was erhalten blieb. Pigmentspuren auf dem Stein gaben Auskunft darüber, was Menschen in der Antike sahen.',
        },
        source: { url: 'https://www.metmuseum.org/essays/polychromy-of-roman-marble-sculpture', purpose: 'Current evidence' },
      },
    ],
    limit: {
      en: 'Mercury’s missing views still existed and could be measured another way. Much ancient paint is gone for good. A surviving trace can establish the presence of color while leaving the complete design uncertain.',
      de: 'Die übrigen Seiten Merkurs waren weiterhin da und ließen sich auf anderem Weg untersuchen. Viel antike Farbe ist endgültig verloren. Eine Pigmentspur kann Bemalung belegen, auch wenn das vollständige Muster offenbleibt.',
    },
  },
  {
    id: 'a-test-of-timing',
    term: 'dating-chronology',
    question: { en: 'What dates would have to line up for this story to work?', de: 'Welche Ereignisse müssten zeitlich zusammenpassen?' },
    insight: {
      en: 'A migration attributed to a technology requires the technology to be widespread in time. Two craters attributed to a single incoming pair require simultaneous impacts. Both explanations made a prediction about dates that could be tested independently of the resemblance that suggested them.',
      de: 'Soll eine Technik eine Wanderung erklären, muss sie rechtzeitig verbreitet gewesen sein. Sollen zwei Krater auf einen Doppelasteroiden zurückgehen, müssen die Einschläge gleichzeitig erfolgt sein. Beide Erklärungen machten eine zeitliche Vorhersage, die sich unabhängig prüfen ließ.',
    },
    cases: [
      {
        entry: 'yamnaya-expansion-was-powered-by-domestic-horses',
        name: { en: 'Horses and the Yamnaya migration', de: 'Pferde und die Ausbreitung der Jamnaja' },
        finding: {
          en: 'Ancient genomes place the rapid spread of the main domestic horse lineage around 2200 BCE. The major Yamnaya expansion into Europe had already taken place around 3000 BCE. Herds from that later expansion arrived too late to account for the migration.',
          de: 'Alte Genome datieren die rasche Verbreitung der wichtigsten Hauspferdelinie auf etwa 2200 v. Chr. Die große Ausbreitung der Jamnaja nach Europa hatte bereits um 3000 v. Chr. stattgefunden. Herden aus der späteren Expansion kamen als Motor dieser Wanderung zu spät.',
        },
        source: { url: 'https://doi.org/10.1038/s41586-024-07597-5', purpose: 'Primary research' },
      },
      {
        entry: 'ries-steinheim-were-one-double-impact',
        name: { en: 'The Ries and Steinheim craters', de: 'Die Krater im Ries und in Steinheim' },
        finding: {
          en: 'The two German craters lie only about 40 km apart. Researchers identified two layers disturbed by seismic shaking, with undisturbed sediment between them. They inferred an interval of roughly half a million to a million years between the impacts.',
          de: 'Die beiden Krater liegen nur rund 40 km auseinander. Forschende fanden zwei durch Erschütterungen verformte Schichten, zwischen denen ungestörtes Sediment lag. Daraus und aus Fossilfunden erschlossen sie einen Abstand von etwa einer halben bis einer Million Jahren.',
        },
        source: { url: 'https://www.nature.com/articles/s41598-022-21409-8', purpose: 'Primary research' },
      },
    ],
    limit: {
      en: 'The crater interpretation depends on linking each disturbed layer to its impact. The horse evidence concerns population-wide mobility. It leaves open whether individual Yamnaya people handled or rode horses.',
      de: 'Bei den Kratern hängt die Deutung davon ab, dass jede gestörte Schicht dem jeweiligen Einschlag zugeordnet werden kann. Die Pferdegenome geben Auskunft über Mobilität im großen Maßstab. Ob einzelne Menschen der Jamnaja Pferde hielten oder ritten, bleibt offen.',
    },
  },
  {
    id: 'the-outcome-that-wasnt-measured',
    term: 'population-outcomes',
    question: { en: 'What if the measurement improves and the outcome gets worse?', de: 'Was, wenn der Messwert besser und das Ergebnis schlechter wird?' },
    insight: {
      en: 'An indicator can be measured accurately and still answer the wrong question. In these cases the gap becomes visible by naming the outcome, the population and the time span the original measurement left out.',
      de: 'Ein Indikator kann präzise gemessen sein und trotzdem die falsche Frage beantworten. In beiden Fällen wird die Lücke sichtbar, sobald man benennt, welches Ergebnis, welche Population und welchen Zeitraum die Messung ausließ.',
    },
    cases: [
      {
        entry: 'suppressing-arrhythmias-after-heart-attack-saves-lives',
        name: { en: 'A better-looking ECG', de: 'Ein unauffälligeres EKG' },
        finding: {
          en: 'After a heart attack, premature ventricular beats predicted higher risk. Encainide and flecainide suppressed those beats. When the CAST trial compared survival, more patients died on the drugs than on placebo.',
          de: 'Nach einem Herzinfarkt gingen vorzeitige Kammerschläge mit einem höheren Risiko einher. Encainid und Flecainid unterdrückten diese Schläge. Als die CAST-Studie das Überleben verglich, starben unter den Wirkstoffen mehr Patienten als unter Placebo.',
        },
        source: { url: 'https://www.nejm.org/doi/full/10.1056/NEJM198908103210629', purpose: 'Primary research' },
      },
      {
        entry: 'ddt-is-environmentally-harmless',
        name: { en: 'A pesticide’s short-term safety', de: 'Die kurzfristige Sicherheit eines Insektizids' },
        finding: {
          en: 'DDT killed insects and had relatively low immediate toxicity to humans. Bird reproduction depended on another exposure entirely. Its persistent breakdown product DDE accumulated in food webs and thinned eggshells in sensitive species.',
          de: 'DDT tötete Insekten und war für Menschen vergleichsweise wenig akut giftig. Für die Fortpflanzung von Vögeln zählte eine andere Belastung. Das langlebige Abbauprodukt DDE reicherte sich in Nahrungsnetzen an und ließ bei empfindlichen Arten die Eierschalen dünner werden.',
        },
        source: { url: 'https://archive.epa.gov/epa/aboutepa/eagles-other-birds-thrive-after-epas-1972-ddt-ban.html', purpose: 'Current evidence' },
      },
    ],
    limit: {
      en: 'CAST compared a marker and survival in the same patient population. The DDT inference crossed species and time scales. A short-term toxicity test could be accurate for humans and still say very little about the next generation of birds.',
      de: 'CAST verglich einen Messwert und das Überleben in derselben Patientengruppe. Bei DDT übertrug man Befunde auf andere Arten und Zeiträume. Ein Test zur akuten Giftigkeit für Menschen konnte zutreffen und dennoch kaum etwas über die nächste Vogelgeneration aussagen.',
    },
  },
  {
    id: 'how-far-one-exception-reaches',
    term: 'counterexample-discovery',
    question: { en: 'Exactly how much can one exception overturn?', de: 'Wie viel kann ein einziges Gegenbeispiel widerlegen?' },
    insight: {
      en: 'One specimen can settle an existence question. How often something occurs, where it occurs and under what conditions it persists are separate questions that require more observations.',
      de: 'Ein einziges Exemplar kann eine Existenzfrage entscheiden. Wie häufig etwas vorkommt, wo es vorkommt und unter welchen Bedingungen es Bestand hat, erfordert weitere Beobachtungen.',
    },
    cases: [
      {
        entry: 'coelacanth-extinct',
        name: { en: 'A living coelacanth', de: 'Ein lebender Quastenflosser' },
        finding: {
          en: 'A fish caught off South Africa in 1938 belonged to a lineage known only from fossils. That one catch established that the lineage had living representatives. It could not establish the size of the population or which fossil species had survived.',
          de: 'Ein 1938 vor Südafrika gefangener Fisch gehörte zu einer bis dahin nur fossil bekannten Linie. Ein Fang belegte, dass die Linie lebende Vertreter hatte. Über die Größe der Population oder das Überleben einzelner fossiler Arten gab er keine Auskunft.',
        },
        source: { url: 'https://www.nhm.ac.uk/discover/coelacanths-the-fish-that-outdid-the-loch-ness-monster.html', purpose: 'Historical context' },
      },
      {
        entry: 'noble-gases-are-completely-inert',
        name: { en: 'A compound of xenon', de: 'Eine Xenonverbindung' },
        finding: {
          en: 'In 1962 Neil Bartlett produced a compound of xenon. A single successful reaction was enough to overturn the prohibition on noble-gas compounds. The familiar observation that most noble gases rarely react under ordinary conditions still held.',
          de: '1962 stellte Neil Bartlett eine Xenonverbindung her. Eine erfolgreiche Reaktion genügte, um die angenommene Unmöglichkeit von Edelgasverbindungen zu widerlegen. Dass die meisten Edelgase unter gewöhnlichen Bedingungen kaum reagieren, galt weiterhin.',
        },
        source: { url: 'https://pubs.rsc.org/en/content/articlelanding/2013/cc/c3cc41387j', purpose: 'Current evidence' },
      },
    ],
    limit: {
      en: 'The catch documented something already present in nature. The reaction established what chemists could produce under particular conditions. Each settled a different meaning of “exists.”',
      de: 'Der Fang wies etwas nach, das in der Natur bereits vorkam. Die Reaktion zeigte, was sich unter bestimmten Bedingungen herstellen ließ. In beiden Fällen hatte „existiert“ eine andere Bedeutung.',
    },
  },
  {
    id: 'taking-apart-what-looks-uniform',
    term: 'controlled-experiment',
    question: { en: 'Does the apparatus reveal a difference or create it?', de: 'Macht das Experiment einen Unterschied sichtbar oder erzeugt es ihn?' },
    insight: {
      en: 'When a uniform input yields different outputs, the apparatus itself becomes a rival explanation. The next experiment has to show why those differences belong to the sample.',
      de: 'Wenn aus etwas Einheitlichem verschiedene Bestandteile hervorgehen, bietet sich die Apparatur selbst als Erklärung an. Ein weiterer Versuch muss zeigen, weshalb die Unterschiede zur Probe gehören.',
    },
    cases: [
      {
        entry: 'white-light-is-simple',
        name: { en: 'White light through a prism', de: 'Weißes Licht im Prisma' },
        finding: {
          en: 'A spectrum alone allowed two readings. The prism might make colors, or it might separate colors already present. Newton sent selected rays through a second prism and brought the separated colors back together to recover white.',
          de: 'Das Spektrum allein ließ zwei Deutungen zu. Das Prisma konnte Farben erzeugen oder vorhandene Farben trennen. Newton schickte ausgewählte Strahlen durch ein zweites Prisma und führte die getrennten Farben wieder zu Weiß zusammen.',
        },
        source: { url: 'https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00006', purpose: 'Historical context' },
      },
      {
        entry: 'air-is-a-single-element',
        name: { en: 'The gases in ordinary air', de: 'Die Gase in gewöhnlicher Luft' },
        finding: {
          en: 'Early chemists collected different “airs” with reproducibly different properties. Following which gases were consumed in combustion and respiration helped Lavoisier explain how ordinary air could be a mixture despite its uniform appearance.',
          de: 'Frühe Chemiker sammelten verschiedene „Luftarten“, deren Eigenschaften sich reproduzierbar unterschieden. Welche Gase bei Verbrennung und Atmung verbraucht wurden, half Lavoisier zu erklären, wie gewöhnliche Luft trotz ihres einheitlichen Erscheinungsbilds ein Gemisch sein konnte.',
        },
        source: { url: 'https://www.acs.org/education/whatischemistry/landmarks/josephpriestleyoxygen.html', purpose: 'Historical context' },
      },
    ],
    limit: {
      en: 'Newton could reverse the separation in a single optical setup. The chemical case took many experiments and a way to distinguish gases already in air from gases newly produced in reactions.',
      de: 'Newton konnte die Trennung in einer optischen Anordnung rückgängig machen. Bei der Luft brauchte es viele Experimente und eine Möglichkeit, bereits vorhandene Gase von Reaktionsprodukten zu unterscheiden.',
    },
  },
];
