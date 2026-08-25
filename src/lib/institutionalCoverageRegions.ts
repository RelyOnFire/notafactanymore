import type { SiteLocale } from './i18n';

export type InstitutionalCoverageRegionId =
  | 'north-america'
  | 'latin-america-caribbean'
  | 'northern-europe'
  | 'western-europe'
  | 'southern-europe'
  | 'eastern-europe'
  | 'russia-ussr-eurasia'
  | 'middle-east-west-asia'
  | 'caucasus'
  | 'central-asia'
  | 'south-asia'
  | 'east-asia'
  | 'southeast-asia'
  | 'north-africa'
  | 'west-africa'
  | 'central-africa'
  | 'east-africa'
  | 'southern-africa'
  | 'oceania'
  | 'cross-regional-global'
  | 'unclassified';

export interface InstitutionalCoverageRegion {
  id: Exclude<InstitutionalCoverageRegionId, 'unclassified'>;
  en: string;
  de: string;
  target: boolean;
}

export interface InstitutionalCoverageLocation {
  polity: string;
  region: string;
}

export const institutionalCoverageRegions: InstitutionalCoverageRegion[] = [
  { id: 'north-america', en: 'North America', de: 'Nordamerika', target: true },
  {
    id: 'latin-america-caribbean',
    en: 'Latin America & Caribbean',
    de: 'Lateinamerika & Karibik',
    target: true,
  },

  { id: 'northern-europe', en: 'Northern Europe', de: 'Nordeuropa', target: true },
  { id: 'western-europe', en: 'Western Europe', de: 'Westeuropa', target: true },
  { id: 'southern-europe', en: 'Southern Europe', de: 'Südeuropa', target: true },
  { id: 'eastern-europe', en: 'Eastern Europe', de: 'Osteuropa', target: true },

  {
    id: 'russia-ussr-eurasia',
    en: 'Russia / USSR / Eurasia',
    de: 'Russland / UdSSR / Eurasien',
    target: true,
  },
  {
    id: 'middle-east-west-asia',
    en: 'Middle East / West Asia',
    de: 'Naher Osten / Westasien',
    target: true,
  },
  { id: 'caucasus', en: 'Caucasus', de: 'Kaukasus', target: true },
  { id: 'central-asia', en: 'Central Asia', de: 'Zentralasien', target: true },
  { id: 'south-asia', en: 'South Asia', de: 'Südasien', target: true },
  { id: 'east-asia', en: 'East Asia', de: 'Ostasien', target: true },
  { id: 'southeast-asia', en: 'Southeast Asia', de: 'Südostasien', target: true },

  { id: 'north-africa', en: 'North Africa', de: 'Nordafrika', target: true },
  { id: 'west-africa', en: 'West Africa', de: 'Westafrika', target: true },
  { id: 'central-africa', en: 'Central Africa', de: 'Zentralafrika', target: true },
  { id: 'east-africa', en: 'East Africa', de: 'Ostafrika', target: true },
  { id: 'southern-africa', en: 'Southern Africa', de: 'Südliches Afrika', target: true },

  { id: 'oceania', en: 'Oceania', de: 'Ozeanien', target: true },

  {
    id: 'cross-regional-global',
    en: 'Cross-regional / Global',
    de: 'Überregional / Global',
    target: false,
  },
];

