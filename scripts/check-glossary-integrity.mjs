import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const entriesDir = path.join(ROOT, 'src/data/entries');
const deEntriesDir = path.join(ROOT, 'src/data/translations/de');
const glossaryDir = path.join(ROOT, 'src/data/glossary');
const deGlossaryDir = path.join(ROOT, 'src/data/glossary-translations/de');
const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const REF_PATTERN = /\[([^\]\n]+)\]\(glossary:([a-z0-9][a-z0-9-]*)\)/g;

const errors = [];

const fail = () => {
  console.error('\nGlossary integrity check failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  console.error();
  process.exit(1);
};

const files = (dir, extension) =>
  fs.readdirSync(dir)
    .filter((name) => name.endsWith(extension) && !name.startsWith('_'))
    .sort();

const stripQuotes = (value) => {
  value = value.trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
};

const scalar = (text, key) => {
  const match = text.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'));
  return match ? stripQuotes(match[1]) : undefined;
};

const splitMarkdown = (file) => {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.startsWith('---')) throw new Error(`Missing YAML frontmatter: ${file}`);
  const end = text.indexOf('\n---', 3);
  if (end === -1) throw new Error(`Unterminated YAML frontmatter: ${file}`);
  return {
    text,
    frontmatter: text.slice(3, end).trim(),
    body: text.slice(end + 4),
  };
};

const refs = (text) => {
  const found = [];
  REF_PATTERN.lastIndex = 0;
  let match;
  while ((match = REF_PATTERN.exec(text)) !== null) {
    found.push({ label: match[1], id: match[2] });
  }
  return found;
};

const enGlossaryFiles = files(glossaryDir, '.yaml');
const deGlossaryFiles = files(deGlossaryDir, '.yaml');
const enGlossaryIds = new Set(enGlossaryFiles.map((name) => path.basename(name, '.yaml')));
const deGlossaryIds = new Set(deGlossaryFiles.map((name) => path.basename(name, '.yaml')));

for (const id of enGlossaryIds) {
  if (!ID_PATTERN.test(id)) errors.push(`Invalid glossary filename/id: ${id}`);
  if (!deGlossaryIds.has(id)) errors.push(`Missing German glossary translation: ${id}`);
}
for (const id of deGlossaryIds) {
  if (!enGlossaryIds.has(id)) errors.push(`Orphan German glossary translation: ${id}`);
}

const reviewedById = new Map();
for (const name of enGlossaryFiles) {
  const id = path.basename(name, '.yaml');
  const text = fs.readFileSync(path.join(glossaryDir, name), 'utf8');
  const term = scalar(text, 'term');
  const shortDefinition = scalar(text, 'shortDefinition');
  const reviewedAt = scalar(text, 'reviewedAt');
  if (!term) errors.push(`${name}: missing term`);
  if (!shortDefinition) errors.push(`${name}: missing shortDefinition`);
  if (!reviewedAt) errors.push(`${name}: missing reviewedAt`);
  reviewedById.set(id, reviewedAt);

  const relatedBlock = text.match(/^relatedTerms:\s*\n((?:\s+-\s+.*\n?)*)/m)?.[1] ?? '';
  const relatedTerms = [...relatedBlock.matchAll(/^\s+-\s+(.+?)\s*$/gm)]
    .map((match) => stripQuotes(match[1]));

  const relatedCounts = new Map();
  for (const relatedId of relatedTerms) {
    relatedCounts.set(relatedId, (relatedCounts.get(relatedId) ?? 0) + 1);
    if (relatedId === id) errors.push(`${id}: relatedTerms must not contain a self-link`);
    if (!enGlossaryIds.has(relatedId)) {
      errors.push(`${id}: relatedTerms contains unknown glossary id ${JSON.stringify(relatedId)}`);
    }
  }
  for (const [relatedId, count] of relatedCounts) {
    if (count > 1) {
      errors.push(`${id}: relatedTerms contains ${JSON.stringify(relatedId)} ${count} times`);
    }
  }

  const aliasesBlock = text.match(/^aliases:\s*\n((?:\s+-\s+.*\n?)*)/m)?.[1] ?? '';
  const aliases = [...aliasesBlock.matchAll(/^\s+-\s+(.+?)\s*$/gm)]
    .map((match) => stripQuotes(match[1]));
  const aliasKeys = aliases.map((alias) => alias.toLocaleLowerCase('en'));
  if (new Set(aliasKeys).size !== aliasKeys.length) {
    errors.push(`${id}: aliases contains a duplicate value`);
  }
}

