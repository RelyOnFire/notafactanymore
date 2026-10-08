import type { APIRoute } from 'astro';
import sharpService from 'astro/assets/services/sharp';
import { getSocialCards, socialCardSvg, type SocialCard } from '../../lib/socialCards';

export async function getStaticPaths() {
  const cards = await getSocialCards();
  return [...cards.values()].map(card => ({
    params: { card: card.imagePath.slice('/social/'.length, -'.png'.length) },
    props: { card },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const card = props.card as SocialCard;
  // Only our escaped, locally generated SVG is rasterized; no fetched SVG is processed.
  const result = await sharpService.transform(Buffer.from(socialCardSvg(card)), { src: card.imagePath, format: 'png' }, {
    service: { entrypoint: 'astro/assets/services/sharp', config: { png: { compressionLevel: 9 } } },
    dangerouslyProcessSVG: true,
  });
  if (result.format !== 'png') throw new Error(`Could not render social image for ${card.path}`);
  return new Response(new Uint8Array(result.data), { headers: { 'Content-Type': 'image/png' } });
};
