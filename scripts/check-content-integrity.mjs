import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const entriesDir = path.join(ROOT, 'src/data/entries');
const deDir = path.join(ROOT, 'src/data/translations/de');
const institutionalDir = path.join(ROOT, 'src/data/institutional-beliefs');
const institutionalDeDir = path.join(ROOT, 'src/data/institutional-belief-translations/de');
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

const yamlFiles = (dir, collectionLabel, errors) => {
  const files = [];

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
        files.push(absolute);
      }
    }
  };

  visit(dir);
  return files.sort();
};

const frontmatter = (file) => {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.startsWith('---')) throw new Error(`Missing YAML frontmatter: ${file}`);

  const end = text.indexOf('\n---', 3);
  if (end === -1) throw new Error(`Unterminated YAML frontmatter: ${file}`);

  return text.slice(3, end).trim();
};

const unquote = (input) => {
  let value = input.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value;
};

const scalar = (source, key) => {
  const match = source.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'));
  return match ? unquote(match[1]) : undefined;
};

const boolValue = (source, key) => {
  const value = scalar(source, key);
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const intValue = (source, key) => {
  const value = scalar(source, key);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
};

const contentId = (dir, file) =>
  path.relative(dir, file).replaceAll(path.sep, '/').replace(/\.yaml$/, '');

const schemaVersion = (source, label, errors) => {
  const raw = scalar(source, 'schemaVersion');
  if (raw === undefined) return 1;
  const version = Number(raw);
  if (version !== 1 && version !== 2) {
    errors.push(`${label}: schemaVersion is ${JSON.stringify(raw)}, expected 1 or 2`);
    return undefined;
  }
  return version;
};

const topLevelKey = (source, key) =>
  new RegExp(`^${key}:`, 'm').test(source);

const sectionItems = (source, section) => {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`^${section}:\\s*(?:#.*)?$`).test(line));
  if (start === -1) return [];

  let itemIndent;
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const match = line.match(/^( *)(?:-)(?:\s|$)/);
    if (!match) return [];
    itemIndent = match[1].length;
    break;
  }
  if (itemIndent === undefined) return [];

  const items = [];
  let current;

  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed || /^\s*#/.test(line)) {
      if (current) current.push(line);
      continue;
    }

    const indent = line.match(/^ */)[0].length;
    const itemMatch = line.match(/^( *)-(?:\s|$)/);
    if (indent < itemIndent || (indent === itemIndent && !itemMatch)) break;

    if (itemMatch && itemMatch[1].length === itemIndent) {
      if (current) items.push({ lines: current, indent: itemIndent });
      current = [line];
    } else if (current) {
      current.push(line);
    }
  }

  if (current) items.push({ lines: current, indent: itemIndent });
  return items;
};

const itemScalar = (item, key) => {
  const directIndent = item.indent + 2;
  const match = item.lines.join('\n').match(
    new RegExp(
      `^ {${item.indent}}-\\s+${key}:\\s*(.+?)\\s*$|^ {${directIndent}}${key}:\\s*(.+?)\\s*$`,
      'm',
    ),
  );
  const value = match?.[1] ?? match?.[2];
  return value === undefined ? undefined : unquote(value);
};

const itemHasKey = (item, key) =>
  new RegExp(`^ {${item.indent + 2}}${key}:`, 'm').test(item.lines.join('\n'));

const sectionMetadata = (source, section) =>
  sectionItems(source, section).map((item) => ({
    id: itemScalar(item, 'id'),
    hasNote: itemHasKey(item, 'note'),
  }));

const duplicateValues = (values) => {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }
  return [...duplicates];
};

