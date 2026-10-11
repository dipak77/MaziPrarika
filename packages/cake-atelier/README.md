# @mazi/cake-atelier

The engine behind **Cake Atelier Pro** — an original paper-art birthday cake
topper designer and print studio inside Mazi Patrika.

- **60 templates** across twelve named collections, each drawn in code from a
  shared vector library. No stock art, no photographs, no emoji, no runtime AI.
- **Deterministic scenes.** The same input produces byte-identical SVG. The
  artwork a customer approved is the artwork that prints.
- **Fixed composition.** Renaming a child, changing a font or switching a palette
  never moves a single artwork node — a property enforced by tests, not by hope.
- **Typography that measures.** Seven OFL families (22 files) with generated
  metric tables, multi-line fitting with a minimum readable size, Devanagari
  fallback, and fontkit-based text-to-path outlining for print.
- **Print output with stated measurements.** PNG at a real PPI, SVG in
  millimetres, a vector PDF at the exact page size, and a layered cardstock ZIP
  with per-layer cut files, registration marks, a manifest and assembly notes.

Full documentation, including the template authoring contract, the print pipeline
and the honest limitations, lives in
[`docs/cake-atelier.md`](../../docs/cake-atelier.md).

## Entry points

| Import | Runs where | Contains |
| --- | --- | --- |
| `@mazi/cake-atelier` | browser **and** node | geometry, scene, palettes, typography (metrics + fitting), art library, templates, SVG renderer, print planning, project model, Zod schemas |
| `@mazi/cake-atelier/templates` | browser and node | the design library without the renderers |
| `@mazi/cake-atelier/server` | node only | the above plus rasterisation (`@resvg/resvg-js`), PDF writing, text outlining (fontkit), layered packaging and the export orchestrator |

## Scripts

```bash
npm run fonts:metrics -w @mazi/cake-atelier   # regenerate src/typography/font-metrics.ts
npm run fonts:sync    -w @mazi/cake-atelier   # copy fonts + fonts.css into apps/web/public
```

## Minimal use

```ts
import { buildScene, requireTemplate } from '@mazi/cake-atelier';

const template = requireTemplate('royal-prince-crown');
const { scene, layouts } = buildScene(template, {
  paletteId: 'royal-blue-gold',
  content: { name: 'Aarav', title: 'Happy Birthday', subtitle: '', age: '5', date: '' },
  sizeMm: { w: 152.4, h: 152.4 },
});
console.log(layouts.name?.status); // 'fits' | 'shrunk' | 'clamped-min-size' | …
```

```ts
import { renderSceneToPng, renderSceneToPdf, generateExport } from '@mazi/cake-atelier/server';
```

## Fonts

The seven bundled families are licensed under the SIL Open Font License 1.1; the
licence text ships next to each family in `fonts/<family>/OFL.txt`. Metrics are
generated from those files, so the package is self-contained: no font downloads,
no third-party requests, and identical rendering on any machine.
