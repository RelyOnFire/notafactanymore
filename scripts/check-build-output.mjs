import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const distDir = path.join(ROOT, 'dist');
const entriesDir = path.join(ROOT, 'src/data/entries');
const deDir = path.join(ROOT, 'src/data/translations/de');
const institutionalDir = path.join(ROOT, 'src/data/institutional-beliefs');
const institutionalDeDir = path.join(ROOT, 'src/data/institutional-belief-translations/de');

const fail = (messages) => {
  console.error('\nBuild output parity check failed:\n');
  for (const message of messages) console.error(`- ${message}`);
  console.error();
  process.exit(1);
};

const errors = [];

const slugs = (dir, extension) =>
  fs.readdirSync(dir)
    .filter((name) => name.endsWith(extension) && !name.startsWith('_'))
    .map((name) => path.basename(name, extension))
    .sort();

const institutionalSourceSlugs = (dir, collectionLabel) => {
  const sourceSlugs = [];

  const visit = (current) => {
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, item.name);
      if (item.isDirectory()) {
        visit(absolute);
        continue;
      }
      if (!/\.ya?ml$/i.test(item.name)) continue;

      const relative = path.relative(dir, absolute).replaceAll(path.sep, '/');
      const projectRelative = path.relative(ROOT, absolute).replaceAll(path.sep, '/');

      if (!item.name.endsWith('.yaml')) {
        errors.push(
          `${projectRelative}: ${collectionLabel} files must use the lowercase .yaml extension`,
        );
      } else if (relative.includes('/')) {
        errors.push(
          `${projectRelative}: ${collectionLabel} files must be stored directly in ${path.relative(ROOT, dir).replaceAll(path.sep, '/')}`,
        );
      } else {
        sourceSlugs.push(path.basename(item.name, '.yaml'));
      }
    }
  };

  visit(dir);
  return sourceSlugs.sort();
};

const enSlugs = slugs(entriesDir, '.md');
const deSlugs = slugs(deDir, '.md');
const institutionalSlugs = institutionalSourceSlugs(
  institutionalDir,
  'Institutional belief',
);
const institutionalDeSlugs = institutionalSourceSlugs(
  institutionalDeDir,
  'German Institutional translation',
);

const exists = (relative) => fs.existsSync(path.join(distDir, relative));
const requireFile = (relative, label = relative) => {
  if (!exists(relative)) errors.push(`Missing generated ${label}: dist/${relative}`);
};

for (const slug of enSlugs) requireFile(`entries/${slug}/index.html`, `English entry page for ${slug}`);
for (const slug of deSlugs) requireFile(`de/entries/${slug}/index.html`, `German entry page for ${slug}`);
for (const slug of institutionalSlugs) {
  requireFile(`institutions/${slug}/index.html`, `English Institutional page for ${slug}`);
}
for (const slug of institutionalDeSlugs) {
  requireFile(`de/institutions/${slug}/index.html`, `German Institutional page for ${slug}`);
}

const generatedSlugs = (dir) => {
  const absolute = path.join(distDir, dir);
  if (!fs.existsSync(absolute)) return [];

  const generated = [];
  const visit = (current) => {
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      if (!item.isDirectory()) continue;
      const child = path.join(current, item.name);
      if (fs.existsSync(path.join(child, 'index.html'))) {
        generated.push(path.relative(absolute, child).replaceAll(path.sep, '/'));
      }
      visit(child);
    }
  };

  visit(absolute);
  return generated.sort();
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

compareSets(enSlugs, generatedSlugs('entries'), 'English entry output');
compareSets(deSlugs, generatedSlugs('de/entries'), 'German entry output');
compareSets(institutionalSlugs, generatedSlugs('institutions'), 'English Institutional output');
compareSets(institutionalDeSlugs, generatedSlugs('de/institutions'), 'German Institutional output');

const pairedRoutes = [
  ['index.html', 'de/index.html'],
  ['about/index.html', 'de/about/index.html'],
  ['browse/index.html', 'de/browse/index.html'],
  ['impressum/index.html', 'de/impressum/index.html'],
  ['institutions/index.html', 'de/institutions/index.html'],
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

const linkedInstitutionalSlugs = (relative, locale) => {
  const file = path.join(distDir, relative);
  if (!fs.existsSync(file)) return [];

  const html = fs.readFileSync(file, 'utf8');
  const prefix = locale === 'de' ? '/de/institutions/' : '/institutions/';
  const pattern = new RegExp(`href="${prefix.replaceAll('/', '\\/')}([^"#?]+?)\\/"`, 'g');
  return [...new Set([...html.matchAll(pattern)].map((match) => match[1]))].sort();
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

compareSets(
  institutionalSlugs,
  linkedInstitutionalSlugs('institutions/index.html', 'en'),
  'English Institutional listing links',
);
compareSets(
  institutionalDeSlugs,
  linkedInstitutionalSlugs('de/institutions/index.html', 'de'),
  'German Institutional listing links',
);

if (enSlugs.length !== deSlugs.length) {
  errors.push(`Source catalogue parity differs: ${enSlugs.length} English vs ${deSlugs.length} German`);
}
if (institutionalSlugs.length !== institutionalDeSlugs.length) {
  errors.push(
    `Institutional source parity differs: ${institutionalSlugs.length} English vs ${institutionalDeSlugs.length} German`
  );
}

if (errors.length) fail(errors);

console.log(
  `Build output parity OK: ${enSlugs.length} English entry pages, ${deSlugs.length} German entry pages, ${institutionalSlugs.length} English Institutional pages, and ${institutionalDeSlugs.length} German Institutional pages.`
);
