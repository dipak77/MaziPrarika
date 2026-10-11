import type { Metadata } from 'next';

import { CakeEditor } from '@/components/cake/cake-editor';
import { cakeCatalog } from '@/lib/cake/catalog';

/**
 * /cake/editor — the design editor.
 *
 * `?template=<id>` opens that design directly (the links from the gallery and the
 * collection lists use it). Everything else — words, palette, typography, pieces,
 * size — lives in the panels, and every change is undoable.
 */

export const metadata: Metadata = {
  title: 'Editor · Cake Atelier Pro',
  description: 'Personalise a paper-art cake topper: name, title, palette, typography, paper layers and physical size.',
};

export default async function CakeEditorPage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const params = await searchParams;
  const catalog = cakeCatalog();
  const requested = params.template && catalog.templates.some((template) => template.id === params.template) ? params.template : undefined;

  return <CakeEditor catalog={catalog} {...(requested ? { initialTemplateId: requested } : {})} />;
}
