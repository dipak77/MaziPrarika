import Link from 'next/link';

import { cakeCatalog } from '@/lib/cake/catalog';

/**
 * /cake — the overview.
 *
 * Server-rendered: the collection artwork is generated here from the real
 * templates, so the first thing a visitor sees is the product rather than a
 * description of it. Two previews per collection are enough to communicate the
 * range without making the page heavy; the gallery loads the rest lazily.
 */

export const dynamic = 'force-static';
export const revalidate = 86400;

export default function CakeOverviewPage() {
  const catalog = cakeCatalog();
  const featured = catalog.collections.map((collection) => ({
    collection,
    templates: collection.heroTemplateIds
      .map((id) => catalog.templates.find((template) => template.id === id))
      .filter((template): template is NonNullable<typeof template> => Boolean(template)),
  }));

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold text-maroon-900 sm:text-3xl">
            A paper-art topper, designed in the browser, printed at home
          </h2>
          <p className="text-sm leading-relaxed text-ink-600">
            Choose a design, type the child&apos;s name, pick a palette and a size. The artwork never moves when the words
            change — the composition is fixed, so a long Marathi name and a short English one both sit properly on the same
            plate. When it is right, take the file: a high-resolution PNG at true print resolution, a vector SVG or PDF, or a
            layered cardstock pack with one cut file per sheet of paper.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/cake/templates" className="btn-maroon px-5 py-2.5 text-sm no-underline">
              Browse {catalog.totals.templates} designs
            </Link>
            <Link href="/cake/editor?template=royal-prince-crown" className="btn-gold px-5 py-2.5 text-sm no-underline">
              Open the editor
            </Link>
            <Link href="/cake/print" className="btn-outline px-5 py-2.5 text-sm no-underline">
              Print studio
            </Link>
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Designs', value: catalog.totals.templates },
              { label: 'Collections', value: catalog.totals.collections },
              { label: 'Palettes', value: catalog.totals.palettes },
              { label: 'Print sizes', value: catalog.totals.sizes },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-ivory-300/80 bg-white/85 px-3 py-2 shadow-sm">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-maroon-800/60">{item.label}</dt>
                <dd className="font-display text-2xl font-semibold text-maroon-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {featured.slice(0, 2).map(({ templates }) =>
            templates.slice(0, 1).map((template) => (
              <figure key={template.id} className="overflow-hidden rounded-2xl border border-ivory-300/80 bg-white shadow-sm">
                {/* Real artwork, rendered by the export engine on the server. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/cake/preview?templateId=${template.id}&widthMm=${template.nominalMm.w}&heightMm=${template.nominalMm.h}`}
                  alt={`${template.name} paper-art topper`}
                  width={480}
                  height={480}
                  className="h-auto w-full"
                />
                <figcaption className="px-3 py-2 text-[11px] text-ink-500">
                  <span className="font-semibold text-maroon-900">{template.name}</span> · {template.materials.length} paper layers
                </figcaption>
              </figure>
            )),
          )}
          <div className="col-span-2 grid grid-cols-2 gap-3">
            {featured.slice(2, 4).map(({ templates }) =>
              templates.slice(1, 2).map((template) => (
                <figure key={template.id} className="overflow-hidden rounded-2xl border border-ivory-300/80 bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/cake/preview?templateId=${template.id}&widthMm=${template.nominalMm.w}&heightMm=${template.nominalMm.h}`}
                    alt={`${template.name} paper-art topper`}
                    width={360}
                    height={480}
                    className="h-auto w-full"
                  />
                  <figcaption className="px-3 py-2 text-[11px] text-ink-500">{template.name}</figcaption>
                </figure>
              )),
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-maroon-900">What you can do</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Personalise without breaking the design',
              body: 'The name, title, subtitle, age and date each have their own region. The fit engine sizes and wraps the words inside it — with a visible warning instead of a truncated name when something simply cannot fit.',
            },
            {
              title: 'Twelve curated palettes, honest about metal',
              body: 'Every palette carries semantic tokens (name fill, title fill, outline, shadow, cutline) and per-template compatibility. Metallic finishes are simulated gradients and are labelled as such — no false foil promises.',
            },
            {
              title: 'Print output that states its measurements',
              body: 'PNG at the PPI you asked for, an SVG in millimetres, a PDF at the exact page size, or a layered ZIP with a manifest, a per-layer cut file, registration marks and assembly notes.',
            },
            {
              title: 'A preflight that blocks real problems',
              body: 'Text fit, font availability, cut paths, contrast, clipping and the export settings are checked before a file is produced. Warnings can be accepted — and are recorded in the production report.',
            },
            {
              title: 'Craft-ready layers',
              body: 'Each paper layer is a separate file: cut the magenta contours, fold the dashed blue scores, stack shadow → backing → base → mid → accent. The assembly sheet tells you the order.',
            },
            {
              title: 'Nothing leaves the browser',
              body: 'Projects are stored in this browser (IndexedDB) with undo/redo, favourites, recents and export history. JSON project files import and export for backup, and are validated on the way in.',
            },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-ivory-300/80 bg-white/85 p-4 shadow-sm">
              <h3 className="font-display text-base font-semibold text-maroon-900">{item.title}</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-xl font-semibold text-maroon-900">The twelve collections</h2>
          <Link href="/cake/templates" className="btn-outline px-3 py-1.5 text-[11px] no-underline">
            See all designs
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {catalog.collections.map((collection) => (
            <li key={collection.id} className="rounded-2xl border border-ivory-300/80 bg-white/85 p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-maroon-800/60">
                Collection {collection.index} · {collection.count} designs
              </p>
              <h3 className="mt-1 font-display text-base font-semibold text-maroon-900">{collection.name}</h3>
              <p className="mt-1 text-[12px] leading-snug text-ink-500">{collection.blurb}</p>
              <ul className="mt-2 space-y-0.5 text-[11px] text-ink-500">
                {collection.templateIds.map((id) => (
                  <li key={id}>
                    <Link href={`/cake/editor?template=${id}`} className="no-underline hover:text-maroon-800">
                      {catalog.templates.find((template) => template.id === id)?.name ?? id}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
