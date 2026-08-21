import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeGlossaryLinks from './src/lib/rehype-glossary-links.mjs';

export default defineConfig({
  site: 'https://notafactanymore.com',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeGlossaryLinks],
    }),
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
