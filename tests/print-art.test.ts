import { describe, expect, it } from "vitest";
import {
  ART_REGISTRY,
  FOIL_HEX,
  artText,
  artVariants,
  defaultVariants,
  getPrintArt,
  registerArt,
  registerRegionalText,
  type PrintArtSpec,
} from "../apps/web/src/lib/print-art";
import { MASTER_TEMPLATES } from "../apps/web/src/lib/templates-catalog";
function isHexOrGradient(v: string): boolean {
  return v.startsWith("#") || v.startsWith("linear-gradient");
}
describe("print-art registry shape", () => {
  it("every registered spec has >=3 variants with unique ids and valid color fields", () => {
    expect(Object.keys(ART_REGISTRY).length).toBeGreaterThan(0);
    for (const spec of Object.values(ART_REGISTRY)) {
      expect(spec.variants.length).toBeGreaterThanOrEqual(3);
      const ids = spec.variants.map((v) => v.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const v of spec.variants) {
        expect(v.id).toBeTruthy();
        expect(v.labelMr).toBeTruthy();
        expect(isHexOrGradient(v.bg)).toBe(true);
        expect(isHexOrGradient(v.bgGradient)).toBe(true);
        expect(isHexOrGradient(v.accentColor)).toBe(true);
        expect(isHexOrGradient(v.textColor)).toBe(true);
      }
    }
  });
  it("every MASTER_TEMPLATES id resolves to a spec", () => {
    expect(MASTER_TEMPLATES.length).toBeGreaterThanOrEqual(50);
    for (const t of MASTER_TEMPLATES) {
      expect(getPrintArt(t.id), `missing spec for ${t.id}`).toBeDefined();
    }
  });
  it("every MASTER_TEMPLATES entry has trilingual names", () => {
    for (const t of MASTER_TEMPLATES) {
      expect(t.nameMr?.trim(), `${t.id} nameMr`).toBeTruthy();
      expect(t.nameHi?.trim(), `${t.id} nameHi`).toBeTruthy();
      expect(t.nameEn?.trim(), `${t.id} nameEn`).toBeTruthy();
    }
  });
});
describe("print-art artText fallback", () => {
  it("mr returns inputs unchanged", () => {
    expect(artText("unknown-template", "mr", "आशीर्वाद", "शीर्षक")).toEqual({
      blessing: "आशीर्वाद",
      title: "शीर्षक",
    });
  });
  it("hi and en fall back to mr inputs when template is unregistered", () => {
    expect(artText("unknown-template-2", "hi", "आशीर्वाद", "शीर्षक")).toEqual({
      blessing: "आशीर्वाद",
      title: "शीर्षक",
    });
    expect(artText("unknown-template-2", "en", "आशीर्वाद", "शीर्षक")).toEqual({
      blessing: "आशीर्वाद",
      title: "शीर्षक",
    });
  });
  it("returns registered regional text for hi and en", () => {
    const id = "spec-regional-fixture";
    registerRegionalText({
      [id]: { blessingHi: "आशीर्वाद-हिंदी", titleEn: "Title-English" },
    });
    expect(artText(id, "hi", "आशीर्वाद", "शीर्षक")).toEqual({
      blessing: "आशीर्वाद-हिंदी",
      title: "शीर्षक",
    });
    expect(artText(id, "en", "आशीर्वाद", "शीर्षक")).toEqual({
      blessing: "आशीर्वाद",
      title: "Title-English",
    });
  });
});
describe("print-art FOIL_HEX completeness", () => {
  it("covers gold, rosegold, silver and copper with bright, deep and soft hexes", () => {
    for (const foil of ["gold", "rosegold", "silver", "copper"] as const) {
      const entry = FOIL_HEX[foil];
      expect(entry.bright).toMatch(/^#/);
      expect(entry.deep).toMatch(/^#/);
      expect(entry.soft).toMatch(/^#/);
    }
  });
});
describe("print-art helpers with inline fixtures", () => {
  it("defaultVariants builds 4 variants with unique ids and valid colors", () => {
    const variants = defaultVariants(
      "fixture-template",
      {
        bgGradient: "linear-gradient(165deg, #320b4d 0%, #1f0631 55%, #12031d 100%)",
        accentColor: "#d4af37",
        textColor: "#ffe18a",
      },
      "शाही"
    );
    expect(variants.length).toBe(4);
    const ids = variants.map((v) => v.id);
    expect(new Set(ids).size).toBe(4);
    for (const v of variants) {
      expect(isHexOrGradient(v.bg)).toBe(true);
      expect(isHexOrGradient(v.bgGradient)).toBe(true);
      expect(isHexOrGradient(v.accentColor)).toBe(true);
      expect(isHexOrGradient(v.textColor)).toBe(true);
    }
    expect(variants[0]?.foil).toBe("gold");
    expect(variants[0]?.bgGradient).toBe(
      "linear-gradient(165deg, #320b4d 0%, #1f0631 55%, #12031d 100%)"
    );
  });
  it("registerArt, getPrintArt and artVariants round-trip", () => {
    const id = "spec-helper-fixture";
    const spec: PrintArtSpec = {
      templateId: id,
      motif: "ganesha",
      border: "double-gold",
      layout: "center-crest",
      region: "maratha",
      photoPlacement: "top",
      variants: defaultVariants(
        id,
        {
          bgGradient: "linear-gradient(165deg, #320b4d 0%, #12031d 100%)",
          accentColor: "#d4af37",
          textColor: "#ffe18a",
        },
        "शाही"
      ),
    };
    registerArt({ [id]: spec });
    expect(getPrintArt(id)).toEqual(spec);
    expect(artVariants(id).length).toBeGreaterThanOrEqual(3);
    expect(getPrintArt("definitely-missing-id")).toBeUndefined();
    expect(artVariants("definitely-missing-id")).toEqual([]);
    delete ART_REGISTRY[id];
  });
});
