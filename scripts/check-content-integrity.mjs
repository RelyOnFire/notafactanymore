import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const entriesDir = path.join(ROOT, 'src/data/entries');
const deDir = path.join(ROOT, 'src/data/translations/de');
const FEATURED_LIMIT = 6;

const fail = (messages) => {
  console.error('\nContent integrity check failed:\n');
  for (const message of messages) console.error(`- ${message}`);
  console.error();
  process.exit(1);
};

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

const scalar = (fm, key) => {
  const match = fm.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'));
  if (!match) return undefined;

  let value = match[1].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value;
};

const boolValue = (fm, key) => {
  const value = scalar(fm, key);
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const intValue = (fm, key) => {
  const value = scalar(fm, key);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
};

const errors = [];

const enFiles = markdownFiles(entriesDir);
const deFiles = markdownFiles(deDir);

const enSlugs = new Set(enFiles.map((name) => path.basename(name, '.md')));
const deSlugs = new Set(deFiles.map((name) => path.basename(name, '.md')));

for (const slug of enSlugs) {
  if (!deSlugs.has(slug)) errors.push(`Missing German translation: ${slug}`);
}
for (const slug of deSlugs) {
  if (!enSlugs.has(slug)) errors.push(`Orphan German translation: ${slug}`);
}

const seenEntryIds = new Map();
const germanBySlug = new Map();

for (const name of deFiles) {
  const slug = path.basename(name, '.md');
  const fm = frontmatter(path.join(deDir, name));
  const entryId = scalar(fm, 'entryId');
  const locale = scalar(fm, 'locale');
  const sourceReviewedAt = scalar(fm, 'sourceReviewedAt');

  if (entryId !== slug) {
    errors.push(`${name}: entryId is ${JSON.stringify(entryId)}, expected ${JSON.stringify(slug)}`);
  }

  if (locale !== 'de') {
    errors.push(`${name}: locale is ${JSON.stringify(locale)}, expected "de"`);
  }

  if (!sourceReviewedAt) {
    errors.push(`${name}: missing sourceReviewedAt`);
  }

  if (entryId) {
    const previous = seenEntryIds.get(entryId);
    if (previous) {
      errors.push(`Duplicate German entryId ${JSON.stringify(entryId)} in ${previous} and ${name}`);
    } else {
      seenEntryIds.set(entryId, name);
    }
  }

  germanBySlug.set(slug, { name, fm, sourceReviewedAt });
}

const featured = [];

for (const name of enFiles) {
  const slug = path.basename(name, '.md');
  const fm = frontmatter(path.join(entriesDir, name));
  const reviewedAt = scalar(fm, 'reviewedAt');
  const isFeatured = boolValue(fm, 'featured') === true;
  const featuredOrder = intValue(fm, 'featuredOrder');

  const de = germanBySlug.get(slug);
  if (de && reviewedAt !== de.sourceReviewedAt) {
    errors.push(
      `${slug}: English reviewedAt ${JSON.stringify(reviewedAt)} does not match German sourceReviewedAt ${JSON.stringify(de.sourceReviewedAt)}`
    );
  }

  if (isFeatured) {
    if (featuredOrder === undefined) {
      errors.push(`${slug}: featured card is missing a valid integer featuredOrder`);
    } else {
      featured.push({ slug, order: featuredOrder });
    }
  } else if (featuredOrder !== undefined) {
    errors.push(`${slug}: has featuredOrder ${featuredOrder} but featured is not true`);
  }
}

if (featured.length !== FEATURED_LIMIT) {
  errors.push(`Expected exactly ${FEATURED_LIMIT} featured cards; found ${featured.length}`);
}

const orders = featured.map(({ order }) => order).sort((a, b) => a - b);
const expectedOrders = Array.from({ length: FEATURED_LIMIT }, (_, i) => i + 1);

if (
  orders.length !== expectedOrders.length ||
  orders.some((order, index) => order !== expectedOrders[index])
) {
  errors.push(
    `Featured orders must be unique and exactly 1-${FEATURED_LIMIT}; found [${orders.join(', ')}]`
  );
}

if (errors.length) fail(errors);

console.log(
  `Content integrity OK: ${enFiles.length} English entries, ${deFiles.length} German translations, ${FEATURED_LIMIT} featured cards.`
);
