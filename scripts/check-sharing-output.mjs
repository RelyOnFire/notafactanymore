import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const errors = [];
const pages = new Map();
const imagePaths = new Set();
const htmlFiles = [];
const visit = directory => {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, item.name);
    if (item.isDirectory()) visit(absolute);
    else if (item.name.endsWith('.html')) htmlFiles.push(absolute);
  }
};
visit(dist);

const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'");
const resolvePagePath = absolute => {
  const relative = path.relative(dist, absolute).replaceAll(path.sep, '/');
  return relative === 'index.html' ? '/' : `/${relative.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`;
};
const normalize = pathname => decodeURIComponent(pathname).replace(/\/+$/, '') || '/';
const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
let maxImageBytes = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const pagePath = resolvePagePath(file);
  if (/name="robots"[^>]*content="[^"]*noindex/.test(html)) continue;
  const metas = new Map([...html.matchAll(/<meta\s+(?:name|property)="([^"]+)"\s+content="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => decode(m[1])));
  const links = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(m => decode(m[1]));
  pages.set(normalize(pagePath), { ids, links });
  for (const key of ['description', 'og:title', 'og:description', 'og:image', 'og:image:alt', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) {
    if (!metas.get(key)?.trim()) errors.push(`${pagePath}: missing ${key}`);
  }
  if (metas.get('twitter:card') !== 'summary_large_image') errors.push(`${pagePath}: wrong Twitter card type`);
  if (metas.get('og:image') !== metas.get('twitter:image')) errors.push(`${pagePath}: Open Graph and Twitter images differ`);
  const image = new URL(metas.get('og:image') || '/', 'https://notafactanymore.com');
  const locale = /^\/de(?:\/|$)/.test(pagePath) ? 'de' : 'en';
  if (image.origin !== 'https://notafactanymore.com' || !image.pathname.startsWith(`/social/${locale}/`)) {
    errors.push(`${pagePath}: missing generated ${locale} preview`);
    continue;
  }
  if (imagePaths.has(image.pathname)) errors.push(`${pagePath}: preview is shared with another page`);
  imagePaths.add(image.pathname);
  const imageFile = path.join(dist, decodeURIComponent(image.pathname));
  if (!fs.existsSync(imageFile)) { errors.push(`${pagePath}: image file is missing`); continue; }
  const bytes = fs.readFileSync(imageFile);
  maxImageBytes = Math.max(maxImageBytes, bytes.length);
  if (!bytes.subarray(0, 8).equals(pngHeader)) errors.push(`${pagePath}: image is not PNG`);
  else if (bytes.readUInt32BE(16) !== 1200 || bytes.readUInt32BE(20) !== 630) errors.push(`${pagePath}: PNG dimensions must be 1200 × 630`);
  if (metas.get('og:image:width') !== '1200' || metas.get('og:image:height') !== '630') errors.push(`${pagePath}: metadata dimensions differ from image`);
  if (bytes.length > 1_000_000) errors.push(`${pagePath}: preview exceeds 1 MB`);
  if (/^\/(?:de\/)?institutions\/[^/]+$/.test(pagePath)) {
    const frame = locale === 'de' ? 'Historische institutionelle Überzeugung:' : 'Historical institutional belief:';
    if (!metas.get('description')?.startsWith(frame)) errors.push(`${pagePath}: historical belief is not framed in its description`);
  }
}

// Check all published internal destinations, including links into folded evidence sections.
for (const [pagePath, { links }] of pages) {
  for (const href of links) {
    if (!href || /^(?:mailto|tel|javascript):/.test(href)) continue;
    const target = new URL(href, `https://notafactanymore.com${pagePath.endsWith('/') ? pagePath : pagePath + '/'}`);
    if (target.origin !== 'https://notafactanymore.com') continue;
    const targetPath = normalize(target.pathname);
    const page = pages.get(targetPath);
    if (!page) {
      const asset = path.join(dist, decodeURIComponent(target.pathname));
      if (!fs.existsSync(asset)) errors.push(`${pagePath}: missing internal target ${href}`);
    } else if (target.hash && !page.ids.has(decodeURIComponent(target.hash.slice(1)))) {
      errors.push(`${pagePath}: missing fragment ${href}`);
    }
  }
}
for (const filename of fs.readdirSync(dist).filter(name => /^sitemap.*\.xml$/.test(name))) {
  if (fs.readFileSync(path.join(dist, filename), 'utf8').includes('/social/')) errors.push(`${filename}: generated images must not be indexed as pages`);
}
if (errors.length) {
  console.error(`Sharing and link checks failed:\n${[...new Set(errors)].map(error => `- ${error}`).join('\n')}`);
  process.exit(1);
}
console.log(`Sharing and links OK: ${pages.size} published pages, ${imagePaths.size} distinct bilingual previews, 1200 × 630 PNGs; largest ${Math.ceil(maxImageBytes / 1024)} KB.`);
