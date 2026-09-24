/**
 * Vendor & marketplace vocabulary.
 *
 * Category keys are deliberately English in the data layer (stable ids for the
 * API, analytics and commission tables). Everything a customer or vendor reads
 * has to be Marathi, so the label map lives here — next to the rest of the
 * linguistic intelligence — rather than being duplicated in every screen.
 *
 * `@mazi/commerce` owns the canonical category list; this module keys off the
 * same strings without importing it (marathi stays dependency-free).
 */

export const VENDOR_CATEGORY_LABELS = {
  venue: 'विवाहस्थळ / मंगल कार्यालय',
  photographer: 'छायाचित्रकार',
  videographer: 'व्हिडिओग्राफर',
  decorator: 'सजावटकार',
  caterer: 'केटरर',
  printer: 'छपाईकार',
  makeup: 'मेकअप कलाकार',
  mehendi: 'मेहंदी कलाकार',
  dj: 'डीजे',
  sound: 'ध्वनिसंयोजन',
  cake: 'केक कलाकार',
  florist: 'फुलकार',
  priest: 'गुरुजी / भटजी',
  transport: 'वाहन व्यवस्था',
  invitation: 'निमंत्रण कार्ड',
  bhangra: 'ढोल-ताशा पथक',
  anchor: 'सूत्रसंचालक',
  tent: 'मंडप व तंबू',
  lighting: 'प्रकाशयोजना',
  security: 'सुरक्षा व्यवस्था',
  accommodation: 'निवास व्यवस्था',
  planner: 'कार्यक्रम नियोजक',
  choreographer: 'नृत्य दिग्दर्शक',
  gifting: 'भेटवस्तू',
  other: 'इतर सेवा',
} as const;

export type VendorCategoryKey = keyof typeof VENDOR_CATEGORY_LABELS;

/** Never throws: unknown categories degrade to the raw key, not to "undefined". */
export function vendorCategoryLabel(category: string): string {
  return VENDOR_CATEGORY_LABELS[category as VendorCategoryKey] ?? category;
}

export const VENDOR_CATEGORY_SHORT: Partial<Record<VendorCategoryKey, string>> = {
  venue: 'कार्यालय',
  photographer: 'छायाचित्रण',
  videographer: 'व्हिडिओ',
  decorator: 'सजावट',
  caterer: 'केटरिंग',
  printer: 'छपाई',
  priest: 'भटजी',
  bhangra: 'ढोल-ताशा',
  accommodation: 'निवास',
};

/** Trust signals shown on vendor cards — each one maps to stored evidence. */
export const VENDOR_TRUST_LABELS = {
  'identity-verified': 'ओळख पडताळली',
  'gst-verified': 'जीएसटी पडताळला',
  'response-fast': '२ तासांत प्रतिसाद',
  'response-ok': 'दिवसभरात प्रतिसाद',
  'top-rated': 'उच्च गुणवत्ता',
  experienced: 'अनुभवी',
  'calendar-fresh': 'कॅलेंडर अद्ययावत',
  'no-disputes': 'तक्रारमुक्त',
  sponsored: 'प्रायोजित',
} as const;

export const BOOKING_STATE_LABELS: Record<string, string> = {
  ENQUIRY: 'चौकशी',
  QUOTED: 'कोट दिला',
  AWAITING_ADVANCE: 'आगाऊ रकमेची प्रतीक्षा',
  CONFIRMED: 'निश्चित',
  IN_PROGRESS: 'सुरू',
  COMPLETED: 'पूर्ण',
  CANCELLED: 'रद्द',
  REFUNDED: 'परतावा झाला',
  DISPUTED: 'तक्रार चालू',
  SETTLED: 'विक्रेत्यास देय दिले',
};

export function bookingStateLabel(state: string): string {
  return BOOKING_STATE_LABELS[state] ?? state;
}

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'नवीन',
  viewed: 'पाहिले',
  responded: 'प्रतिसाद दिला',
  quoting: 'कोट तयार होत आहे',
  quoted: 'कोट आला',
  won: 'निश्चित',
  lost: 'गमावले',
  expired: 'मुदत संपली',
};

export function leadStatusLabel(status: string): string {
  return LEAD_STATUS_LABELS[status] ?? status;
}

export const RSVP_LABELS: Record<string, string> = {
  yes: 'येतील',
  no: 'येणार नाहीत',
  maybe: 'कदाचित',
  pending: 'प्रतीक्षेत',
};

export const PRINT_ORDER_STATE_LABELS: Record<string, string> = {
  placed: 'ऑर्डर दिली',
  proofing: 'प्रूफ तयार',
  approved: 'प्रूफ मंजूर',
  printing: 'छपाई चालू',
  dispatched: 'पाठवले',
  delivered: 'पोहोचले',
  cancelled: 'रद्द',
};

export const PRINT_PAPER_LABELS: Record<string, string> = {
  'matte-300gsm': 'मॅट ३०० जीएसएम',
  'silk-350gsm': 'सिल्क ३५० जीएसएम',
  'metallic-250gsm': 'मेटॅलिक २५० जीएसएम',
  'textured-cotton-300gsm': 'कॉटन टेक्सचर ३०० जीएसएम',
  'pearl-300gsm': 'पर्ल ३०० जीएसएम',
};

export const PRINT_FINISHING_LABELS: Record<string, string> = {
  'gold-foil': 'सोनेरी फॉइल',
  'silver-foil': 'चांदीची फॉइल',
  emboss: 'उठाव (एम्बॉस)',
  deboss: 'खोल उठाव',
  'spot-uv': 'स्पॉट यूव्ही',
  'die-cut': 'डाय-कट',
  'laser-cut': 'लेसर कट',
  'round-corner': 'गोल कोपरे',
  ribbon: 'रिबन',
  'insert-card': 'आतील कार्ड',
  envelope: 'लिफाफा',
  waxseal: 'मेणमुद्रा',
};

/** Marathi label for any of the above maps, with a safe fallback. */
export function vocabularyLabel(map: Record<string, string>, key: string): string {
  return map[key] ?? key;
}
