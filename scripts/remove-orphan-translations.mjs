import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const entriesDir = path.join(ROOT, 'src/data/entries');
const deDir = path.join(ROOT, 'src/data/translations/de');

const slugs = (dir) =>
  new Set(
    fs.readdirSync(dir)
      .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
      .map((name) => path.basename(name, '.md'))
  );

const english = slugs(entriesDir);
const removed = [];

for (const name of fs.readdirSync(deDir).filter((name) => name.endsWith('.md') && !name.startsWith('_'))) {
  const slug = path.basename(name, '.md');
  if (!english.has(slug)) {
    fs.unlinkSync(path.join(deDir, name));
    removed.push(name);
  }
}

removed.sort();

if (removed.length) {
  console.log(`Removed ${removed.length} orphan German translation(s):`);
  for (const name of removed) console.log(`- ${name}`);
} else {
  console.log('No orphan German translations found.');
}
