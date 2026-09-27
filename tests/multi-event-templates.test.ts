import { describe, expect, it } from "vitest";
import {
  EVENT_CATEGORIES,
  MASTER_TEMPLATES,
} from "../apps/web/src/lib/templates-catalog";

describe("50+ Master Templates Catalog", () => {
  it("contains at least 50 high-end templates across all categories", () => {
    expect(MASTER_TEMPLATES.length).toBeGreaterThanOrEqual(50);
  });

  it("ensures every event category has at least 3 top modern class templates", () => {
    const requiredCategories = [
      "wedding",
      "engagement",
      "puja",
      "gruhapravesh",
      "birthday",
      "naming",
      "babyshower",
      "biodata",
      "anniversary",
    ] as const;

    for (const cat of requiredCategories) {
      const templatesInCat = MASTER_TEMPLATES.filter((t) => t.category === cat);
      expect(
        templatesInCat.length,
        `Category '${cat}' should have at least 3 templates`
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it("validates all templates have localized names, descriptions, and styling", () => {
    for (const t of MASTER_TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.nameMr).toBeTruthy();
      expect(t.nameHi).toBeTruthy();
      expect(t.nameEn).toBeTruthy();
      expect(t.descMr).toBeTruthy();
      expect(t.bgGradient).toContain("linear-gradient");
      expect(t.accentColor).toMatch(/^#/);
      expect(t.defaultTitle).toBeTruthy();
      expect(t.defaultBlessing).toBeTruthy();
    }
  });

  it("verifies both blank placeholders and working sample data exist for every template", () => {
    for (const t of MASTER_TEMPLATES) {
      // Blank Placeholders
      expect(t.placeholders).toBeDefined();
      expect(t.placeholders.personA).toBeTruthy();
      expect(t.placeholders.date).toBeTruthy();
      expect(t.placeholders.venue).toBeTruthy();

      // Working Sample
      expect(t.sample).toBeDefined();
      expect(t.sample.personA).toBeTruthy();
      expect(t.sample.date).toBeTruthy();
      expect(t.sample.venue).toBeTruthy();
    }
  });

  it("verifies EVENT_CATEGORIES defines all primary categories with icons", () => {
    expect(EVENT_CATEGORIES.length).toBeGreaterThanOrEqual(9);
    for (const c of EVENT_CATEGORIES) {
      expect(c.id).toBeTruthy();
      expect(c.mr).toBeTruthy();
      expect(c.en).toBeTruthy();
      expect(c.icon).toBeTruthy();
    }
  });
});
