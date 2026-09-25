export type CardLang = 'mr' | 'en';

export const DEFAULT_LANG: CardLang = 'mr';
export const SUPPORTED_LANGS: readonly CardLang[] = ['mr', 'en'] as const;
export const PREF_LANG_COOKIE = 'mazi_lang';
export const PREF_LANG_STORAGE_KEY = 'mazi_preferred_lang';

/**
 * Parses any arbitrary value into a supported CardLang.
 * If the value is undefined, null, or any unsupported string,
 * it strictly returns the DEFAULT_LANG ('mr' - Marathi).
 */
export function parseCardLang(value: unknown): CardLang {
  return value === 'en' ? 'en' : 'mr';
}

/**
 * Resolves preferred language following strict precedence:
 * 1. Explicit query parameter ('mr' | 'en')
 * 2. Stored cookie preference ('mr' | 'en')
 * 3. Client localStorage preference ('mr' | 'en')
 * 4. Default fallback: 'mr' (Marathi)
 */
export function resolvePreferredLang(options?: {
  query?: unknown;
  cookie?: unknown;
  storage?: unknown;
}): CardLang {
  if (options?.query === 'en' || options?.query === 'mr') {
    return options.query;
  }
  if (options?.cookie === 'en' || options?.cookie === 'mr') {
    return options.cookie;
  }
  if (options?.storage === 'en' || options?.storage === 'mr') {
    return options.storage;
  }
  return DEFAULT_LANG;
}

export const onboardingCopy = {
  mr: {
    langLabel: 'भाषा प्राधान्य',
    langHint: 'डिफॉल्ट मराठी; आपण हवी असल्यास इंग्रजी निवडू शकता.',
    defaultBadge: 'डिफॉल्ट',
    createEventTitle: 'एका वाक्यात कार्यक्रम उभा करा',
    wizardPlaceholder: 'उदा. पुण्यात एप्रिल २०२७ मध्ये लग्न आहे, ६५० पाहुणे, बजेट १८ लाख…',
    tellAboutEvent: 'कार्यक्रमाबद्दल सांगा',
    generatePlan: 'नियोजन तयार करा',
    generating: 'नियोजन तयार होत आहे…',
    newRequest: 'नवीन विनंती',
    switchNotice: 'भाषा बदलली: मराठी',
  },
  en: {
    langLabel: 'Preferred Language',
    langHint: 'Default is Marathi; switch to English anytime.',
    defaultBadge: 'Default',
    createEventTitle: 'Plan your celebration in one sentence',
    wizardPlaceholder: 'e.g. Wedding in Pune in April 2027, 650 guests, budget 18 Lakhs…',
    tellAboutEvent: 'Tell us about your event',
    generatePlan: 'Create Plan',
    generating: 'Creating plan…',
    newRequest: 'New Request',
    switchNotice: 'Language changed: English',
  },
} as const;

export interface CardStrings {
  blessing: string;
  digitalNote: string;
  downloadSvg: string;
  muhuratTitle: string;
  agendaTitle: string;
  agendaWelcome: string;
  agendaRite: string;
  agendaReception: string;
  vendorsTitle: string;
  rsvpTitle: string;
  rsvpThanks: string;
  rsvpWhatsapp: string;
  rsvpDashboardNote: string;
  rsvpPrivacy: string;
  venueTitle: string;
  venueParking: string;
  openMap: string;
  rideTitle: string;
  rideUber: string;
  rideOla: string;
  rideRapido: string;
  helpTitle: string;
  helpItems: string[];
  safetyNote: string;
  printHubsTitle: string;
  printHubs: string[];
  printDoorstep: string;
  printHubsNote: string;
  shagunTitle: string;
  shagunZero: string;
  shagunPay: string;
  shagunReceipt: string;
  shagunLedger: string;
  platformTitle: string;
  createOwn: string;
  footerLine1: string;
  footerLine2: string;
}

