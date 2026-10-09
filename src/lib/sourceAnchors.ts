import { createHash } from 'node:crypto';

// Derive the same anchor in both languages without depending on source order or translated copy.
export const sourceAnchor = (source: { url: string; purpose: string }) =>
  `source-${createHash('sha256').update(JSON.stringify([source.url, source.purpose])).digest('hex').slice(0, 12)}`;
