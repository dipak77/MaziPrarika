# Cake Atelier Pro

A paper-art birthday cake-topper designer and print studio, built into Mazi
Patrika. Sixty original vector designs, twelve curated palettes, and print output
that states its own measurements: PNG at a real PPI, SVG in millimetres, a vector
PDF at the exact page size, and a layered cardstock pack with one cut file per
sheet of paper.

Nothing here is generated at request time. Every illustration is drawn in code
from a shared primitive library, every name is fitted by measurement, and every
export happens on the server under validation.

---

## Contents

- [What is in the box](#what-is-in-the-box)
- [Run it](#run-it)
- [How the pieces fit together](#how-the-pieces-fit-together)
- [The 60 designs](#the-60-designs)
- [Authoring a template](#authoring-a-template)
- [Fixed composition, explained](#fixed-composition-explained)
- [Typography and fonts](#typography-and-fonts)
- [Palettes and simulated metal](#palettes-and-simulated-metal)
- [Print output](#print-output)
- [Preflight and the production report](#preflight-and-the-production-report)
- [HTTP API](#http-api)
- [The web studio](#the-web-studio)
- [Testing](#testing)
- [Honest limitations](#honest-limitations)

---

## What is in the box

| Piece | Path | What it is |
| --- | --- | --- |
| Engine | `packages/cake-atelier/` | `@mazi/cake-atelier` — scene model, palettes, typography, art library, 60 templates, export pipeline |
| Studio | `apps/web/src/app/cake/` | Overview, gallery, editor and print studio routes |
| UI | `apps/web/src/components/cake/` | Canvas, panels, gallery, print studio |
| Client state | `apps/web/src/lib/cake/` | Catalogue for the browser, zustand store, IndexedDB storage, preview builder |
| API | `apps/web/src/app/api/cake/` | `templates`, `preview`, `export` |
| Tests | `tests/cake-atelier*.ts`, `tests/cake-atelier.e2e.mjs`, `tests/e2e/cake-atelier.spec.ts` | Unit, integration, HTTP end-to-end and browser end-to-end |

## Run it

```bash
npm install                 # workspace install
npm run dev                 # http://localhost:3000/cake  (runs fonts:sync first)
```

```bash
npm test                    # vitest: unit + integration (all packages + tests)
npm run typecheck           # next app + every package
npm run test:e2e:cake       # Node end-to-end against a running server
npm run test:e2e:browser:install && npm run test:e2e:browser   # Playwright (needs a browser)
```

The Cake fonts are copied into `apps/web/public/cake-fonts/` by
`npm run fonts:sync -w @mazi/cake-atelier`, which `dev` and `build` run for you.
That directory is generated and is not committed.

## How the pieces fit together

```
template.compose(input)            ← pure function: (tokens, layout, flags) → SceneNode[]
        │
        ▼
   buildScene()                    ← resolves palette, fits text, scales to the
        │                             requested physical size, returns a typed Scene
        ├──────────────► renderSceneToSvg()   → preview, gallery, SVG export
        ├──────────────► renderSceneToPng()   → resvg at the requested PPI (server)
        ├──────────────► renderSceneToPdf()   → vector pages, exact MediaBox (server)
        └──────────────► planLayers()         → per-material cut/score files + ZIP
                                 │
                          preflight() ──► blocks/severities ──► production report
```

The scene is the single source of truth. A `Scene` is a tree of `ShapeNode`,
`GroupNode` and `TextNode` values, each carrying an `id`, a `role` (`background`,
`backing`, `illustration`, `nameplate`, `title`, `subtitle`, `name`, `age`,
`date`, `accents`), a `material` (`base`, `base-back`, `mid`, `accent`, `foil`,
`shadow`), and cut/score flags. Roles are what make the layered output possible;
materials are what make the print advice possible.

## The 60 designs

Twelve collections, five designs each (ids are stable and never reused):

| # | Collection | Designs |
| --- | --- | --- |
| 1 | Royal Prince | `royal-prince-crown`, `little-king-throne`, `sapphire-royal-medallion`, `prince-castle-shield`, `royal-baby-bear` |
| 2 | Princess & Royal Celebration | `fairy-princess-tiara`, `princess-castle-balloons`, `rose-gold-crown-frame`, `butterfly-princess-wand`, `princess-carriage` |
| 3 | Jungle & Safari | `safari-elephant-parade`, `little-lion-mane`, `monkey-jungle-vine`, `giraffe-sunshine`, `safari-sunset-arch` |
| 4 | Dinosaurs | `t-rex-roar`, `baby-dino-egg`, `stegosaurus-valley`, `dino-fossil-dig`, `volcano-island` |
| 5 | Space & Galaxy | `rocket-blast-off`, `little-astronaut`, `planet-parade`, `moon-landing`, `galaxy-name` |
| 6 | Original Superhero | `superhero-emblem`, `lightning-bolt-hero`, `comic-burst-cape`, `hero-mask-shield`, `skyline-guardian` |
| 7 | Unicorn & Fantasy | `unicorn-rainbow-crown`, `magical-unicorn`, `rainbow-cloud-ride`, `unicorn-horn-sparkle`, `fairy-wings-wand` |
| 8 | Teddy Bear & Woodland | `teddy-bear-balloons`, `baby-bear-cloud`, `bunny-first-birthday`, `koala-cuddle`, `woodland-fox` |
| 9 | Vehicles & Construction | `race-car-checkered`, `monster-truck-crush`, `digger-site`, `formula-number`, `airplane-sky-trail` |
| 10 | Floral & Butterfly | `watercolour-rose-garden`, `boho-pampas-arch`, `daisy-meadow-wheel`, `peony-blossom-frame`, `botanical-leaf-wreath` |
| 11 | Ocean & Underwater | `under-the-sea-friends`, `whale-wave-splash`, `turtle-bubbles`, `mermaid-lagoon`, `sailboat-seaside` |
| 12 | Farm, Aviation & Adventure | `barnyard-sunrise`, `garden-bee-and-sunflower`, `little-tractor-field`, `chicken-coop-cute`, `windmill-wheat-field` |

No copyrighted characters or brands are referenced; the superhero collection is
deliberately generic (emblems, bolts, capes, skyline).

## Authoring a template

A template declares its intent and composes its artwork; it never touches fonts,
colours or sizes directly.

```ts
import {
  MATERIAL_SETS,
  OPTIONAL_COMPONENTS,
  TYPOGRAPHY,
  ageBadgeFor,
  assemble,
  composeCtx,
  drawText,
  foilGradient,
  layout,
  nameplateFor,
  on,
  paperStack,
  starCluster,
  supportTabs,
  type CakeTemplate,
  type OptionalComponentSpec,
} from '@mazi/cake-atelier';

import { crown, crownArch, diamondRule, flourish, haloPlate } from '../../art/royal.js';

const FAM = { display: 'playfair-display', title: 'poppins', body: 'poppins' };

/** Only the switches this design supports, in the order they appear in the UI. */
const OPTIONALS: OptionalComponentSpec[] = [
  OPTIONAL_COMPONENTS.backing!,
  OPTIONAL_COMPONENTS.sparkles!,
  OPTIONAL_COMPONENTS.cutline!,
  OPTIONAL_COMPONENTS.supportStick!,
];

export const myDesign: CakeTemplate = {
  id: 'my-design',
  version: 1,
  name: 'My Design',
  description: 'One clear sentence about what a parent will see on the cake.',
  category: 'royal-prince',
  tags: { gender: ['unisex'], styles: ['royal', 'playful'], occasions: ['birthday', 'first-birthday'], ages: [1, 8] },
  aspect: 'square',                       // 'square' | 'portrait' | 'landscape'
  defaultPalette: 'royal-blue-gold',
  typography: TYPOGRAPHY.royalDisplay!,   // approved families + weights for this mood
  regions: layout('classic', FAM, {       // preset + per-template region tweaks
    name: { x: 13, y: 99, width: 126.4, height: 26, maxSizePt: 40, minSizePt: 11, maxLines: 2, breakWords: true, families: [FAM.display, FAM.body] },
  }),
  defaults: { name: 'Aarav', title: 'Happy Birthday', subtitle: 'One year of wonder', age: '1', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'glow', accent: 'primarySoft' },
  safeInset: 6,
  notes: 'Print the crown on gold card if you are cutting by hand.',

  compose(input) {
    const ctx = composeCtx(input, 'base');       // base material for untagged nodes
    const t = input.tokens;                      // semantic colours, never literals
    const cx = input.width / 2;
    const nodes = [];

    if (on(input, 'backing')) {
      nodes.push(paperStack(ctx, { x: 12, y: 10, w: input.width - 24, h: 122 }, { layers: 2, inset: 2.6, radius: 6, tones: [t.primarySoft, t.surfaceAlt, t.surface] }));
    }
    nodes.push(haloPlate(ctx, { cx, cy: 58, r: 43, fill: t.surface, ringColor: t.secondary, ringWidth: 1.5 }));
    nodes.push(
      crown(ctx, {
        cx, cy: 70, width: 76, height: 44, style: 'classic', base: t.primary, jewel: t.accent, pearl: t.highlight,
        metal: foilGradient(t, [cx - 38, 34], [cx + 38, 92]),   // simulated metal, fills only
      }),
    );
    nodes.push(crownArch(ctx, { cx, cy: 30, r: 8.5, metal: t.secondary }));
    nodes.push(diamondRule(ctx, { x: 44, y: 84, width: 64.4, color: t.secondary }));
    nodes.push(flourish(ctx, { cx, cy: 92, width: 86, color: t.secondary }));
    nodes.push(...starCluster(ctx, { points: [[24, 26], [128, 30], [20, 84], [132, 78]], r: 3.2, fill: t.secondarySoft }));

    // Text always goes through the declared regions.
    nodes.push(nameplateFor(input, { style: 'ribbon', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.secondary }));
    nodes.push(...ageBadgeFor(input, { petals: 20 }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: input.textFill?.name ?? t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.nameplateInk, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));

    return assemble(nodes);   // sorts by role, stamps ids and materials
  },
};
```

Register it in `src/templates/registry.ts` (its category array) and the
validation suite picks it up immediately.

Rules that keep a library of sixty coherent:

1. **Draw from the art library** (`art/decor.ts`, `art/royal.ts`, `art/animals.ts`,
   `art/world.ts`, `art/motifs.ts`, `art/backgrounds.ts`) or with the path helpers
   in `geometry.ts`. Every curve is a cubic; the SVG writer never emits `A`/`S`/`T`.
2. **Take colours from `input.tokens`**, never from literals.
3. **Place text through the declared regions** (`nameplateFor`, `ageBadgeFor`,
   `drawText`) so the fixed-composition rule holds.
4. **Tag nodes with roles and materials** — that is what produces the layered
   cut files and the production advice.
5. **Seed any randomness with `designRandom(template)`**, which depends only on
   the template id and version. Never on the name or the palette.

`npm test` fails if a template id is duplicated, a collection is short, a region
falls outside the canvas, a region lacks approved fonts, or a template is missing
a required `name`/`title` region.

## Fixed composition, explained

The promise: *changing the name, the font or the palette never moves the
artwork.*

Three mechanisms enforce it.

1. **Regions, not free text.** Each template declares where the name, title,
   subtitle, age and date may live (x, y, width, height, min/max size, max lines,
   allowed families, letter-spacing bounds). The fit engine binary-searches the
   largest size that fits, then relaxes letter-spacing inside the template's
   bounds, and only then reports a problem.
2. **Decoration is seeded by identity.** `designRandom(template)` hashes
   `templateId | version | decor`. Renaming a child cannot move a sprinkled star,
   because the name is not an input.
3. **A byte-level test.** `tests/cake-atelier-export.test.ts` renders the same
   design twice with different names, strips the name node and the document
   title, and asserts the remaining SVG is *identical*. A second test asserts that
   switching palette changes the bytes but not a single `d="…"` path.

When text genuinely cannot fit, the engine reports `clamped-min-size` or
`needs-extra-line` with a warning, and the preflight turns that into a blocking
error or a visible warning. It never truncates and never inserts an ellipsis.

## Typography and fonts

Seven families (22 files) are bundled with their OFL licences and used for both
measurement and shaping:

| Family | Weights | Character |
| --- | --- | --- |
| Baloo 2 | 400, 600, 800 | Rounded, friendly, Devanagari in the same design |
| Playfair Display | 400, 700, 900 | High-contrast royal serif |
| Poppins | 300, 500, 700 | Geometric sans for titles and small text |
| Quicksand | 400, 600 | Soft nursery face |
| Great Vibes | 400 | Script accents |
| Bebas Neue | 400 | Condensed caps for bold/sport designs |
| Noto Sans Devanagari | 400, 700 | Marathi and Hindi names |

- `npm run fonts:metrics -w @mazi/cake-atelier` regenerates
  `src/typography/font-metrics.ts` (advance widths at 1/1000 em, ascent, descent,
  cap height, x-height, Devanagari coverage) from the committed fonts.
- Measurement runs on those tables — no canvas, no layout shift, identical in the
  browser, in Node and in the test runner.
- **Outlining** (`typography/outline.ts`) uses fontkit to convert text to paths
  for print exports, so a file never depends on a font being installed. The SVG
  export can keep live text when you ask for it.
- **Script fallback**: a Latin-only display face asked to set `आरव` is replaced by
  a Devanagari face, and the substitution is reported rather than hidden.

## Palettes and simulated metal

Twelve palettes carry semantic tokens rather than raw colours: `primary`,
`secondary`, `accent`, `background`, `nameFill`, `titleFill`, `subtitleFill`,
`plaqueInk`, `plaquePaper`, `outline`, `shadow`, `cutline`, `foil`, `foilShade`.
Templates remap tokens per palette (`paletteOverrides`) so an off-palette choice
still looks composed.

Metallic gradients are **simulated**: an RGB gradient that imitates gold, silver
or rose gold. The UI says so in the palette panel, the production report says so,
and the layered package includes a separate foil layer so a printer can run a real
foil pass. There is no claim of physical metal anywhere in the code or the copy.

## Print output

| Format | What you get |
| --- | --- |
| `png` | Raster at the requested PPI (72–600). 152.4 mm at 300 PPI is 1800 px — verified by reading the IHDR chunk in the tests. Transparent or white background, no editor chrome. |
| `svg` | Physical millimetres, explicit `viewBox`, optional text-to-outlines, optional bleed/safe-area/registration layers. No scripts, no `foreignObject`, no remote references. |
| `pdf` | A real vector PDF: page box equal to the trim size (plus bleed), paths in points, text outlined so no `/Font` resource is needed. |
| `layers` | A ZIP: `layer-<material>.svg` per paper layer, `assembly-proof.svg`, `manifest.json`, `production-report.txt`, `ASSEMBLY.txt`, `README.txt`. Magenta = cut, dashed blue = score, four registration marks. |

Sizes come from `print/sizes.ts` (4/5/6/8/10/12 in rounds, 4×6 and 5×7 portrait,
cupcake and banner presets, A5/A4/12×12 card) plus any custom millimetre or inch
input between 25 mm and 600 mm. A size that does not match the design's aspect
ratio is blocked with an explanation rather than stretched.

## Preflight and the production report

`preflight()` returns `{ ok, canExportWithAcknowledgement, checks, errors,
warnings, info, summary }` over dimensions, text fit, fonts, materials, path
validity, clipping, external assets, cut contours, export settings and name
contrast.

- **Errors block the export** (HTTP 422 with the reasons attached).
- **Warnings can be acknowledged**, and the acknowledgement is written into the
  report and the ZIP.
- The **production report** lists trim size, inches, bleed, raster, text mode,
  faces, smallest text, cut tolerance, paper layers with cut areas, the simulated
  foil note, and timestamp. It ships as `production-report.txt` inside layered
  packages and is downloadable on its own.

## HTTP API

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/cake/templates` | GET | Catalogue as JSON. Filters: `search`, `category`, `gender`, `style`, `occasion`, `age`, `sort`, `limit`. |
| `/api/cake/preview` | GET | Server-rendered SVG. Params: `templateId` (required), `name`, `title`, `subtitle`, `age`, `date`, `palette`, `widthMm`, `heightMm`, `cutline`, `guides`, `transparent`, `download`. ETag + fingerprint headers; 304 supported. |
| `/api/cake/export` | POST | Export. Body: `ExportRequestSchema` (`project`, `format`, `ppi`, `bleedMm`, `transparent`, `outlineText`, `includeGuides`, `includeRegistration`, `cutline`, `cutToleranceMm`, `acknowledgement`, `dryRun`). |

`dryRun: true` returns the preflight, the production report and the file list
without rendering — that is what the studio's “Check” calls, and it is how the
print studio shows the numbers you will actually get.

Guard rails: Zod validation on every field (400 with reasons), a 512 kB body
limit (413), a 45-second render timeout, `Cache-Control: no-store` on files,
sanitised download filenames, and a CSP on SVG responses.

## The web studio

- **`/cake`** — overview with live artwork from the real engine.
- **`/cake/templates`** — all 60 with filters, search, favourites and per-card
  downloads. Thumbnails come from `/api/cake/preview`.
- **`/cake/editor`** — library, live canvas (zoom, cut contour, guides), and panels
  for words, palette, typography, pieces, size and project management. Undo/redo,
  keyboard shortcuts (`Ctrl/⌘+Z`, `Shift+Ctrl/⌘+Z`, `Ctrl/⌘+S`, `Ctrl/⌘+P`, `?`),
  JSON project import/export, drafts, favourites and recents.
- **`/cake/print`** — size and output settings, bleed, tolerance, guides, layer
  plan, cardstock breakdown, production report, preflight checklist with blocking
  and acknowledgement, and the download for each format. Exports are recorded in
  local history.

Projects live in IndexedDB (`mazi-cake-atelier`), so a design survives a reload
and never leaves the device unless you export it.

## Testing

| Suite | Command | What it proves |
| --- | --- | --- |
| Unit + integration | `npm test` | Registry integrity (60 templates, 12×5, unique ids), palette tokens, font fallback and Devanagari substitution, the name-fitting matrix, mm↔px↔pt arithmetic, project round-trip and migration, SVG sanitisation, export-request validation, cut/layer manifests |
| Export integration | `npx vitest run tests/cake-atelier-export.test.ts` | Real PNG dimensions, PDF MediaBox and absence of `/Font`, layered ZIP contents, determinism, palette changes that do not move geometry, preflight blocking, and **a PDF for all 60 templates** |
| HTTP end-to-end | `npm run test:e2e:cake` | 60 checks against a running server: catalogue, preview (ETag/304, 422, 404, 400, Devanagari), dry-run report, PNG/SVG/PDF/ZIP bytes read back, guard rails (413/400/422), all pages, and a preview for every one of the 60 designs |
| Browser end-to-end | `npx playwright test` | The UI in a real browser: selection, short/long/Unicode names, font and palette changes, undo/redo, save and reload, downloads, blocked exports, mobile layout |

The browser suite needs `npx playwright install chromium`; in the build sandbox
that download is unavailable, so those specs are committed but were not executed
there — the HTTP suite above covers the same API surface and does run.

## Honest limitations

- **Simulated metal.** Gold/silver/rose-gold are RGB gradients. Real foil needs a
  foil stamp or a spot colour; the layered pack isolates a foil layer for exactly
  that hand-off.
- **Devanagari measurement is per-codepoint**, from the font tables, and does no
  open-type shaping when *measuring*. Shaping happens when outlining (fontkit), so
  the printed outlines are correct; the on-screen fit is a close approximation,
  which is why the server preflight is the authoritative check.
- **Browser preview vs server output.** The editor renders live `<text>` with the
  bundled web fonts; the server outlines glyphs with fontkit. Line breaking of an
  extreme name can differ by a hair between the two. The preflight reports the
  server's verdict.
- **No GIF/APNG.** Layered output is a ZIP of per-layer SVG cut files plus a flat
  assembly proof; there is no animated variant, and none is claimed in the UI.
- **No automated cut-file dialect export** (no `.studio3`, `.fcm`). The layered
  SVGs use explicit contours with registration marks; converting to a machine
  dialect is a documented next step.
- **Storage is per browser.** Clearing site data removes local projects; use
  “Download project file” for a durable copy.

---

Licences: the bundled fonts are OFL-1.1 (see `packages/cake-atelier/fonts/*/OFL.txt`).
All artwork is original vector code written for this project.
