import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const dirs = [
  path.join(ROOT, 'src/data/entries'),
  path.join(ROOT, 'src/data/translations/de'),
];

const bodyOf = (file) => {
  const text = fs.readFileSync(file, 'utf8');

  if (!text.startsWith('---')) {
    throw new Error(`${file}: missing YAML frontmatter`);
  }

  const end = text.indexOf('\n---', 3);
  if (end === -1) {
    throw new Error(`${file}: unterminated YAML frontmatter`);
  }

  return text.slice(end + 4);
};

const strongSpansOutsideFences = (body) => {
  let inFence = false;
  const hits = [];

  body.split('\n').forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }

    if (inFence) return;

    if (/\*\*[^*\n]+?\*\*/.test(line) || /__[^_\n]+?__/.test(line)) {
      hits.push(index + 1);
    }
  });

  return hits;
};

const problems = [];

for (const dir of dirs) {
  for (const name of fs.readdirSync(dir).filter((name) => name.endsWith('.md') && !name.startsWith('_')).sort()) {
    const file = path.join(dir, name);
    const hits = strongSpansOutsideFences(bodyOf(file));

    if (hits.length) {
      problems.push(
        `${path.relative(ROOT, file)}: inline narrative bold on body line(s) ${hits.join(', ')}`
      );
    }
  }
}

if (problems.length) {
  console.error('\nNarrative emphasis check failed:\n');
  for (const problem of problems) console.error(`- ${problem}`);
  console.error(
    '\nEntry narrative prose should not use Markdown strong emphasis. ' +
    'Use the existing structured headings/metadata for hierarchy.\n'
  );
  process.exit(1);
}

console.log('Narrative emphasis OK: no ad-hoc inline bold in EN/DE entry prose.');
