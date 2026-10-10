export type ArtMotif = "ganesha" | "toran" | "kalash" | "mandala" | "katyar" | "peacock" | "lotus" | "divider" | "arch" | "diya" | "paisley" | "om" | "swastik" | "crown" | "rings" | "cradle" | "star" | "balloon" | "cake";
export type ArtBorder = "double-gold" | "paithani-band" | "arch-frame" | "floral-corner" | "velvet-edge" | "minimal-line" | "toran-top" | "zari-weave";
export type ArtLayout = "arch-top-photo" | "side-photo" | "center-crest" | "full-bleed-photo" | "top-band" | "framed-panel";
export type ArtFoil = "gold" | "rosegold" | "silver" | "copper";
export type ArtRegion = "maratha" | "baudha" | "vaishnav" | "shakta" | "universal";
export interface ArtVariant {
  id: string;
  labelMr: string;
  foil: ArtFoil;
  bg: string;
  bgGradient: string;
  accentColor: string;
  textColor: string;
}
export interface PrintArtSpec {
  templateId: string;
  motif: ArtMotif;
  border: ArtBorder;
  layout: ArtLayout;
  region: ArtRegion;
  photoPlacement: "top" | "side" | "center" | "none";
  variants: ArtVariant[];
}
export const ART_REGISTRY: Record<string, PrintArtSpec> = {};
export function registerArt(map: Record<string, PrintArtSpec>): void {
  for (const key of Object.keys(map)) {
    const spec = map[key];
    if (spec) {
      ART_REGISTRY[key] = spec;
    }
  }
}
export function getPrintArt(templateId: string): PrintArtSpec | undefined {
  return ART_REGISTRY[templateId];
}
export function artVariants(templateId: string): ArtVariant[] {
  return ART_REGISTRY[templateId]?.variants ?? [];
}
export type RegionalText = { blessingHi?: string; blessingEn?: string; titleHi?: string; titleEn?: string };
const REGIONAL: Record<string, RegionalText> = {};
export function registerRegionalText(map: Record<string, RegionalText>): void {
  for (const key of Object.keys(map)) {
    const entry = map[key];
    if (entry) {
      REGIONAL[key] = entry;
    }
  }
}
export function artText(
  templateId: string,
  lang: "mr" | "hi" | "en",
  blessing: string,
  title: string
): { blessing: string; title: string } {
  if (lang === "mr") {
    return { blessing, title };
  }
  const entry = REGIONAL[templateId];
  if (!entry) {
    return { blessing, title };
  }
  if (lang === "hi") {
    return { blessing: entry.blessingHi ?? blessing, title: entry.titleHi ?? title };
  }
  return { blessing: entry.blessingEn ?? blessing, title: entry.titleEn ?? title };
}
export const FOIL_HEX: Record<ArtFoil, { bright: string; deep: string; soft: string }> = {
  gold: { bright: "#d4af37", deep: "#8a6a2b", soft: "#c6a15b" },
  rosegold: { bright: "#e8c4c4", deep: "#8a4b52", soft: "#b76e79" },
  silver: { bright: "#e8eaed", deep: "#6b7280", soft: "#9aa3ad" },
  copper: { bright: "#e8b07c", deep: "#7c4a1e", soft: "#b87333" },
};
export function defaultVariants(
  templateId: string,
  base: { bgGradient: string; accentColor: string; textColor: string },
  labelMrPrefix: string
): ArtVariant[] {
  return [
    {
      id: `${templateId}-soneri`,
      labelMr: `${labelMrPrefix} सोनेरी`,
      foil: "gold",
      bg: "#2b0a0f",
      bgGradient: base.bgGradient,
      accentColor: base.accentColor,
      textColor: base.textColor,
    },
    {
      id: `${templateId}-gulabi`,
      labelMr: `${labelMrPrefix} गुलाबी`,
      foil: "rosegold",
      bg: "#2b1015",
      bgGradient: "linear-gradient(165deg, #3a0f1a 0%, #1f060c 60%, #120309 100%)",
      accentColor: "#e8c4c4",
      textColor: "#ffe4e6",
    },
    {
      id: `${templateId}-ruperi`,
      labelMr: `${labelMrPrefix} रुपेरी`,
      foil: "silver",
      bg: "#101318",
      bgGradient: "linear-gradient(165deg, #1c2230 0%, #0e1219 60%, #07090d 100%)",
      accentColor: "#e8eaed",
      textColor: "#f1f5f9",
    },
    {
      id: `${templateId}-tamrapat`,
      labelMr: `${labelMrPrefix} ताम्र`,
      foil: "copper",
      bg: "#241105",
      bgGradient: "linear-gradient(165deg, #3a1c07 0%, #1f0e04 60%, #100702 100%)",
      accentColor: "#e8b07c",
      textColor: "#fdeed3",
    },
  ];
}
import { FAMILY_ART } from "./art/family-art";
import { LAGN_ART } from "./art/lagn-art";
import { PUJA_ART } from "./art/puja-art";
import { REGIONAL_TEXT } from "./art/regional-text";
import { WEDDING_ART } from "./art/wedding-art";
registerArt(WEDDING_ART);
registerArt(PUJA_ART);
registerArt(FAMILY_ART);
registerArt(LAGN_ART);
registerRegionalText(REGIONAL_TEXT);
