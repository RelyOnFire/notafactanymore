import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const distDir = path.join(ROOT, 'dist');
const entriesDir = path.join(ROOT, 'src/data/entries');
const deDir = path.join(ROOT, 'src/data/translations/de');

const fail = (messages) => {
  console.error('\nBuild output parity check failed:\n');
  for (const message of messages) console.error(`- ${message}`);
  console.error();
  process.exit(1);
};

const slugs = (dir) =>
  fs.readdirSync(dir)
    .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
    .map((name) => path.basename(name, '.md'))
    .sort();

const enSlugs = slugs(entriesDir);
const deSlugs = slugs(deDir);
const errors = [];

const exists = (relative) => fs.existsSync(path.join(distDir, relative));
const requireFile = (relative, label = relative) => {
  if (!exists(relative)) errors.push(`Missing generated ${label}: dist/${relative}`);
};

for (const slug of enSlugs) requireFile(`entries/${slug}/index.html`, `English entry page for ${slug}`);
for (const slug of deSlugs) requireFile(`de/entries/${slug}/index.html`, `German entry page for ${slug}`);

const generatedEntrySlugs = (dir) => {
  const absolute = path.join(distDir, dir);
  if (!fs.existsSync(absolute)) return [];

  return fs.readdirSync(absolute, { withFileTypes: true })
    .filter((item) => item.isDirectory() && fs.existsSync(path.join(absolute, item.name, 'index.html')))
    .map((item) => item.name)
    .sort();
};

const compareSets = (expected, actual, label) => {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);

  for (const slug of expectedSet) {
    if (!actualSet.has(slug)) errors.push(`${label}: expected page missing for ${slug}`);
  }
  for (const slug of actualSet) {
    if (!expectedSet.has(slug)) errors.push(`${label}: unexpected generated page for ${slug}`);
  }
};

compareSets(enSlugs, generatedEntrySlugs('entries'), 'English entry output');
compareSets(deSlugs, generatedEntrySlugs('de/entries'), 'German entry output');

const pairedRoutes = [
  ['index.html', 'de/index.html'],
  ['about/index.html', 'de/about/index.html'],
  ['browse/index.html', 'de/browse/index.html'],
  ['impressum/index.html', 'de/impressum/index.html'],
  ['lifespans/index.html', 'de/lifespans/index.html'],
  ['methodology/index.html', 'de/methodology/index.html'],
  ['submit/index.html', 'de/submit/index.html'],
  ['timeline/index.html', 'de/timeline/index.html'],
];

for (const [en, de] of pairedRoutes) {
  requireFile(en);
  requireFile(de);
}

const checkBrowseCount = (relative, regex, expected, label) => {
  const file = path.join(distDir, relative);
  if (!fs.existsSync(file)) return;

  const html = fs.readFileSync(file, 'utf8');
  const match = html.match(regex);

  if (!match) {
    errors.push(`${label}: could not find rendered catalogue count`);
    return;
  }

  const count = Number(match[1]);
  if (count !== expected) {
    errors.push(`${label}: rendered ${count} entries, expected ${expected}`);
  }
};

checkBrowseCount(
  'browse/index.html',
  /Showing all\s*(\d+)\s*entries/i,
  enSlugs.length,
  'English browse page'
);

checkBrowseCount(
  'de/browse/index.html',
  /Alle\s*(\d+)\s*Einträge werden angezeigt/i,
  deSlugs.length,
  'German browse page'
);

if (enSlugs.length !== deSlugs.length) {
  errors.push(`Source catalogue parity differs: ${enSlugs.length} English vs ${deSlugs.length} German`);
}

if (errors.length) fail(errors);

console.log(
  `Build output parity OK: ${enSlugs.length} English entry pages and ${deSlugs.length} German entry pages.`
);
