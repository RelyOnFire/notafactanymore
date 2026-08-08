import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://notafactanymore.com',
  output: 'static',
  integrations: [sitemap()],
});