const arraysEqual = (left, right) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const sameInstant = (left, right) => {
  if (!left || !right) return false;
  const leftTimestamp = Date.parse(left);
  const rightTimestamp = Date.parse(right);
  return (
    Number.isFinite(leftTimestamp) &&
    Number.isFinite(rightTimestamp) &&
    leftTimestamp === rightTimestamp
  );
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
  if (!sourceReviewedAt) errors.push(`${name}: missing sourceReviewedAt`);

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
  if (de && !sameInstant(reviewedAt, de.sourceReviewedAt)) {
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

const institutionalFiles = yamlFiles(institutionalDir, 'Institutional belief', errors);
const institutionalDeFiles = yamlFiles(
  institutionalDeDir,
  'German Institutional translation',
  errors,
);
const institutionalById = new Map();

for (const file of institutionalFiles) {
  const id = contentId(institutionalDir, file);
  const source = fs.readFileSync(file, 'utf8');
  const label = path.relative(ROOT, file);
  const version = schemaVersion(source, label, errors);
  const episodeItems = sectionMetadata(source, 'episodes');
  const evidenceItems = sectionMetadata(source, 'evidence');
  const episodeIds = episodeItems.map((item) => item.id).filter(Boolean);
  const evidenceIds = evidenceItems.map((item) => item.id).filter(Boolean);

  if (episodeItems.length === 0) {
    errors.push(
      `${label}: episodes must use a supported block-list format (indentless or indented sequence items)`,
    );
  }
  if (version === 2 && evidenceItems.length === 0) {
    errors.push(
      `${label}: v2 evidence must use a supported block-list format (indentless or indented sequence items)`,
    );
  }

  if (institutionalById.has(id)) {
    errors.push(`Duplicate Institutional belief id ${JSON.stringify(id)}`);
  }
  for (const duplicate of duplicateValues(episodeIds)) {
    errors.push(`${label}: duplicate episode id ${JSON.stringify(duplicate)}`);
  }
  for (const duplicate of duplicateValues(evidenceIds)) {
    errors.push(`${label}: duplicate evidence id ${JSON.stringify(duplicate)}`);
  }
  if (episodeItems.some((item) => !item.id)) {
    errors.push(`${label}: an episode is missing id`);
  }
  if (version === 2 && evidenceItems.some((item) => !item.id)) {
    errors.push(`${label}: an evidence link is missing id`);
  }

  const catalogueEntryId = scalar(source, 'entryId');
  if (catalogueEntryId && !enSlugs.has(catalogueEntryId)) {
    errors.push(`${label}: catalogue entryId ${JSON.stringify(catalogueEntryId)} does not resolve`);
  }

  institutionalById.set(id, {
    id,
    label,
    source,
    version,
    reviewedAt: scalar(source, 'reviewedAt'),
    episodeIds,
    evidenceIds,
    evidenceItems,
    hasImpact: topLevelKey(source, 'impact'),
  });
}

const institutionalTranslationById = new Map();
const seenInstitutionalEntryIds = new Map();

for (const file of institutionalDeFiles) {
  const fileId = contentId(institutionalDeDir, file);
  const source = fs.readFileSync(file, 'utf8');
  const label = path.relative(ROOT, file);
  const entryId = scalar(source, 'entryId');
  const locale = scalar(source, 'locale');
  const version = schemaVersion(source, label, errors);
  const episodeItems = sectionMetadata(source, 'episodes');
  const evidenceItems = sectionMetadata(source, 'evidence');
  const episodeIds = episodeItems.map((item) => item.id).filter(Boolean);
  const evidenceIds = evidenceItems.map((item) => item.id).filter(Boolean);

  if (episodeItems.length === 0) {
    errors.push(
      `${label}: episodes must use a supported block-list format (indentless or indented sequence items)`,
    );
  }
  if (version === 2 && evidenceItems.length === 0) {
    errors.push(
      `${label}: v2 evidence must use a supported block-list format (indentless or indented sequence items)`,
    );
  }

  if (entryId !== fileId) {
    errors.push(`${label}: entryId is ${JSON.stringify(entryId)}, expected ${JSON.stringify(fileId)}`);
  }
  if (locale !== 'de') {
    errors.push(`${label}: locale is ${JSON.stringify(locale)}, expected "de"`);
  }
  if (!scalar(source, 'sourceReviewedAt')) {
    errors.push(`${label}: missing sourceReviewedAt`);
  }
  if (entryId) {
    const previous = seenInstitutionalEntryIds.get(entryId);
    if (previous) {
      errors.push(`Duplicate German Institutional entryId ${JSON.stringify(entryId)} in ${previous} and ${label}`);
    } else {
      seenInstitutionalEntryIds.set(entryId, label);
    }
  }
  for (const duplicate of duplicateValues(episodeIds)) {
    errors.push(`${label}: duplicate episode id ${JSON.stringify(duplicate)}`);
  }
  for (const duplicate of duplicateValues(evidenceIds)) {
    errors.push(`${label}: duplicate evidence id ${JSON.stringify(duplicate)}`);
  }
  if (episodeItems.some((item) => !item.id)) {
    errors.push(`${label}: an episode is missing id`);
  }
  if (version === 2 && evidenceItems.some((item) => !item.id)) {
    errors.push(`${label}: an evidence translation is missing id`);
  }

  if (entryId) {
    institutionalTranslationById.set(entryId, {
      label,
      source,
      version,
      sourceReviewedAt: scalar(source, 'sourceReviewedAt'),
      episodeIds,
      evidenceIds,
      evidenceItems,
      hasImpact: topLevelKey(source, 'impact'),
    });
  }
}

for (const [id, belief] of institutionalById) {
  const translation = institutionalTranslationById.get(id);
  if (!translation) {
    errors.push(`Missing German Institutional translation: ${id}`);
    continue;
  }

  if (!sameInstant(belief.reviewedAt, translation.sourceReviewedAt)) {
    errors.push(
      `${id}: Institutional reviewedAt ${JSON.stringify(belief.reviewedAt)} does not match German sourceReviewedAt ${JSON.stringify(translation.sourceReviewedAt)}`
    );
  }
  if (belief.version !== translation.version) {
    errors.push(`${id}: Institutional schemaVersion ${belief.version} does not match German schemaVersion ${translation.version}`);
  }
  if (!arraysEqual(belief.episodeIds, translation.episodeIds)) {
    errors.push(
      `${id}: German episode ids/order [${translation.episodeIds.join(', ')}] do not match canonical [${belief.episodeIds.join(', ')}]`
    );
  }

  if (belief.version === 2 && translation.version === 2) {
    if (!arraysEqual(belief.evidenceIds, translation.evidenceIds)) {
      errors.push(
        `${id}: German evidence ids/order [${translation.evidenceIds.join(', ')}] do not match canonical [${belief.evidenceIds.join(', ')}]`
      );
    }
    if (belief.hasImpact && !translation.hasImpact) {
      errors.push(`${id}: v2 German translation is missing canonical impact`);
    }

    const translatedEvidenceById = new Map(
      translation.evidenceItems.map((item) => [item.id, item]),
    );
    for (const item of belief.evidenceItems) {
      if (item.hasNote && !translatedEvidenceById.get(item.id)?.hasNote) {
        errors.push(`${id}: German evidence ${JSON.stringify(item.id)} is missing its translated note`);
      }
    }
  }
}

for (const id of institutionalTranslationById.keys()) {
  if (!institutionalById.has(id)) {
    errors.push(`Orphan German Institutional translation: ${id}`);
  }
}

if (errors.length) fail(errors);

console.log(
  `Content integrity OK: ${enFiles.length} English entries, ${deFiles.length} German translations, ${FEATURED_LIMIT} featured cards; ${institutionalFiles.length} Institutional beliefs and ${institutionalDeFiles.length} German Institutional translations.`
);
