/**
 * Development smoke test — builds every registered template and writes real
 * files to a scratch directory so the artwork can be inspected by eye during
 * development. Not part of the release suite (see `packages/cake-atelier` tests).
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { allTemplates, buildScene } from '../packages/cake-atelier/src/index.js';
import { renderSceneToSvg } from '../packages/cake-atelier/src/render/svg.js';

const OUT = path.join(process.cwd(), '.scratch', 'cake-atelier');

describe('cake atelier smoke', () => {
  it('builds registered templates and writes SVG previews', () => {
    mkdirSync(OUT, { recursive: true });
    const templates = allTemplates();
    expect(templates.length).toBeGreaterThan(0);
    for (const template of templates) {
      const built = buildScene(template, {
        content: { name: 'Aarav', title: 'Happy Birthday', subtitle: 'Feel the joy', age: '5', date: '' },
        flags: { backing: true, sparkles: true, confetti: true, cutline: false, supportStick: false, registration: true },
      });
      const svg = renderSceneToSvg(built.scene, { title: `${template.name} preview`, showGuides: false });
      writeFileSync(path.join(OUT, `${template.id}.svg`), svg, 'utf8');
      expect(svg).toContain('<svg');
    }
    expect(true).toBe(true);
  });
});