export const cardCopy: Record<CardLang, CardStrings> = {
  mr: {
    blessing: '॥ श्री गणेशाय नमः ॥',
    digitalNote: 'पत्रिका डिजिटल स्वरूपात — छपाईची प्रत जशीच्या तशी.',
    downloadSvg: 'पत्रिका डाउनलोड करा (SVG) ↓',
    muhuratTitle: 'मुहूर्त व पंचांग',
    agendaTitle: 'कार्यक्रमाची मांडणी',
    agendaWelcome: 'स्वागत व नोंदणी',
    agendaRite: 'मुख्य विधी',
    agendaReception: 'स्वागत समारंभ व भोजन',
    vendorsTitle: 'सेवा देणारे',
    rsvpTitle: 'येण्याची खात्री कळवा',
    rsvpThanks: '॥ सहर्ष स्वागतम् ॥ धन्यवाद! तुमची नोंद झाली — भेटूया.',
    rsvpWhatsapp: 'व्हॉट्सअॅपवर कळवा',
    rsvpDashboardNote: 'फॉर्म भरल्यावर तुमची नोंद थेट यजमानांच्या डॅशबोर्डवर दिसते.',
    rsvpPrivacy: 'आम्ही फक्त नाव व ऐच्छिक मोबाइल क्रमांक घेतो — पाहुण्यांची यादी इतरांना दिसत नाही.',
    venueTitle: 'स्थळ व नकाशा',
    venueParking: 'घरगुती पत्ता — पार्किंगसाठी प्रवेशद्वारावर मार्गदर्शन आहे.',
    openMap: 'नकाशात उघडा →',
    rideTitle: 'रिक्षा / टॅक्सीने या',
    rideUber: 'Uber ने या',
    rideOla: 'Ola ने या',
    rideRapido: 'Rapido ने या',
    helpTitle: 'पाहुण्यांसाठी मदत',
    helpItems: [
      'निवास व्यवस्था हवी असल्यास कृपया आधी कळवा',
      'मुलांसाठी स्वतंत्र बैठक व्यवस्था आहे',
      'वाहन पार्किंग मोफत — प्रवेशद्वाराजवळ',
    ],
    safetyNote: 'डिजिटल पान सुरक्षित लिंक — हा दुवा कुटुंबियांनाच पाठवा. आम्ही कधीही आधार किंवा कार्ड माहिती मागत नाही.',
    printHubsTitle: 'प्रिंट केंद्र व घरपोच',
    printHubs: ['सदाशिव पेठ, पुणे', 'दादर, मुंबई', 'कोल्हापूर'],
    printDoorstep: 'घरपोच डिलिव्हरी — संपूर्ण महाराष्ट्रात',
    printHubsNote: 'छपाईची प्रत वरील SVG मधूनच जाते. केंद्रावर नाव सांगा व पत्रिका घ्या.',
    shagunTitle: 'आहेर',
    shagunZero: 'शून्य कमिशन — आहेर थेट कुटुंबाला जातो.',
    shagunPay: 'UPI ने आहेर द्या',
    shagunReceipt: 'आहेर दिल्यावर स्क्रीनशॉट कुटुंबाला पाठवा — तुमचे नाव आभारपत्रात येईल. धन्यवाद! ॥ सहर्ष स्वागतम् ॥',
    shagunLedger: 'प्लॅटफॉर्ममध्ये पैसे येत नाहीत — थेट कुटुंबाच्या UPI वर.',
    platformTitle: 'प्लॅटफॉर्म माहिती',
    createOwn: 'स्वतःची पत्रिका तयार करा →',
    footerLine1: 'माझी पत्रिका — मराठी कार्यक्रम व्यवस्थापन व छपाई प्लॅटफॉर्म',
    footerLine2: 'पंचांग गणना पारंपरिक पद्धतीने; अंतिम विधी-निर्णय कुटुंब व गुरुजींचा.',
  },
  en: {
    blessing: '॥ Shri Ganeshaya Namah ॥',
    digitalNote: 'Digital invitation — same as the printed copy.',
    downloadSvg: 'Download invitation (SVG) ↓',
    muhuratTitle: 'Muhurat & Panchang',
    agendaTitle: 'Event schedule',
    agendaWelcome: 'Welcome & registration',
    agendaRite: 'Main ceremony',
    agendaReception: 'Reception & dinner',
    vendorsTitle: 'Serving vendors',
    rsvpTitle: 'Confirm your presence',
    rsvpThanks: '॥ Saharsha Swagatam ॥ Thank you! Your reply is recorded — see you soon.',
    rsvpWhatsapp: 'Reply on WhatsApp',
    rsvpDashboardNote: 'Submitting the form updates the host dashboard directly.',
    rsvpPrivacy: 'We take only your name and optional mobile — the guest list stays private.',
    venueTitle: 'Venue & map',
    venueParking: 'Home address — guidance for parking at the entrance.',
    openMap: 'Open in Maps →',
    rideTitle: 'Come by taxi / rickshaw',
    rideUber: 'Go with Uber',
    rideOla: 'Go with Ola',
    rideRapido: 'Go with Rapido',
    helpTitle: 'Help for guests',
    helpItems: [
      'Tell us in advance if you need stay arrangements',
      'Separate seating is arranged for kids',
      'Free vehicle parking — near the entrance',
    ],
    safetyNote: 'Private digital link — share only with family. We never ask for Aadhaar or card details.',
    printHubsTitle: 'Print hubs & home delivery',
    printHubs: ['Sadashiv Peth, Pune', 'Dadar, Mumbai', 'Kolhapur'],
    printDoorstep: 'Doorstep delivery — across Maharashtra',
    printHubsNote: 'Print uses the same SVG above. Mention your name at the hub and collect.',
    shagunTitle: 'Shagun',
    shagunZero: 'Zero commission — shagun goes directly to the family.',
    shagunPay: 'Give shagun via UPI',
    shagunReceipt: 'After giving, send the screenshot to the family — your name will appear in the thank-you note. Thank you! ॥ Saharsha Swagatam ॥',
    shagunLedger: 'No money touches the platform — it goes to the family UPI directly.',
    platformTitle: 'Platform info',
    createOwn: 'Create your own invitation →',
    footerLine1: 'Mazi Patrika — Marathi event management & print platform',
    footerLine2: 'Panchang by traditional method; final rite decision rests with family and guruji.',
  },
};

export function getCardCopy(lang: CardLang): CardStrings {
  return cardCopy[lang];
}
