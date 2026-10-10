import { defaultVariants, type PrintArtSpec } from "../print-art";
export const PUJA_ART: Record<string, PrintArtSpec> = {
  "puja-krishna-janmashtami": {
    templateId: "puja-krishna-janmashtami",
    motif: "peacock",
    border: "toran-top",
    layout: "center-crest",
    region: "vaishnav",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("puja-krishna-janmashtami", {
        bgGradient: "linear-gradient(175deg, #fffbeb 0%, #fef3c7 40%, #0f172a 100%)",
        accentColor: "#0284c7",
        textColor: "#fdf8ed",
      }, "कृष्ण"),
    ],
  },
  "puja-satyanarayan-kalash": {
    templateId: "puja-satyanarayan-kalash",
    motif: "kalash",
    border: "toran-top",
    layout: "center-crest",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("puja-satyanarayan-kalash", {
        bgGradient: "linear-gradient(165deg, #451a03 0%, #290e02 55%, #150601 100%)",
        accentColor: "#f59e0b",
        textColor: "#fdf8ed",
      }, "मंगल"),
    ],
  },
  "puja-ganesh-utsav": {
    templateId: "puja-ganesh-utsav",
    motif: "ganesha",
    border: "toran-top",
    layout: "center-crest",
    region: "shakta",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("puja-ganesh-utsav", {
        bgGradient: "linear-gradient(170deg, #4a0404 0%, #2e0202 55%, #170101 100%)",
        accentColor: "#ef4444",
        textColor: "#fdf8ed",
      }, "गणेश"),
    ],
  },
  "puja-navratri-durga": {
    templateId: "puja-navratri-durga",
    motif: "lotus",
    border: "toran-top",
    layout: "center-crest",
    region: "shakta",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("puja-navratri-durga", {
        bgGradient: "linear-gradient(165deg, #3b0764 0%, #1e0338 55%, #0d0118 100%)",
        accentColor: "#c084fc",
        textColor: "#fdf8ed",
      }, "देवी"),
    ],
  },
  "puja-rudrabhishek-shiva": {
    templateId: "puja-rudrabhishek-shiva",
    motif: "om",
    border: "toran-top",
    layout: "center-crest",
    region: "shakta",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("puja-rudrabhishek-shiva", {
        bgGradient: "linear-gradient(170deg, #0f172a 0%, #020617 60%, #000000 100%)",
        accentColor: "#38bdf8",
        textColor: "#fdf8ed",
      }, "शिव"),
    ],
  },
  "puja-vastushanti-havan": {
    templateId: "puja-vastushanti-havan",
    motif: "kalash",
    border: "toran-top",
    layout: "center-crest",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("puja-vastushanti-havan", {
        bgGradient: "linear-gradient(165deg, #451a03 0%, #2c0e01 55%, #140500 100%)",
        accentColor: "#f97316",
        textColor: "#fdf8ed",
      }, "वास्तू"),
    ],
  },
  "puja-dattatreya-utsav": {
    templateId: "puja-dattatreya-utsav",
    motif: "lotus",
    border: "toran-top",
    layout: "center-crest",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("puja-dattatreya-utsav", {
        bgGradient: "linear-gradient(170deg, #3f2008 0%, #241103 55%, #100601 100%)",
        accentColor: "#eab308",
        textColor: "#fdf8ed",
      }, "दत्त"),
    ],
  },
  "gruh-toran-dwar": {
    templateId: "gruh-toran-dwar",
    motif: "toran",
    border: "toran-top",
    layout: "center-crest",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("gruh-toran-dwar", {
        bgGradient: "linear-gradient(165deg, #451508 0%, #2c0b03 55%, #150401 100%)",
        accentColor: "#f59e0b",
        textColor: "#fdf8ed",
      }, "तोरण"),
    ],
  },
  "gruh-laxmi-paduka": {
    templateId: "gruh-laxmi-paduka",
    motif: "lotus",
    border: "toran-top",
    layout: "center-crest",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("gruh-laxmi-paduka", {
        bgGradient: "linear-gradient(170deg, #3d0912 0%, #240409 55%, #120104 100%)",
        accentColor: "#fbbf24",
        textColor: "#fdf8ed",
      }, "लक्ष्मी"),
    ],
  },
  "gruh-modern-terrace": {
    templateId: "gruh-modern-terrace",
    motif: "diya",
    border: "minimal-line",
    layout: "top-band",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("gruh-modern-terrace", {
        bgGradient: "linear-gradient(170deg, #1c1917 0%, #0c0a09 60%, #000000 100%)",
        accentColor: "#e7e5e4",
        textColor: "#fdf8ed",
      }, "आधुनिक"),
    ],
  },
  "gruh-traditional-brass": {
    templateId: "gruh-traditional-brass",
    motif: "diya",
    border: "double-gold",
    layout: "center-crest",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("gruh-traditional-brass", {
        bgGradient: "linear-gradient(165deg, #421203 0%, #290901 55%, #130300 100%)",
        accentColor: "#fde047",
        textColor: "#fdf8ed",
      }, "समई"),
    ],
  },
  "gruh-ivory-lotus": {
    templateId: "gruh-ivory-lotus",
    motif: "lotus",
    border: "floral-corner",
    layout: "center-crest",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("gruh-ivory-lotus", {
        bgGradient: "linear-gradient(160deg, #fdfbf7 0%, #f5efe6 55%, #e8dcce 100%)",
        accentColor: "#92400e",
        textColor: "#3f2a14",
      }, "कमळ"),
    ],
  },
  "gruh-shubh-arambh": {
    templateId: "gruh-shubh-arambh",
    motif: "swastik",
    border: "toran-top",
    layout: "center-crest",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("gruh-shubh-arambh", {
        bgGradient: "linear-gradient(165deg, #430d15 0%, #28060c 55%, #120104 100%)",
        accentColor: "#fde047",
        textColor: "#fdf8ed",
      }, "शुभ"),
    ],
  },
  "biodata-royal-purple": {
    templateId: "biodata-royal-purple",
    motif: "crown",
    border: "double-gold",
    layout: "framed-panel",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("biodata-royal-purple", {
        bgGradient: "linear-gradient(165deg, #320b4d 0%, #1f0631 55%, #12031d 100%)",
        accentColor: "#d4af37",
        textColor: "#fdf8ed",
      }, "शाही"),
    ],
  },
  "biodata-burgundy-damask": {
    templateId: "biodata-burgundy-damask",
    motif: "crown",
    border: "zari-weave",
    layout: "framed-panel",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("biodata-burgundy-damask", {
        bgGradient: "linear-gradient(170deg, #430d15 0%, #2e070d 60%, #1c0307 100%)",
        accentColor: "#e6cf92",
        textColor: "#fdf8ed",
      }, "किरमिजी"),
    ],
  },
  "biodata-temple-portal": {
    templateId: "biodata-temple-portal",
    motif: "arch",
    border: "arch-frame",
    layout: "framed-panel",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("biodata-temple-portal", {
        bgGradient: "linear-gradient(180deg, #420f18 0%, #29080e 55%, #170307 100%)",
        accentColor: "#f3e1a6",
        textColor: "#fdf8ed",
      }, "मंदिर"),
    ],
  },
  "biodata-midnight-navy": {
    templateId: "biodata-midnight-navy",
    motif: "om",
    border: "double-gold",
    layout: "framed-panel",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("biodata-midnight-navy", {
        bgGradient: "linear-gradient(170deg, #131a38 0%, #0c1126 55%, #060914 100%)",
        accentColor: "#f0e2bb",
        textColor: "#fdf8ed",
      }, "नील"),
    ],
  },
  "biodata-heritage-maroon": {
    templateId: "biodata-heritage-maroon",
    motif: "katyar",
    border: "double-gold",
    layout: "framed-panel",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("biodata-heritage-maroon", {
        bgGradient: "linear-gradient(165deg, #3d0912 0%, #25040a 55%, #140205 100%)",
        accentColor: "#f2dfa8",
        textColor: "#fdf8ed",
      }, "हेरिटेज"),
    ],
  },
  "biodata-emerald-regal": {
    templateId: "biodata-emerald-regal",
    motif: "peacock",
    border: "double-gold",
    layout: "framed-panel",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("biodata-emerald-regal", {
        bgGradient: "linear-gradient(170deg, #064e3b 0%, #022c22 60%, #011913 100%)",
        accentColor: "#34d399",
        textColor: "#fdf8ed",
      }, "पाचू"),
    ],
  },
  "biodata-ivory-executive": {
    templateId: "biodata-ivory-executive",
    motif: "divider",
    border: "floral-corner",
    layout: "framed-panel",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("biodata-ivory-executive", {
        bgGradient: "linear-gradient(160deg, #fdfbf7 0%, #f6efe3 55%, #ede1cc 100%)",
        accentColor: "#92400e",
        textColor: "#3f2a14",
      }, "शुभ्र"),
    ],
  },
  "biodata-saffron-vedic": {
    templateId: "biodata-saffron-vedic",
    motif: "om",
    border: "double-gold",
    layout: "framed-panel",
    region: "universal",
    photoPlacement: "none",
    variants: [
      ...defaultVariants("biodata-saffron-vedic", {
        bgGradient: "linear-gradient(165deg, #7c2d12 0%, #431407 55%, #1c0602 100%)",
        accentColor: "#fdba74",
        textColor: "#fdf8ed",
      }, "भगवा"),
    ],
  },
};
