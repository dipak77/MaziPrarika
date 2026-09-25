import { ogFallbackCard, renderOgImage } from '@/lib/og';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  return renderOgImage(ogFallbackCard());
}
