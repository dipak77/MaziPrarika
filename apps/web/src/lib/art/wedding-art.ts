import { defaultVariants, type PrintArtSpec } from "../print-art";
export const WEDDING_ART: Record<string, PrintArtSpec> = {
  "wedding-royal-purple-ganesh": {
    templateId: "wedding-royal-purple-ganesh",
    motif: "ganesha",
    border: "velvet-edge",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("wedding-royal-purple-ganesh", {
        bgGradient: "linear-gradient(168deg, #2d043a 0%, #1e0227 50%, #0e0114 100%)",
        accentColor: "#f5d061",
        textColor: "#fdf8ed",
      }, "शाही गणेश"),
    ],
  },
  "wedding-midnight-silver-ganesh": {
    templateId: "wedding-midnight-silver-ganesh",
    motif: "ganesha",
    border: "velvet-edge",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("wedding-midnight-silver-ganesh", {
        bgGradient: "linear-gradient(168deg, #071530 0%, #040d1e 50%, #02060f 100%)",
        accentColor: "#e2e8f0",
        textColor: "#fdf8ed",
      }, "मध्यरात्री गणेश"),
    ],
  },
  "wedding-emerald-gold-arch": {
    templateId: "wedding-emerald-gold-arch",
    motif: "ganesha",
    border: "velvet-edge",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("wedding-emerald-gold-arch", {
        bgGradient: "linear-gradient(168deg, #05261b 0%, #031710 50%, #010c08 100%)",
        accentColor: "#f5d061",
        textColor: "#fdf8ed",
      }, "पाचू कमान"),
    ],
  },
  "wedding-ruby-maroon-velvet": {
    templateId: "wedding-ruby-maroon-velvet",
    motif: "ganesha",
    border: "velvet-edge",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("wedding-ruby-maroon-velvet", {
        bgGradient: "linear-gradient(168deg, #360613 0%, #20030a 50%, #100104 100%)",
        accentColor: "#f5d061",
        textColor: "#fdf8ed",
      }, "किरमिजी"),
    ],
  },
  "wedding-obsidian-black-gold": {
    templateId: "wedding-obsidian-black-gold",
    motif: "ganesha",
    border: "velvet-edge",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("wedding-obsidian-black-gold", {
        bgGradient: "linear-gradient(168deg, #151318 0%, #0d0c10 50%, #060507 100%)",
        accentColor: "#f5d061",
        textColor: "#fdf8ed",
      }, "कृष्णवर्णी"),
    ],
  },
  "wedding-shadi-katyar-arch": {
    templateId: "wedding-shadi-katyar-arch",
    motif: "katyar",
    border: "arch-frame",
    layout: "arch-top-photo",
    region: "maratha",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("wedding-shadi-katyar-arch", {
        bgGradient: "linear-gradient(165deg, #450a12 0%, #2b050a 60%, #150205 100%)",
        accentColor: "#d4af37",
        textColor: "#fdf8ed",
      }, "कट्यार"),
    ],
  },
  "wedding-paithani-zari": {
    templateId: "wedding-paithani-zari",
    motif: "mandala",
    border: "paithani-band",
    layout: "center-crest",
    region: "maratha",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("wedding-paithani-zari", {
        bgGradient: "linear-gradient(170deg, #5c1420 0%, #430d15 55%, #2e070d 100%)",
        accentColor: "#f3e1a6",
        textColor: "#fdf8ed",
      }, "पैठणी"),
    ],
  },
  "wedding-royal-purple": {
    templateId: "wedding-royal-purple",
    motif: "crown",
    border: "velvet-edge",
    layout: "center-crest",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("wedding-royal-purple", {
        bgGradient: "linear-gradient(165deg, #320b4d 0%, #1f0631 55%, #12031d 100%)",
        accentColor: "#dfb150",
        textColor: "#fdf8ed",
      }, "शाही जांभळा"),
    ],
  },
  "wedding-temple-arch": {
    templateId: "wedding-temple-arch",
    motif: "arch",
    border: "arch-frame",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("wedding-temple-arch", {
        bgGradient: "linear-gradient(180deg, #420f18 0%, #29080e 55%, #170307 100%)",
        accentColor: "#fcedb8",
        textColor: "#fdf8ed",
      }, "मंदिर कमान"),
    ],
  },
  "wedding-midnight-navy": {
    templateId: "wedding-midnight-navy",
    motif: "crown",
    border: "double-gold",
    layout: "center-crest",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("wedding-midnight-navy", {
        bgGradient: "linear-gradient(170deg, #131a38 0%, #0c1126 55%, #060914 100%)",
        accentColor: "#f0e2bb",
        textColor: "#fdf8ed",
      }, "मध्यरात्री निळा"),
    ],
  },
  "wedding-heritage-maroon": {
    templateId: "wedding-heritage-maroon",
    motif: "paisley",
    border: "double-gold",
    layout: "center-crest",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("wedding-heritage-maroon", {
        bgGradient: "linear-gradient(165deg, #3d0912 0%, #25040a 55%, #140205 100%)",
        accentColor: "#f2dfa8",
        textColor: "#fdf8ed",
      }, "वारसा"),
    ],
  },
  "wedding-rajmudra-deep": {
    templateId: "wedding-rajmudra-deep",
    motif: "crown",
    border: "double-gold",
    layout: "center-crest",
    region: "maratha",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("wedding-rajmudra-deep", {
        bgGradient: "linear-gradient(170deg, #3b0912 0%, #24050b 55%, #120205 100%)",
        accentColor: "#d9b96c",
        textColor: "#fdf8ed",
      }, "राजमुद्रा"),
    ],
  },
  "wedding-shubhra-minimal": {
    templateId: "wedding-shubhra-minimal",
    motif: "lotus",
    border: "minimal-line",
    layout: "center-crest",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("wedding-shubhra-minimal", {
        bgGradient: "linear-gradient(160deg, #fdfbf7 0%, #f7f1e5 55%, #ece2cb 100%)",
        accentColor: "#85622a",
        textColor: "#85622a",
      }, "शुभ्र"),
    ],
  },
  "engagement-baroque-damask-gold": {
    templateId: "engagement-baroque-damask-gold",
    motif: "paisley",
    border: "zari-weave",
    layout: "side-photo",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("engagement-baroque-damask-gold", {
        bgGradient: "linear-gradient(165deg, #090707 0%, #151110 55%, #050404 100%)",
        accentColor: "#d4af37",
        textColor: "#fdf8ed",
      }, "दमास्क"),
    ],
  },
  "engagement-floral-couple": {
    templateId: "engagement-floral-couple",
    motif: "lotus",
    border: "floral-corner",
    layout: "side-photo",
    region: "universal",
    photoPlacement: "side",
    variants: [
      ...defaultVariants("engagement-floral-couple", {
        bgGradient: "linear-gradient(165deg, #451a08 0%, #2a0e04 55%, #170702 100%)",
        accentColor: "#f59e0b",
        textColor: "#fdf8ed",
      }, "पुष्प"),
    ],
  },
  "engagement-rings-velvet": {
    templateId: "engagement-rings-velvet",
    motif: "rings",
    border: "velvet-edge",
    layout: "framed-panel",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("engagement-rings-velvet", {
        bgGradient: "linear-gradient(175deg, #3d0716 0%, #20030a 55%, #100104 100%)",
        accentColor: "#fbbf24",
        textColor: "#fdf8ed",
      }, "अंगठी"),
    ],
  },
  "engagement-scroll-katyar": {
    templateId: "engagement-scroll-katyar",
    motif: "katyar",
    border: "double-gold",
    layout: "center-crest",
    region: "maratha",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("engagement-scroll-katyar", {
        bgGradient: "linear-gradient(165deg, #3d1b08 0%, #240f04 55%, #140702 100%)",
        accentColor: "#f59e0b",
        textColor: "#fdf8ed",
      }, "कट्यार"),
    ],
  },
  "engagement-emerald-glam": {
    templateId: "engagement-emerald-glam",
    motif: "peacock",
    border: "velvet-edge",
    layout: "framed-panel",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("engagement-emerald-glam", {
        bgGradient: "linear-gradient(170deg, #0b3322 0%, #061f14 55%, #020f0a 100%)",
        accentColor: "#34d399",
        textColor: "#fdf8ed",
      }, "पाचू"),
    ],
  },
  "engagement-blush-pearl": {
    templateId: "engagement-blush-pearl",
    motif: "lotus",
    border: "floral-corner",
    layout: "center-crest",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("engagement-blush-pearl", {
        bgGradient: "linear-gradient(160deg, #fff1f2 0%, #ffe4e6 55%, #fecdd3 100%)",
        accentColor: "#be123c",
        textColor: "#be123c",
      }, "गुलाबी मोती"),
    ],
  },
  "engagement-royal-indigo": {
    templateId: "engagement-royal-indigo",
    motif: "crown",
    border: "velvet-edge",
    layout: "framed-panel",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("engagement-royal-indigo", {
        bgGradient: "linear-gradient(170deg, #1e1b4b 0%, #0f172a 60%, #020617 100%)",
        accentColor: "#e0e7ff",
        textColor: "#fdf8ed",
      }, "शाही इंडिगो"),
    ],
  },
  "engagement-peach-blossom": {
    templateId: "engagement-peach-blossom",
    motif: "lotus",
    border: "minimal-line",
    layout: "side-photo",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("engagement-peach-blossom", {
        bgGradient: "linear-gradient(160deg, #fff7ed 0%, #ffedd5 55%, #fed7aa 100%)",
        accentColor: "#c2410c",
        textColor: "#c2410c",
      }, "पीच"),
    ],
  },
};
