'use client';

/**
 * Cake Atelier Pro — the design gallery.
 *
 * Thumbnails are served by `/api/cake/preview`, which renders the *real*
 * artwork through the same engine the exporter uses. Nothing here is a mockup:
 * if a template thumbnail looks right, that template prints right.
 *
 * Filters are applied in the browser against the catalogue the page already
 * has, so changing a filter is instant and needs no round trip. Age, style and
 * occasion come straight from the template's declared tags.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import type { CakeCatalog, CakeTemplateSummary } from '@/lib/cake/catalog';
import { CAKE_MOODS } from '@/lib/cake/catalog';
import { readMeta, writeMeta } from '@/lib/cake/db';
import { Field, SelectInput, TextInput, Toggle } from './field';

const FAVOURITES_KEY = 'favouriteTemplateIds';

export function CakeGallery({ catalog }: { catalog: CakeCatalog }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [style, setStyle] = useState<string>('all');
  const [occasion, setOccasion] = useState<string>('all');
  const [age, setAge] = useState<string>('any');
  const [mood, setMood] = useState<string>('all');
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [sort, setSort] = useState<'category' | 'name'>('category');

  useEffect(() => {
    void readMeta<string[]>(FAVOURITES_KEY).then((value) => setFavourites(value ?? []));
  }, []);

  const paletteById = useMemo(() => new Map(catalog.palettes.map((entry) => [entry.id, entry])), [catalog.palettes]);

  const styles = useMemo(() => {
    const set = new Set<string>();
    for (const template of catalog.templates) template.tags.styles.forEach((entry) => set.add(entry));
    return [...set].sort();
  }, [catalog.templates]);

  const occasions = useMemo(() => {
    const set = new Set<string>();
    for (const template of catalog.templates) template.tags.occasions.forEach((entry) => set.add(entry));
    return [...set].sort();
  }, [catalog.templates]);

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = catalog.templates.filter((template) => {
      if (category !== 'all' && template.category !== category) return false;
      if (style !== 'all' && !template.tags.styles.includes(style as never)) return false;
      if (occasion !== 'all' && !template.tags.occasions.includes(occasion as never)) return false;
      if (age !== 'any') {
        const value = Number(age);
        const [min, max] = template.tags.ages;
        if (value < min || value > max) return false;
      }
      if (mood !== 'all') {
        const palette = paletteById.get(template.defaultPalette);
        if (!palette || palette.mood !== mood) return false;
      }
      if (favouritesOnly && !favourites.includes(template.id)) return false;
      if (!term) return true;
      return `${template.name} ${template.description} ${template.categoryName} ${template.tags.styles.join(' ')} ${template.tags.occasions.join(' ')}`
        .toLowerCase()
        .includes(term);
    });
    return [...list].sort((a, b) =>
      sort === 'name' ? a.name.localeCompare(b.name) : a.categoryIndex - b.categoryIndex || a.name.localeCompare(b.name),
    );
  }, [catalog.templates, category, style, occasion, age, mood, favouritesOnly, favourites, search, sort, paletteById]);

  const toggleFavourite = (id: string) => {
    const next = favourites.includes(id) ? favourites.filter((entry) => entry !== id) : [...favourites, id];
    setFavourites(next);
    void writeMeta(FAVOURITES_KEY, next);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-2xl border border-ivory-300/80 bg-white/85 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Search">
          <TextInput value={search} onChange={setSearch} placeholder="e.g. crown, whale, tractor, arch" />
        </Field>
        <Field label="Collection">
          <SelectInput
            value={category}
            onChange={setCategory}
            options={[
              { value: 'all', label: `All ${catalog.collections.length} collections` },
              ...catalog.collections.map((entry) => ({ value: entry.id as string, label: `${entry.index}. ${entry.name} (${entry.count})` })),
            ]}
          />
        </Field>
        <Field label="Style">
          <SelectInput value={style} onChange={setStyle} options={[{ value: 'all', label: 'Any style' }, ...styles.map((entry) => ({ value: entry, label: entry }))]} />
        </Field>
        <Field label="Occasion">
          <SelectInput
            value={occasion}
            onChange={setOccasion}
            options={[{ value: 'all', label: 'Any occasion' }, ...occasions.map((entry) => ({ value: entry, label: entry.replace('-', ' ') }))]}
          />
        </Field>
        <Field label="Age on the day">
          <SelectInput
            value={age}
            onChange={setAge}
            options={[
              { value: 'any', label: 'Any age' },
              ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16].map((value) => ({ value: String(value), label: value === 0 ? 'Under 1' : `${value} years` })),
            ]}
          />
        </Field>
        <Field label="Palette mood">
          <SelectInput value={mood} onChange={setMood} options={[{ value: 'all', label: 'Any mood' }, ...CAKE_MOODS.map((entry) => ({ value: entry, label: entry }))]} />
        </Field>
        <Field label="Sort">
          <SelectInput
            value={sort}
            onChange={(value) => setSort(value as 'category' | 'name')}
            options={[
              { value: 'category', label: 'Collection order' },
              { value: 'name', label: 'Name (A–Z)' },
            ]}
          />
        </Field>
        <div className="flex items-end">
          <Toggle
            checked={favouritesOnly}
            onChange={setFavouritesOnly}
            label="Favourites only"
            hint={`${favourites.length} starred on this device`}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-500">
          <span className="font-semibold text-maroon-900">{results.length}</span> of {catalog.totals.templates} designs
          {category !== 'all' ? ` in ${catalog.collections.find((entry) => entry.id === category)?.name}` : ''}
        </p>
        <button
          type="button"
          className="btn-ghost px-3 py-1.5 text-[11px]"
          onClick={() => {
            setSearch('');
            setCategory('all');
            setStyle('all');
            setOccasion('all');
            setAge('any');
            setMood('all');
            setFavouritesOnly(false);
          }}
        >
          Clear filters
        </button>
      </div>

      {results.length === 0 ? (
        <p className="rounded-2xl border border-ivory-300 bg-white/80 p-8 text-center text-sm text-ink-500">
          No design matches those filters. Try clearing the age or style filter — the library covers every age from a
          first birthday to a graduation.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((template) => (
            <li key={template.id}>
              <TemplateCard
                template={template}
                paletteName={paletteById.get(template.defaultPalette)?.name ?? template.defaultPalette}
                favourite={favourites.includes(template.id)}
                onToggleFavourite={() => toggleFavourite(template.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  paletteName,
  favourite,
  onToggleFavourite,
}: {
  template: CakeTemplateSummary;
  paletteName: string;
  favourite: boolean;
  onToggleFavourite: () => void;
}) {
  const previewSrc = `/api/cake/preview?templateId=${encodeURIComponent(template.id)}&widthMm=${template.nominalMm.w}&heightMm=${template.nominalMm.h}`;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ivory-300/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative bg-[repeating-conic-gradient(#f6efe0_0%_25%,#fdfaf3_0%_50%)] bg-[length:14px_14px] p-2">
        {/* The thumbnail is the real artwork, rendered by the export engine. */}
        <img
          src={previewSrc}
          alt={`${template.name} — ${template.description}`}
          width={320}
          height={Math.round((320 * template.nominalMm.h) / template.nominalMm.w)}
          loading="lazy"
          decoding="async"
          className="mx-auto h-auto w-full rounded-xl shadow-sm"
        />
        <button
          type="button"
          onClick={onToggleFavourite}
          aria-pressed={favourite}
          aria-label={favourite ? `Remove ${template.name} from favourites` : `Add ${template.name} to favourites`}
          className="absolute right-3 top-3 rounded-full border border-ivory-300 bg-white/90 px-2 py-0.5 text-sm shadow-sm transition hover:border-gold-500"
        >
          {favourite ? '★' : '☆'}
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="font-display text-base font-semibold leading-tight text-maroon-900">{template.name}</h3>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-ink-400">
            {template.categoryIndex}. {template.categoryName}
          </p>
        </div>
        <p className="text-[12px] leading-snug text-ink-500">{template.description}</p>
        <ul className="flex flex-wrap gap-1">
          {template.tags.styles.slice(0, 2).map((entry) => (
            <li key={entry} className="rounded-full bg-ivory-200 px-2 py-0.5 text-[10px] text-ink-600">
              {entry}
            </li>
          ))}
          <li className="rounded-full bg-ivory-200 px-2 py-0.5 text-[10px] text-ink-600">{template.materials.length} layers</li>
          <li className="rounded-full bg-ivory-200 px-2 py-0.5 text-[10px] text-ink-600">
            ages {template.tags.ages[0]}–{template.tags.ages[1]}
          </li>
        </ul>
        <p className="text-[11px] text-ink-400">Default palette: {paletteName}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          <Link href={`/cake/editor?template=${template.id}`} className="btn-maroon px-3 py-1.5 text-[11px] no-underline">
            Open in editor
          </Link>
          <a
            href={`${previewSrc}&download=1`}
            className="btn-outline px-3 py-1.5 text-[11px] no-underline"
            download={`${template.id}.svg`}
          >
            SVG preview
          </a>
        </div>
        <p className="text-[10px] leading-snug text-ink-400">{template.notes}</p>
      </div>
    </article>
  );
}