const normalize = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/[’'".,()]/g, ' ')
    .replace(/[–—/_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

type PolityRule = {
  id: Exclude<InstitutionalCoverageRegionId, 'unclassified'>;
  patterns: RegExp[];
};

const polityRules: PolityRule[] = [
  // Keep multi-continent / historical aggregate polities ahead of country-name matches.
  {
    id: 'russia-ussr-eurasia',
    patterns: [
      /\bsoviet union\b/,
      /\bsowjetunion\b/,
      /\bussr\b/,
      /\budssr\b/,
      /\brussian empire\b/,
      /\brussisches reich\b/,
      /\brussian sfsr\b/,
      /\brussia\b/,
      /\brussland\b/,
    ],
  },

  {
    id: 'latin-america-caribbean',
    patterns: [
      /\bmexico\b/, /\bmexiko\b/, /\bbrazil\b/, /\bbrasil/,
      /\bcolombia\b/, /\bkolumbien\b/, /\bchile\b/, /\bargentin/,
      /\bperu\b/, /\becuador\b/, /\bbolivia\b/, /\bbolivien\b/,
      /\bvenezuela\b/, /\bcuba\b/, /\bkuba\b/, /\bguatemala\b/,
      /\bhonduras\b/, /\bel salvador\b/, /\bnicaragua\b/,
      /\bcosta rica\b/, /\bpanama\b/, /\bparaguay\b/, /\buruguay\b/,
      /\bdominican\b/, /\bdominikan/, /\bhaiti\b/, /\bjamaica\b/,
      /\btrinidad\b/, /\btobago\b/, /\bpuerto rico\b/,
      /\bguyana\b/, /\bsuriname\b/, /\bbelize\b/,
    ],
  },
  {
    id: 'north-america',
    patterns: [
      /\bunited states\b/, /\bvereinigte staaten\b/, /\bu s\b/,
      /\busa\b/, /\bcanada\b/, /\bkanada\b/, /\bhawai/,
    ],
  },

  {
    id: 'northern-europe',
    patterns: [
      /\bunited kingdom\b/, /\bvereinigtes konigreich\b/,
      /\bgreat britain\b/, /\bgrossbritannien\b/, /\bbritain\b/,
      /\bengland\b/, /\bscotland\b/, /\bschottland\b/, /\bwales\b/,
      /\bsweden\b/, /\bschweden\b/, /\bfinland\b/, /\bfinnland\b/,
      /\bnorway\b/, /\bnorwegen\b/, /\bdenmark\b/, /\bdanemark\b/,
      /\biceland\b/, /\bisland\b/, /\bireland\b/, /\birland\b/,
      /\bestonia\b/, /\bestland\b/, /\blatvia\b/, /\blettland\b/,
      /\blithuania\b/, /\blitauen\b/,
    ],
  },
  {
    id: 'western-europe',
    patterns: [
      /\baustria\b/, /\bosterreich\b/, /\bgermany\b/, /\bdeutschland\b/,
      /\bfrance\b/, /\bfrankreich\b/, /\bbelgium\b/, /\bbelgien\b/,
      /\bnetherlands\b/, /\bniederlande\b/, /\bswitzerland\b/, /\bschweiz\b/,
      /\bluxembourg\b/, /\bluxemburg\b/, /\bliechtenstein\b/, /\bmonaco\b/,
    ],
  },
  {
    id: 'southern-europe',
    patterns: [
      /\bitaly\b/, /\bitalien\b/, /\bspain\b/, /\bspanien\b/,
      /\bportugal\b/, /\bgreece\b/, /\bgriechenland\b/,
      /\byugoslavia\b/, /\bjugoslawien\b/, /\bserbia\b/, /\bserbien\b/,
      /\bcroatia\b/, /\bkroatien\b/, /\bslovenia\b/, /\bslowenien\b/,
      /\bbosnia\b/, /\bbosnien\b/, /\bmontenegro\b/, /\balbania\b/,
      /\balbanien\b/, /\bmacedonia\b/, /\bmazedonien\b/, /\bmalta\b/,
    ],
  },
  {
    id: 'eastern-europe',
    patterns: [
      /\bpoland\b/, /\bpolen\b/, /\bpolish peoples republic\b/, /\bpolish people s republic\b/,
      /\bpolnische volksrepublik\b/,
      /\bhungary\b/, /\bungarn\b/,
      /\bczechoslovakia\b/, /\btschechoslowakei\b/,
      /\bczech\b/, /\btschech/, /\bslovakia\b/, /\bslowakei\b/,
      /\bromania\b/, /\brumanien\b/, /\bbulgaria\b/, /\bbulgarien\b/,
      /\bbelarus\b/, /\bweissrussland\b/, /\bukraine\b/,
      /\bmoldova\b/, /\bmoldau\b/,
    ],
  },

  {
    id: 'caucasus',
    patterns: [
      /\bgeorgia\b/, /\bgeorgien\b/, /\barmenia\b/, /\barmenien\b/,
      /\bazerbaijan\b/, /\baserbaidschan\b/,
    ],
  },
  {
    id: 'middle-east-west-asia',
    patterns: [
      /\bturkey\b/, /\bturkei\b/, /\bpersia\b/, /\bpersien\b/,
      /\bisrael\b/, /\bpalestin/, /\blebanon\b/, /\blibanon\b/,
      /\biraq\b/, /\birak\b/, /\biran\b/, /\bsyria\b/, /\bsyrien\b/,
      /\bjordan\b/, /\bsaudi\b/, /\byemen\b/, /\bjemen\b/,
      /\boman\b/, /\bqatar\b/, /\bkatar\b/, /\bbahrain\b/, /\bkuwait\b/,
      /\botoman\b/, /\bosman/,
    ],
  },
  {
    id: 'central-asia',
    patterns: [
      /\bkazakhstan\b/, /\bkasachstan\b/, /\bkyrgyz/, /\bkirgis/,
      /\buzbekistan\b/, /\busbekistan\b/, /\bturkmenistan\b/,
      /\btajikistan\b/, /\btadschikistan\b/,
    ],
  },
  {
    id: 'south-asia',
    patterns: [
      /\bbritish india\b/, /\bindia\b/, /\bindien\b/, /\bpakistan\b/,
      /\bbangladesh\b/, /\bbangladesch\b/, /\bsri lanka\b/,
      /\bnepal\b/, /\bbhutan\b/, /\bafghanistan\b/, /\bmaldives\b/,
      /\bmalediven\b/,
    ],
  },
  {
    id: 'east-asia',
    patterns: [
      /\bchina\b/, /\bjapan\b/, /\bkorea\b/, /\btaiwan\b/,
      /\bmongolia\b/, /\bmongolei\b/, /\bmanchukuo\b/, /\bmandschukuo\b/,
    ],
  },
  {
    id: 'southeast-asia',
    patterns: [
      /\bsingapore\b/, /\bsingapur\b/, /\bindonesia\b/, /\bindonesien\b/,
      /\bphilippines\b/, /\bphilippinen\b/, /\bmalaysia\b/,
      /\bthailand\b/, /\bvietnam\b/, /\bcambodia\b/, /\bkambodscha\b/,
      /\blaos\b/, /\bmyanmar\b/, /\bburma\b/, /\bbrunei\b/,
      /\btimor leste\b/, /\beast timor\b/,
    ],
  },

  {
    id: 'north-africa',
    patterns: [
      /\begypt\b/, /\bagypten\b/, /\bmorocco\b/, /\bmarokko\b/,
      /\balgeria\b/, /\balgerien\b/, /\btunisia\b/, /\btunesien\b/,
      /\blibya\b/, /\blibyen\b/, /\bsudan\b/, /\bwestern sahara\b/,
    ],
  },
  {
    id: 'west-africa',
    patterns: [
      /\bghana\b/, /\bgambia\b/, /\bnigeria\b/, /\bsenegal\b/,
      /\bsierra leone\b/, /\bliberia\b/, /\bcote d ivoire\b/,
      /\belfenbeinkuste\b/, /\bguinea bissau\b/, /\bguinea\b/,
      /\bburkina faso\b/, /\bmali\b/, /\bniger\b/, /\btogo\b/,
      /\bbenin\b/, /\bmauritania\b/, /\bmauretanien\b/,
      /\bcape verde\b/, /\bkap verde\b/,
    ],
  },
  {
    id: 'central-africa',
    patterns: [
      /\bdemocratic republic of the congo\b/, /\bdemokratische republik kongo\b/,
      /\bbelgian congo\b/, /\bbelgisch kongo\b/, /\bzaire\b/,
      /\brepublic of the congo\b/, /\brepublik kongo\b/, /\bcongo\b/, /\bkongo\b/,
      /\bcameroon\b/, /\bkamerun\b/, /\bcentral african\b/,
      /\bzentralafrikan/, /\bchad\b/, /\btschad\b/, /\bgabon\b/,
      /\bequatorial guinea\b/, /\baquatorialguinea\b/, /\bsao tome\b/,
    ],
  },
  {
    id: 'east-africa',
    patterns: [
      /\bkenya\b/, /\bkenia\b/, /\buganda\b/, /\btanzania\b/, /\btansania\b/,
      /\brwanda\b/, /\bruanda\b/, /\bburundi\b/, /\bethiopia\b/,
      /\bathiopien\b/, /\bsomalia\b/, /\beritrea\b/, /\bdjibouti\b/,
      /\bdschibuti\b/, /\bmadagascar\b/, /\bmadagaskar\b/, /\bmalawi\b/,
      /\bmozambique\b/, /\bmosambik\b/, /\bzambia\b/, /\bsambia\b/,
      /\bzimbabwe\b/, /\bsimbabwe\b/,
    ],
  },
  {
    id: 'southern-africa',
    patterns: [
      /\bsouth africa\b/, /\bsudafrika\b/, /\bbotswana\b/, /\bnamibia\b/,
      /\blesotho\b/, /\beswatini\b/, /\bswaziland\b/,
    ],
  },

  {
    id: 'oceania',
    patterns: [
      /\baustralia\b/, /\baustralien\b/, /\bnew zealand\b/, /\bneuseeland\b/,
      /\bpapua\b/, /\bnew guinea\b/, /\bneuguinea\b/, /\bfiji\b/, /\bfidschi\b/,
      /\bsamoa\b/, /\btonga\b/,
    ],
  },
];

const regionFallbacks: Record<string, InstitutionalCoverageRegionId> = {
  'north america': 'north-america',
  'latin america': 'latin-america-caribbean',
  'latin america caribbean': 'latin-america-caribbean',
  'caribbean': 'latin-america-caribbean',

  'northern europe': 'northern-europe',
  'western europe': 'western-europe',
  'southern europe': 'southern-europe',
  'eastern europe': 'eastern-europe',

  'eurasia': 'russia-ussr-eurasia',
  'ussr eurasia': 'russia-ussr-eurasia',
  'russia ussr eurasia': 'russia-ussr-eurasia',
  'middle east': 'middle-east-west-asia',
  'west asia': 'middle-east-west-asia',
  'middle east west asia': 'middle-east-west-asia',
  'caucasus': 'caucasus',
  'central asia': 'central-asia',
  'south asia': 'south-asia',
  'east asia': 'east-asia',
  'southeast asia': 'southeast-asia',

  'north africa': 'north-africa',
  'west africa': 'west-africa',
  'central africa': 'central-africa',
  'east africa': 'east-africa',
  'southern africa': 'southern-africa',

  'oceania': 'oceania',

  'global': 'cross-regional-global',
  'cross regional': 'cross-regional-global',
  'cross regional global': 'cross-regional-global',
  'europe and asia': 'cross-regional-global',
  'europe asia': 'cross-regional-global',
};

export const resolveInstitutionalCoverageRegion = (
  location: InstitutionalCoverageLocation,
): InstitutionalCoverageRegionId => {
  const polity = normalize(location.polity);

  for (const rule of polityRules) {
    if (rule.patterns.some((pattern) => pattern.test(polity))) {
      return rule.id;
    }
  }

  const rawRegion = normalize(location.region);
  return regionFallbacks[rawRegion] ?? 'unclassified';
};

export const institutionalCoverageRegionLabel = (
  id: InstitutionalCoverageRegionId,
  locale: SiteLocale,
) => {
  if (id === 'unclassified') {
    return locale === 'de' ? 'Nicht klassifiziert' : 'Unclassified';
  }

  const region = institutionalCoverageRegions.find((item) => item.id === id);
  if (!region) return id;
  return locale === 'de' ? region.de : region.en;
};
