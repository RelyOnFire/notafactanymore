import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const entriesDir = path.join(ROOT, 'src/data/entries');
const deDir = path.join(ROOT, 'src/data/translations/de');

const errors = [];

const markdownFiles = (dir) =>
  fs.readdirSync(dir)
    .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
    .sort();

const frontmatter = (file) => {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.startsWith('---')) throw new Error(`Missing YAML frontmatter: ${file}`);
  const end = text.indexOf('\n---', 3);
  if (end === -1) throw new Error(`Unterminated YAML frontmatter: ${file}`);
  return text.slice(3, end).trim();
};

const stripQuotes = (value) => {
  value = value.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
};

const mediaBlock = (fm) =>
  fm.match(/^media:\s*\n((?:[ \t]+.*(?:\n|$))*)/m)?.[1] ?? '';

const mediaIds = (fm) =>
  [...mediaBlock(fm).matchAll(/^\s+- id:\s*(.+?)\s*$/gm)]
    .map((match) => stripQuotes(match[1]));

const mediaSrcs = (fm) =>
  [...mediaBlock(fm).matchAll(/^\s+src:\s*(.+?)\s*$/gm)]
    .map((match) => stripQuotes(match[1]));

const validateLocalAsset = (slug, locale, src) => {
  if (!src.startsWith('/')) return;

  if (!src.startsWith('/media/')) {
    errors.push(
      `${locale}/${slug}: local media src ${JSON.stringify(src)} must live under /media/`
    );
    return;
  }

  const publicPath = path.join(ROOT, 'public', src.slice(1));
  if (!fs.existsSync(publicPath)) {
    errors.push(
      `${locale}/${slug}: local media asset does not exist: ${src} (expected ${publicPath})`
    );
  }
};

const validateUnique = (slug, locale, ids) => {
  const seen = new Set();
  for (const id of ids) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
      errors.push(`${locale}/${slug}: invalid media id ${JSON.stringify(id)}`);
    }
    if (seen.has(id)) {
      errors.push(`${locale}/${slug}: duplicate media id ${JSON.stringify(id)}`);
    }
    seen.add(id);
  }
};

const enBySlug = new Map();
for (const name of markdownFiles(entriesDir)) {
  const slug = path.basename(name, '.md');
  const fm = frontmatter(path.join(entriesDir, name));
  const ids = mediaIds(fm);
  validateUnique(slug, 'en', ids);

  const srcs = mediaSrcs(fm);
  for (const src of srcs) validateLocalAsset(slug, 'en', src);

  enBySlug.set(slug, ids);
}

const deBySlug = new Map();
for (const name of markdownFiles(deDir)) {
  const slug = path.basename(name, '.md');
  const fm = frontmatter(path.join(deDir, name));
  const ids = mediaIds(fm);
  validateUnique(slug, 'de', ids);

  const srcs = mediaSrcs(fm);
  for (const src of srcs) validateLocalAsset(slug, 'de', src);

  deBySlug.set(slug, ids);
}

for (const [slug, enIds] of enBySlug) {
  const deIds = deBySlug.get(slug) ?? [];
  const a = [...enIds].sort();
  const b = [...deIds].sort();

  if (a.join('\n') !== b.join('\n')) {
    errors.push(
      `${slug}: EN/DE media ids differ; EN=[${a.join(', ')}], DE=[${b.join(', ')}]`
    );
  }
}

if (errors.length) {
  console.error('\nMedia integrity check failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  console.error();
  process.exit(1);
}

const cardsWithMedia = [...enBySlug.values()].filter((ids) => ids.length > 0).length;
const mediaCount = [...enBySlug.values()].reduce((sum, ids) => sum + ids.length, 0);

console.log(
  `Media integrity OK: ${mediaCount} media items across ${cardsWithMedia} cards, EN/DE aligned.`
);