for (const name of deGlossaryFiles) {
  const id = path.basename(name, '.yaml');
  const text = fs.readFileSync(path.join(deGlossaryDir, name), 'utf8');
  const entryId = scalar(text, 'entryId');
  const locale = scalar(text, 'locale');
  const sourceReviewedAt = scalar(text, 'sourceReviewedAt');
  const term = scalar(text, 'term');
  const shortDefinition = scalar(text, 'shortDefinition');

  if (entryId !== id) errors.push(`${name}: entryId is ${JSON.stringify(entryId)}, expected ${JSON.stringify(id)}`);
  if (locale !== 'de') errors.push(`${name}: locale is ${JSON.stringify(locale)}, expected "de"`);
  if (!term) errors.push(`${name}: missing term`);
  if (!shortDefinition) errors.push(`${name}: missing shortDefinition`);
  if (sourceReviewedAt !== reviewedById.get(id)) {
    errors.push(`${id}: English reviewedAt ${JSON.stringify(reviewedById.get(id))} does not match German sourceReviewedAt ${JSON.stringify(sourceReviewedAt)}`);
  }
}

const scanEntries = (dir, locale) => {
  const result = new Map();
  for (const name of files(dir, '.md')) {
    const slug = path.basename(name, '.md');
    const { text, frontmatter, body } = splitMarkdown(path.join(dir, name));
    const frontmatterLines = frontmatter.split('\n');

    for (const line of frontmatterLines) {
      if (!line.includes('glossary:')) continue;
      const trimmed = line.trimStart();
      if (!trimmed.startsWith('currentUnderstanding:') && !trimmed.startsWith('whyItChanged:')) {
        errors.push(`${locale}/${slug}: glossary markup is only allowed in currentUnderstanding, whyItChanged, or body prose`);
      }
    }

    const found = refs(text);
    const frontmatterRefs = refs(frontmatter);
    const bodyRefs = refs(body);
    const glossaryTokenCount = (text.match(/glossary:/g) ?? []).length;
    if (glossaryTokenCount !== found.length) {
      errors.push(`${locale}/${slug}: malformed glossary markup; use [visible text](glossary:concept-id)`);
    }

    const validIds = locale === 'de' ? deGlossaryIds : enGlossaryIds;
    for (const ref of found) {
      if (!validIds.has(ref.id)) errors.push(`${locale}/${slug}: unknown glossary id ${JSON.stringify(ref.id)}`);
    }

    // A concept may be useful once in the card's frontmatter display and again in
    // the article body. These are separate reader-facing surfaces and both
    // render as ordinary links to the same glossary anchor. Still catch
    // accidental repeated marking within either surface.
    for (const [surface, surfaceRefs] of [
      ['frontmatter', frontmatterRefs],
      ['body', bodyRefs],
    ]) {
      const counts = new Map();
      for (const ref of surfaceRefs) {
        counts.set(ref.id, (counts.get(ref.id) ?? 0) + 1);
      }
      for (const [id, count] of counts) {
        if (count > 1) {
          errors.push(`${locale}/${slug}: glossary id ${JSON.stringify(id)} is marked ${count} times in ${surface}; mark only the first useful occurrence on that surface`);
        }
      }
    }

    result.set(slug, new Set(found.map((ref) => ref.id)));
  }
  return result;
};

const enRefs = scanEntries(entriesDir, 'en');
const deRefs = scanEntries(deEntriesDir, 'de');

for (const [slug, enIds] of enRefs) {
  const deIds = deRefs.get(slug) ?? new Set();
  const a = [...enIds].sort();
  const b = [...deIds].sort();
  if (a.join('\n') !== b.join('\n')) {
    errors.push(`${slug}: EN/DE glossary concept sets differ; EN=[${a.join(', ')}], DE=[${b.join(', ')}]`);
  }
}

for (const slug of deRefs.keys()) {
  if (!enRefs.has(slug)) errors.push(`de/${slug}: no matching English entry`);
}

if (errors.length) fail();

const cardsWithGlossary = [...enRefs.values()].filter((set) => set.size > 0).length;
const referenceCount = [...enRefs.values()].reduce((sum, set) => sum + set.size, 0);
console.log(`Glossary integrity OK: ${enGlossaryIds.size} concepts, ${cardsWithGlossary} cards, ${referenceCount} English concept references, EN/DE aligned.`);
