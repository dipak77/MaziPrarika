import { describe, expect, it } from "vitest";
import {
  BIODATA_LABELS,
  BIODATA_PRESETS,
  BIODATA_TEMPLATES,
  DEFAULT_BIODATA_EN,
  DEFAULT_BIODATA_HI,
  DEFAULT_BIODATA_MR,
  formatBiodataAsWhatsAppText,
} from "../apps/web/src/lib/biodata-data";
import { TEMPLATES } from "../apps/web/src/lib/arch-data";

describe("Biodata Templates & Presets", () => {
  it("defines the ultra-premium biodata templates matching reference styles", () => {
    const ids = BIODATA_TEMPLATES.map((t) => t.id);
    expect(ids).toContain("royal-purple");
    expect(ids).toContain("burgundy-damask");
    expect(ids).toContain("temple-portal");
    expect(ids).toContain("midnight-navy");
    expect(ids).toContain("heritage-maroon");
    expect(ids).toContain("emerald-garden");
    expect(ids).toContain("sapphire-moon");
    expect(ids).toContain("ivory-royal");
    expect(BIODATA_TEMPLATES.length).toBeGreaterThanOrEqual(8);
  });

  it("verifies all templates have valid colors, gradients, and photo styles", () => {
    for (const t of BIODATA_TEMPLATES) {
      expect(t.name).toBeTruthy();
      expect(t.nameHi).toBeTruthy();
      expect(t.nameEn).toBeTruthy();
      expect(t.bgGradient).toContain("linear-gradient");
      expect(t.badgeBg).toContain("linear-gradient");
      expect(t.accentColor).toMatch(/^#/);
      expect(["circle", "square"]).toContain(t.photoStyle);
    }
  });

  it("provides comprehensive localized presets in Marathi, Hindi, and English", () => {
    expect(DEFAULT_BIODATA_MR.fullName).toContain("देशमुख");
    expect(DEFAULT_BIODATA_MR.lang).toBe("mr");
    expect(DEFAULT_BIODATA_MR.blessing).toContain("गणेशाय");

    expect(DEFAULT_BIODATA_HI.fullName).toContain("यादव");
    expect(DEFAULT_BIODATA_HI.lang).toBe("hi");

    expect(DEFAULT_BIODATA_EN.fullName).toContain("Sharma");
    expect(DEFAULT_BIODATA_EN.lang).toBe("en");
  });

  it("provides instant preset profiles for grooms and brides", () => {
    expect(BIODATA_PRESETS.length).toBeGreaterThanOrEqual(4);
    const labels = BIODATA_PRESETS.map((p) => p.labelMr);
    expect(labels.some((l) => l.includes("वर"))).toBe(true);
    expect(labels.some((l) => l.includes("वधू"))).toBe(true);
  });

  it("formats ready-to-share WhatsApp messages with all relevant sections", () => {
    const waText = formatBiodataAsWhatsAppText(DEFAULT_BIODATA_MR);
    expect(waText).toContain("*॥ श्री गणेशाय नमः ॥*");
    expect(waText).toContain(DEFAULT_BIODATA_MR.fullName);
    expect(waText).toContain(DEFAULT_BIODATA_MR.dob);
    expect(waText).toContain(DEFAULT_BIODATA_MR.education);
    expect(waText).toContain(DEFAULT_BIODATA_MR.fatherName);
    expect(waText).toContain(DEFAULT_BIODATA_MR.phone);
  });

  it("ensures BIODATA_LABELS contains full translations for mr, hi, and en", () => {
    for (const lang of ["mr", "hi", "en"] as const) {
      const labels = BIODATA_LABELS[lang];
      expect(labels.fullName).toBeTruthy();
      expect(labels.dob).toBeTruthy();
      expect(labels.education).toBeTruthy();
      expect(labels.occupation).toBeTruthy();
      expect(labels.fatherName).toBeTruthy();
      expect(labels.phone).toBeTruthy();
      expect(labels.sectionPersonal).toBeTruthy();
      expect(labels.sectionFamily).toBeTruthy();
      expect(labels.sectionContact).toBeTruthy();
    }
  });
});

describe("Expanded Lagna Patrika Templates", () => {
  it("includes royal-purple, temple-gold, midnight-navy, and heritage-maroon in TEMPLATES", () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(ids).toContain("royal-purple");
    expect(ids).toContain("temple-gold");
    expect(ids).toContain("midnight-navy");
    expect(ids).toContain("heritage-maroon");
    expect(ids).toContain("paithani");
    expect(ids).toContain("rajmudra");
    expect(ids).toContain("emerald-garden");
    expect(ids).toContain("sapphire-moon");
    expect(ids).toContain("rose-petal");
    expect(ids).toContain("ivory-royal");
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(8);
  });
});
