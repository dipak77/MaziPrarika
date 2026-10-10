import { defaultVariants, type PrintArtSpec } from "../print-art";
export const LAGN_ART: Record<string, PrintArtSpec> = {
  "lagn-floral-ivory": {
    templateId: "lagn-floral-ivory",
    motif: "lotus",
    border: "floral-corner",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-floral-ivory", {
        bgGradient: "linear-gradient(165deg, #fffaf3 0%, #f6e7d4 55%, #e7d3b4 100%)",
        accentColor: "#9a3412",
        textColor: "#431407",
      }, "शुभविवाह"),
    ],
  },
  "lagn-leaf-tutari": {
    templateId: "lagn-leaf-tutari",
    motif: "toran",
    border: "toran-top",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-leaf-tutari", {
        bgGradient: "linear-gradient(180deg, #fffdf8 0%, #f3e6cf 100%)",
        accentColor: "#b45309",
        textColor: "#431407",
      }, "शुभविवाह"),
    ],
  },
  "lagn-arch-dhol": {
    templateId: "lagn-arch-dhol",
    motif: "arch",
    border: "arch-frame",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-arch-dhol", {
        bgGradient: "linear-gradient(180deg, #fff7ed 0%, #fde7c7 40%, #7f1d1d 100%)",
        accentColor: "#9f1239",
        textColor: "#fff7ed",
      }, "शुभविवाह"),
    ],
  },
  "lagn-peacock-vivaah": {
    templateId: "lagn-peacock-vivaah",
    motif: "peacock",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-peacock-vivaah", {
        bgGradient: "linear-gradient(168deg, #3b0764 0%, #1e1b4b 55%, #0f172a 100%)",
        accentColor: "#f5d061",
        textColor: "#fef3c7",
      }, "शुभविवाह"),
    ],
  },
  "lagn-maratha-katyar-motya": {
    templateId: "lagn-maratha-katyar-motya",
    motif: "katyar",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "maratha",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-maratha-katyar-motya", {
        bgGradient: "linear-gradient(165deg, #1c1917 0%, #3e1b17 50%, #1c1917 100%)",
        accentColor: "#fbbf24",
        textColor: "#fef3c7",
      }, "शाही विवाह"),
    ],
  },
  "lagn-garden-wave": {
    templateId: "lagn-garden-wave",
    motif: "lotus",
    border: "floral-corner",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-garden-wave", {
        bgGradient: "linear-gradient(90deg, #14532d 0%, #fffaf3 45%, #f5d0fe 100%)",
        accentColor: "#b91c1c",
        textColor: "#1c1917",
      }, "शुभविवाह"),
    ],
  },
  "lagn-mayur-feather-salve": {
    templateId: "lagn-mayur-feather-salve",
    motif: "peacock",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-mayur-feather-salve", {
        bgGradient: "linear-gradient(180deg, #7f1d1d 0%, #fffaf3 35%, #fffaf3 100%)",
        accentColor: "#991b1b",
        textColor: "#7f1d1d",
      }, "शुभविवाह"),
    ],
  },
  "lagn-rajmahal-mandap": {
    templateId: "lagn-rajmahal-mandap",
    motif: "arch",
    border: "velvet-edge",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-rajmahal-mandap", {
        bgGradient: "linear-gradient(180deg, #fef3c7 0%, #fffbeb 50%, #d97706 100%)",
        accentColor: "#b45309",
        textColor: "#451a03",
      }, "शुभविवाह"),
    ],
  },
  "lagn-baudha-neel": {
    templateId: "lagn-baudha-neel",
    motif: "lotus",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "baudha",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-baudha-neel", {
        bgGradient: "linear-gradient(168deg, #1e3a8a 0%, #172554 60%, #0f172a 100%)",
        accentColor: "#60a5fa",
        textColor: "#eff6ff",
      }, "मंगलपरिणय"),
    ],
  },
  "lagn-baudha-jambhla": {
    templateId: "lagn-baudha-jambhla",
    motif: "lotus",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "baudha",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-baudha-jambhla", {
        bgGradient: "linear-gradient(180deg, #4c1d95 0%, #2e1065 100%)",
        accentColor: "#c084fc",
        textColor: "#f5f3ff",
      }, "मंगलपरिणय"),
    ],
  },
  "lagn-baudha-bal-chandra": {
    templateId: "lagn-baudha-bal-chandra",
    motif: "lotus",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "baudha",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-baudha-bal-chandra", {
        bgGradient: "linear-gradient(180deg, #eff6ff 0%, #dbeafe 60%, #1e3a8a 100%)",
        accentColor: "#1d4ed8",
        textColor: "#eff6ff",
      }, "मंगलपरिणय"),
    ],
  },
  "lagn-baudha-navdampati-photo": {
    templateId: "lagn-baudha-navdampati-photo",
    motif: "toran",
    border: "double-gold",
    layout: "side-photo",
    region: "baudha",
    photoPlacement: "side",
    variants: [
      ...defaultVariants("lagn-baudha-navdampati-photo", {
        bgGradient: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        accentColor: "#38bdf8",
        textColor: "#f1f5f9",
      }, "मंगलपरिणय"),
    ],
  },
  "lagn-couple-arch": {
    templateId: "lagn-couple-arch",
    motif: "arch",
    border: "arch-frame",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-couple-arch", {
        bgGradient: "linear-gradient(90deg, #fff7ed 0%, #fdba74 100%)",
        accentColor: "#c2410c",
        textColor: "#431407",
      }, "साखरपुडा"),
    ],
  },
  "lagn-sakharpuda-soneri": {
    templateId: "lagn-sakharpuda-soneri",
    motif: "rings",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-sakharpuda-soneri", {
        bgGradient: "linear-gradient(165deg, #1c1917 0%, #44403c 50%, #1c1917 100%)",
        accentColor: "#fbbf24",
        textColor: "#fef3c7",
      }, "साखरपुडा"),
    ],
  },
  "lagn-sakharpuda-emerald": {
    templateId: "lagn-sakharpuda-emerald",
    motif: "rings",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-sakharpuda-emerald", {
        bgGradient: "linear-gradient(180deg, #064e3b 0%, #022c22 100%)",
        accentColor: "#d1fae5",
        textColor: "#ecfdf5",
      }, "साखरपुडा"),
    ],
  },
  "lagn-sakharpuda-pushpa": {
    templateId: "lagn-sakharpuda-pushpa",
    motif: "rings",
    border: "floral-corner",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-sakharpuda-pushpa", {
        bgGradient: "linear-gradient(180deg, #ffedd5 0%, #fdba74 100%)",
        accentColor: "#9a3412",
        textColor: "#431407",
      }, "साखरपुडा"),
    ],
  },
  "lagn-sakharpuda-wine-diamond": {
    templateId: "lagn-sakharpuda-wine-diamond",
    motif: "rings",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-sakharpuda-wine-diamond", {
        bgGradient: "linear-gradient(180deg, #831843 0%, #fff1f2 40%, #831843 100%)",
        accentColor: "#9d174d",
        textColor: "#fff1f2",
      }, "साखरपुडा"),
    ],
  },
  "lagn-ganesh-aagman": {
    templateId: "lagn-ganesh-aagman",
    motif: "ganesha",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "shakta",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-ganesh-aagman", {
        bgGradient: "linear-gradient(180deg, #7f1d1d 0%, #fff7ed 42%, #fff7ed 100%)",
        accentColor: "#9d174d",
        textColor: "#7f1d1d",
      }, "गणेश आगमन"),
    ],
  },
  "lagn-ganesh-darshan": {
    templateId: "lagn-ganesh-darshan",
    motif: "ganesha",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "shakta",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-ganesh-darshan", {
        bgGradient: "linear-gradient(160deg, #fffdf8 0%, #f5e6c8 70%, #4a044e 100%)",
        accentColor: "#7c2d12",
        textColor: "#fffbeb",
      }, "गणेश दर्शन"),
    ],
  },
  "lagn-ganpati-morya": {
    templateId: "lagn-ganpati-morya",
    motif: "ganesha",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "shakta",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-ganpati-morya", {
        bgGradient: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)",
        accentColor: "#92400e",
        textColor: "#451a03",
      }, "गणपती मोरया"),
    ],
  },
  "lagn-ganesh-chaturthi-midnight": {
    templateId: "lagn-ganesh-chaturthi-midnight",
    motif: "ganesha",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "shakta",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-ganesh-chaturthi-midnight", {
        bgGradient: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
        accentColor: "#fde68a",
        textColor: "#fef3c7",
      }, "गणेश चतुर्थी"),
    ],
  },
  "lagn-ganesh-chaturthi-gold": {
    templateId: "lagn-ganesh-chaturthi-gold",
    motif: "ganesha",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "shakta",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-ganesh-chaturthi-gold", {
        bgGradient: "linear-gradient(180deg, #fef3c7 0%, #fbbf24 100%)",
        accentColor: "#b91c1c",
        textColor: "#451a03",
      }, "गणेश चतुर्थी"),
    ],
  },
  "lagn-satyanarayan-mandap-pillars": {
    templateId: "lagn-satyanarayan-mandap-pillars",
    motif: "arch",
    border: "arch-frame",
    layout: "arch-top-photo",
    region: "shakta",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-satyanarayan-mandap-pillars", {
        bgGradient: "linear-gradient(180deg, #fef3c7 0%, #d6d3d1 40%, #14532d 100%)",
        accentColor: "#9a3412",
        textColor: "#fefce8",
      }, "सत्यनारायण"),
    ],
  },
  "lagn-satyanarayan-kalash-toran": {
    templateId: "lagn-satyanarayan-kalash-toran",
    motif: "kalash",
    border: "toran-top",
    layout: "arch-top-photo",
    region: "shakta",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-satyanarayan-kalash-toran", {
        bgGradient: "linear-gradient(180deg, #fffbeb 0%, #fde68a 55%, #166534 100%)",
        accentColor: "#b45309",
        textColor: "#fefce8",
      }, "सत्यनारायण"),
    ],
  },
  "lagn-satyanarayan-kalash-blank": {
    templateId: "lagn-satyanarayan-kalash-blank",
    motif: "kalash",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "shakta",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-satyanarayan-kalash-blank", {
        bgGradient: "linear-gradient(180deg, #fffdf8 0%, #fef3c7 60%, #15803d 100%)",
        accentColor: "#b45309",
        textColor: "#fefce8",
      }, "सत्यनारायण"),
    ],
  },
  "lagn-vastushanti-bungalow": {
    templateId: "lagn-vastushanti-bungalow",
    motif: "kalash",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-vastushanti-bungalow", {
        bgGradient: "linear-gradient(180deg, #064e3b 0%, #f0fdf4 38%, #ffffff 100%)",
        accentColor: "#047857",
        textColor: "#064e3b",
      }, "वास्तुशांती"),
    ],
  },
  "lagn-vastushanti-sunburst": {
    templateId: "lagn-vastushanti-sunburst",
    motif: "kalash",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-vastushanti-sunburst", {
        bgGradient: "linear-gradient(180deg, #be123c 0%, #fff1f2 38%, #fff1f2 100%)",
        accentColor: "#be123c",
        textColor: "#7f1d1d",
      }, "वास्तुशांती"),
    ],
  },
  "lagn-gauri-pujan": {
    templateId: "lagn-gauri-pujan",
    motif: "lotus",
    border: "paithani-band",
    layout: "arch-top-photo",
    region: "shakta",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-gauri-pujan", {
        bgGradient: "linear-gradient(180deg, #701a75 0%, #fdf4ff 45%, #701a75 100%)",
        accentColor: "#a21caf",
        textColor: "#fdf4ff",
      }, "गौरी पूजन"),
    ],
  },
  "lagn-krishna-janmashtami-makhan": {
    templateId: "lagn-krishna-janmashtami-makhan",
    motif: "peacock",
    border: "double-gold",
    layout: "arch-top-photo",
    region: "vaishnav",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-krishna-janmashtami-makhan", {
        bgGradient: "linear-gradient(180deg, #1e3a8a 0%, #fffbeb 40%, #1e3a8a 100%)",
        accentColor: "#1d4ed8",
        textColor: "#eff6ff",
      }, "जन्माष्टमी"),
    ],
  },
  "lagn-royal-mandap-grand": {
    templateId: "lagn-royal-mandap-grand",
    motif: "arch",
    border: "velvet-edge",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-royal-mandap-grand", {
        bgGradient: "linear-gradient(168deg, #fffbeb 0%, #fef3c7 45%, #b45309 100%)",
        accentColor: "#9a3412",
        textColor: "#fffbeb",
      }, "शाही विवाह"),
    ],
  },
  "lagn-heritage-golden-arch": {
    templateId: "lagn-heritage-golden-arch",
    motif: "arch",
    border: "arch-frame",
    layout: "arch-top-photo",
    region: "universal",
    photoPlacement: "top",
    variants: [
      ...defaultVariants("lagn-heritage-golden-arch", {
        bgGradient: "linear-gradient(180deg, #fffaf3 0%, #fdf2f8 50%, #7c2d12 100%)",
        accentColor: "#b45309",
        textColor: "#fff7ed",
      }, "शुभविवाह"),
    ],
  },
};
