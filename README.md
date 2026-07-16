# Not a Fact Anymore

A static, evidence-linked catalogue of claims that were once reasonably accepted as factual but were later overturned, superseded, narrowed, reclassified, or corrected.

## Before deploying

1. Open `src/site-config.ts`.
2. Replace `YOUR_GITHUB_USERNAME` with your GitHub username.
3. Keep `githubRepo: 'notafactanymore'` unless you use a different repository name.

## Run locally

You need a current Node.js LTS release and npm.

```bash
npm install
npm run dev
```

Astro will print a local address, normally `http://localhost:4321`.

## Build a production copy

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Add an entry

1. Copy `src/data/entries/_template.md`.
2. Rename the copy using a short lowercase slug, such as `continental-drift.md`.
3. Complete every frontmatter field.
4. Add context and qualifications below the closing `---`.
5. Run `npm run build` before committing.

Files beginning with `_` are ignored by the content collection, so `_template.md` will not appear on the site.

## Publish through Cloudflare Pages

Connect this GitHub repository to Cloudflare Pages with:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`

Every push to `main` will rebuild the public site.

## Domain

After the Pages deployment works at its temporary `pages.dev` address, add `notafactanymore.com` under the Pages project's Custom domains section and follow Cloudflare's DNS instructions.

## Submission workflow

The submission page converts the form into a pre-filled GitHub issue labelled `submission`. Nothing is published automatically. Review accepted proposals, create a Markdown entry, verify its sources, and merge it into `main`.
