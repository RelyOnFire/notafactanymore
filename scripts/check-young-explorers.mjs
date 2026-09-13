import fs from 'node:fs';
import path from 'node:path';
// parse5 is already installed by Astro's locked Markdown toolchain.
import { parse } from 'parse5';

const root = process.cwd();
const dist = path.join(root, 'dist');
const stories = JSON.parse(fs.readFileSync(path.join(root, 'src/data/young-explorers.json'), 'utf8'));
const errors = [];
const ids = stories.map((story) => story.id);
const normalize = (pathname) => pathname.replace(/\/$/, '') || '/';
const routes = new Set();
for (const prefix of ['', '/de']) {
  routes.add(`${prefix}/kids`);
  routes.add(`${prefix}/kids/for-grown-ups`);
  for (const id of ids) routes.add(`${prefix}/kids/stories/${id}`);
}
const attrs = (node) => Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
const has = (obj, key) => Object.hasOwn(obj, key);
const visit = (node, callback, parents = []) => {
  callback(node, parents);
  for (const child of node.childNodes ?? []) visit(child, callback, [...parents, node]);
};
const sameSet = (a, b) => a.length === b.length && new Set(a).size === a.length && a.every((value) => b.includes(value));
if (new Set(ids).size !== ids.length) errors.push('The reviewed roster has duplicate IDs.');

for (const route of routes) {
  const relative = `${route.slice(1)}/index.html`;
  const file = path.join(dist, relative);
  if (!fs.existsSync(file)) { errors.push(`Missing children's page: ${relative}`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const tree = parse(html);
  const locale = route.startsWith('/de/') ? 'de' : 'en';
  const prefix = locale === 'de' ? '/de' : '';
  const storyId = route.includes('/stories/') ? route.split('/').at(-1) : undefined;
  const cardIds = [];
  const relatedIds = [];
  const expectedAlternate = locale === 'de' ? `${route.slice(3)}/` : `/de${route}/`;
  let hasAlternate = false;
  let hasLanguageSwitch = false;
  let hasCorrectBrand = false;
  let hasCorrectAudience = false;
  let h1Count = 0;
  const allowedExits = new Set(storyId ? [`${prefix}/entries/${storyId}`] : [`${prefix}/browse`, `${prefix}/methodology`, `${prefix}/submit`, `${prefix}/impressum`]);
  // Only a story's own cited source URLs may be external links on that story.
  if (storyId) {
    const source = fs.readFileSync(path.join(root, `src/data/entries/${storyId}.md`), 'utf8');
    for (const match of source.matchAll(/^\s*url:\s*['"]?(https?:\/\/[^\s'"]+)['"]?\s*$/gm)) allowedExits.add(match[1]);
  }

  visit(tree, (node, parents) => {
    const attr = attrs(node);
    if (node.tagName === 'h1') h1Count++;
    if (node.tagName === 'html' && attr.lang !== locale) errors.push(`${route}: wrong document language.`);
    if (node.tagName === 'body') hasCorrectAudience = attr['data-audience'] === 'explorers';
    if (has(attr, 'data-story')) cardIds.push(attr['data-story']);
    if (has(attr, 'data-related-story')) relatedIds.push(attr['data-related-story']);
    if (node.tagName === 'link' && attr.hreflang === (locale === 'de' ? 'en' : 'de')) hasAlternate = new URL(attr.href).pathname === expectedAlternate;
    if (node.tagName !== 'a' || !attr.href) return;
    const url = new URL(attr.href, 'https://notafactanymore.com');
    const internal = url.origin === 'https://notafactanymore.com';
    const destination = normalize(url.pathname);
    if (attr.class?.split(' ').includes('brand')) hasCorrectBrand = destination === `${prefix}/kids`;
    if (attr.class?.split(' ').includes('language-switch')) hasLanguageSwitch = url.pathname === expectedAlternate;
    if (internal && (routes.has(destination) || attr.href.startsWith('#'))) return;
    const exitContainer = parents.some((parent) => has(attrs(parent), 'data-explorer-exit'));
    if (!exitContainer || !has(attr, 'data-leaves-explorers')) errors.push(`${route}: unmarked link leaves the reviewed collection: ${attr.href}`);
    if (!allowedExits.has(internal ? destination : attr.href)) errors.push(`${route}: unexpected exit destination: ${attr.href}`);
  });
  if (h1Count !== 1) errors.push(`${route}: expected one main heading, found ${h1Count}.`);
  if (!hasCorrectAudience || !hasCorrectBrand || !hasLanguageSwitch || !hasAlternate) errors.push(`${route}: audience navigation or language pairing is incomplete.`);
  if (route === `${prefix}/kids` && !sameSet(cardIds, ids)) errors.push(`${route}: search and random selection must use exactly the reviewed roster.`);
  if (storyId && (relatedIds.length !== Math.min(3, ids.length - 1) || new Set(relatedIds).size !== relatedIds.length || relatedIds.some((id) => !ids.includes(id) || id === storyId))) errors.push(`${route}: related stories escape or duplicate the reviewed collection.`);
}

for (const prefix of ['', 'de/']) {
  const directory = path.join(dist, prefix, 'kids/stories');
  if (!fs.existsSync(directory)) continue;
  const generated = fs.readdirSync(directory, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name);
  if (!sameSet(generated, ids)) errors.push(`${prefix}kids/stories: generated pages differ from the reviewed roster.`);
}

if (errors.length) {
  console.error('Young Explorers boundary check failed:\n' + errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log(`Young Explorers OK: ${stories.length} reviewed story pairs; ${routes.size} pages with checked navigation, language links and marked exits.`);
