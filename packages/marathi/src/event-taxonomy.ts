/**
 * Event taxonomy — the cultural spine of the product.
 *
 * Every event type carries: Marathi naming, planning phases (with day offsets),
 * a budget template, ritual checklist and puja samagri. The Event OS, the
 * Readiness Score, the AI planner and the invitation composer all read from
 * this single source of truth, so the platform reasons about "गृहप्रवेश" the
 * same way everywhere.
 */

export type EventTypeKey =
  | 'wedding' | 'engagement' | 'sakharpuda' | 'haldi' | 'sangeet' | 'reception'
  | 'birthday' | 'naming' | 'annaprashan' | 'mundan' | 'thread'
  | 'gruhapravesh' | 'satyanarayan' | 'ganpati' | 'navratri' | 'bhoomipujan' | 'punyatithi'
  | 'corporate' | 'school' | 'community' | 'other';

export type EventCategory = 'wedding' | 'family' | 'ritual' | 'celebration' | 'institutional';

export interface BudgetLineTemplate {
  category: BudgetCategoryKey;
  label: string;
  /** Share of the total budget (weights are normalised at generation time). */
  weight: number;
  note?: string;
}

export type BudgetCategoryKey =
  | 'venue' | 'catering' | 'decoration' | 'photography' | 'videography' | 'clothing'
  | 'makeup' | 'mehndi' | 'printing' | 'music' | 'transport' | 'puja' | 'gifts'
  | 'accommodation' | 'entertainment' | 'staff' | 'misc';

export interface PlanPhase {
  /** Human label: "१२ महिने आधी" */
  label: string;
  /** Days before the event date at which the phase opens. */
  daysBefore: number;
  tasks: Array<{ title: string; owner?: 'family' | 'vendor' | 'both'; critical?: boolean }>;
}

export interface EventTypeSpec {
  key: EventTypeKey;
  /** Marathi label used everywhere in the UI. */
  label: string;
  englishLabel: string;
  category: EventCategory;
  /** Emoji used in zero-weight UI chrome only (never in print artefacts). */
  glyph: string;
  defaultGuestCount: number;
  defaultDurationHours: number;
  /** Preferred start window, 24h local time. */
  typicalStartHour: number;
  muhuratSensitive: boolean;
  requiresRitual: boolean;
  invitation: {
    invocation: 'ganesh' | 'kuldevta' | 'shree' | 'none';
    headline: string;
    subheadline?: string;
  };
  budgetTemplate: BudgetLineTemplate[];
  phases: PlanPhase[];
  samagri?: string[];
  /** Weight multipliers used by the Readiness Score. */
  readiness: Partial<Record<ReadinessDimension, number>>;
}

export type ReadinessDimension =
  | 'venue' | 'catering' | 'decoration' | 'photography' | 'invitations'
  | 'guests' | 'budget' | 'ritual' | 'transport' | 'attire' | 'music' | 'print';

/** Not-weighted-by-default -> sharing helper. */
const budgetShare = (rows: Array<[BudgetCategoryKey, string, number, string?]>): BudgetLineTemplate[] =>
  rows.map(([category, label, weight, note]) => ({ category, label, weight, ...(note ? { note } : {}) }));

const WEDDING_PHASES: PlanPhase[] = [
  {
    label: '१२ महिने आधी',
    daysBefore: 365,
    tasks: [
      { title: 'मुहूर्त ठरवा — जोशी/पंचांग सल्ला', owner: 'family', critical: true },
      { title: 'अंदाजे पाहुण्यांची संख्या ठरवा', owner: 'family' },
      { title: 'एकूण बजेट व वाटप निश्चित करा', owner: 'family', critical: true },
      { title: 'वधू-वर दोन्ही कुटुंबांची प्राथमिक बैठक', owner: 'family' },
      { title: 'मंगल कार्यालय / लॉन पाहणी सुरू करा', owner: 'family' },
    ],
  },
  {
    label: '६ महिने आधी',
    daysBefore: 180,
    tasks: [
      { title: 'विवाहस्थळ बुक करा व करारनामा घ्या', owner: 'family', critical: true },
      { title: 'छायाचित्रकार व व्हिडिओ टीम बुक करा', owner: 'vendor', critical: true },
      { title: 'केटरिंग चव पाहणी (tasting) करा', owner: 'family' },
      { title: 'सजावट संकल्पना ठरवा', owner: 'vendor' },
      { title: 'लग्नकार्ड डिझाइन व छपाई सुरू', owner: 'both' },
    ],
  },
  {
    label: '३ महिने आधी',
    daysBefore: 90,
    tasks: [
      { title: 'पत्रिका छपाई पूर्ण करा', owner: 'vendor', critical: true },
      { title: 'पाहुण्यांची यादी सर्व कुटुंबांकडून गोळा करा', owner: 'family' },
      { title: 'हळदी/संगीत/मेहंदी कार्यक्रम ठरवा', owner: 'family' },
      { title: 'वधू-वर वस्त्र व दागिने निवड', owner: 'family' },
      { title: 'राहण्याची व्यवस्था (बाहेरगावचे पाहुणे)', owner: 'family' },
    ],
  },
  {
    label: '१ महिना आधी',
    daysBefore: 30,
    tasks: [
      { title: 'Patrika वेबसाइट प्रकाशित करा व दुवा पाठवा', owner: 'family', critical: true },
      { title: 'मुख्य कार्यक्रमाचा तासनिश्चित कार्यक्रम बनवा', owner: 'family' },
      { title: 'पूजा साहित्य व गुरुजी निश्चिती', owner: 'family' },
      { title: 'केटरिंग अंतिम कोट व मेनू निश्चिती', owner: 'vendor' },
      { title: 'वाहन व वाहतूक व्यवस्था', owner: 'family' },
    ],
  },
  {
    label: '१ आठवडा आधी',
    daysBefore: 7,
    tasks: [
      { title: 'RSVP आकडेवारी अंतिम करा', owner: 'family', critical: true },
      { title: 'पाहुण्यांना आठवण फोन/व्हॉट्सअ‍ॅप', owner: 'family' },
      { title: 'Payments व उर्वरित देयक तपासा', owner: 'family' },
      { title: 'स्वयंसेवक व कर्मचारी वाटप', owner: 'both' },
    ],
  },
  {
    label: 'कार्यक्रमाच्या दिवशी',
    daysBefore: 1,
    tasks: [
      { title: 'स्थळ तपासणी व सजावट अंतिम', owner: 'vendor' },
      { title: 'छायाचित्रकार/व्हिडिओ संघ तपासणी', owner: 'vendor' },
      { title: 'गुरुजी व पूजा साहित्य तयारी', owner: 'family' },
      { title: 'आपत्कालीन संपर्क यादी तयार', owner: 'family' },
    ],
  },
];

const SHORT_EVENT_PHASES: PlanPhase[] = [
  {
    label: '३० दिवस आधी',
    daysBefore: 30,
    tasks: [
      { title: 'दिनांक व मुहूर्त निश्चित करा', owner: 'family', critical: true },
      { title: 'बजेट निश्चित करा', owner: 'family' },
      { title: 'स्थळ/घर सजावट नियोजन', owner: 'family' },
      { title: 'विशेष कार्यक्रम (पूजा/भोजन) ठरवा', owner: 'family' },
    ],
  },
  {
    label: '१५ दिवस आधी',
    daysBefore: 15,
    tasks: [
      { title: 'निमंत्रण पत्रिका तयार व पाठवा', owner: 'both', critical: true },
      { title: 'पाहुण्यांची यादी अंतिम करा', owner: 'family' },
      { title: 'केटरिंग/प्रसाद ऑर्डर', owner: 'vendor' },
    ],
  },
  {
    label: '३ दिवस आधी',
    daysBefore: 3,
    tasks: [
      { title: 'RSVP आकडेवारी व कोट अंतिम', owner: 'family', critical: true },
      { title: 'पूजा साहित्य व गुरुजी निश्चिती', owner: 'family' },
      { title: 'सजावट साहित्य खरेदी', owner: 'vendor' },
    ],
  },
  {
    label: 'कार्यक्रमाच्या दिवशी',
    daysBefore: 1,
    tasks: [
      { title: 'सजावट व आसन व्यवस्था', owner: 'vendor' },
      { title: 'प्रसाद/भोजन तयारी समन्वय', owner: 'vendor' },
      { title: 'छायाचित्रण व्यवस्था', owner: 'family' },
    ],
  },
];

const PUJA_SAMAGRI_WEDDING = [
  'कलश व नारळ', 'तांदूळ (अक्षता)', 'हळद', 'कुंकू', 'गंध (चंदन)', 'अगरबत्ती व धूप',
  'पंचामृत (दूध, दही, तूप, मध, साखर)', 'फुले व हार', 'पान-सुपारी व सुपारी', 'केळी व फळे',
  'तूप व तिळ', 'वस्त्र व उपरणे', 'हळदीचे लोणचे? (ऐच्छिक)', 'मंगळसूत्र व लग्न साहित्य',
  'सप्तपदी साहित्य', 'ओटी साहित्य', 'गंगाजळ', 'स्वस्तिक व रांगोळी',
];

const PUJA_SAMAGRI_GRUHA = [
  'वास्तुशांती पुस्तिका', 'कलश व नारळ', 'तांदूळ, हळद, कुंकू', 'गंध व अत्तर',
  'पंचामृत', 'गंगाजळ', 'नवीन कलश, तांबेरा व तांडेल', 'हळदीचे मुटके',
  'दारातील बंधन व कडुले', 'दूध उकळण्यासाठी भांडे व दूध', 'गोड धान्य (साखर/गूळ)',
  'अगरबत्ती, धूप, पणती', 'पाच प्रकारची फळे', 'हवन साहित्य (समिधा, तूप, होम सामग्री)',
];

const PUJA_SAMAGRI_SATYANARAYAN = [
  'श्री सत्यनारायण पूजा पुस्तिका', 'श्रीफळ व नारळ', 'तांदूळ (अक्षता), हळद, कुंकू',
  'गंध, अगरबत्ती, धूप, पणती', 'पंचामृत व गंगाजळ', 'सुपारी व नागवेलीचे पान',
  'केळीचे घड व तुळस', 'गूळ, तूप, मध, दही, दूध', 'हवन साहित्य व समिधा',
  'वस्त्र व उपरणे', 'प्रसाद व शिरा साहित्य', 'रांगोळी व फुलांची सजावट',
];

export const EVENT_TYPES: Record<EventTypeKey, EventTypeSpec> = {
  wedding: {
    key: 'wedding',
    label: 'विवाह',
    englishLabel: 'Wedding',
    category: 'wedding',
    glyph: '💍',
    defaultGuestCount: 400,
    defaultDurationHours: 8,
    typicalStartHour: 10,
    muhuratSensitive: true,
    requiresRitual: true,
    invitation: { invocation: 'ganesh', headline: '॥ शुभ विवाह ॥', subheadline: 'श्री गणेशाय नमः' },
    budgetTemplate: budgetShare([
      ['venue', 'विवाहस्थळ / मंगल कार्यालय', 30, 'सजावट व आसन व्यवस्था वगळून'],
      ['catering', 'भोजन व केटरिंग', 25],
      ['decoration', 'सजावट व फुलांची सजावट', 10],
      ['photography', 'छायाचित्रण', 6],
      ['videography', 'व्हिडिओ व सिनेमॅटिक रील', 4],
      ['clothing', 'वधू-वर वस्त्र', 6],
      ['makeup', 'मेकअप व हेअरस्टाइल', 3],
      ['mehndi', 'मेहंदी', 2],
      ['printing', 'पत्रिका डिझाइन व छपाई', 2],
      ['music', 'वादक, ढोल-ताशा, DJ', 4],
      ['transport', 'वाहन व वाहतूक', 2],
      ['puja', 'गुरुजी व पूजा साहित्य', 2],
      ['accommodation', 'बाहेरगावच्या पाहुण्यांची व्यवस्था', 2],
      ['misc', 'इतर व अनपेक्षित खर्च', 2],
    ]),
    phases: WEDDING_PHASES,
    samagri: PUJA_SAMAGRI_WEDDING,
    readiness: { venue: 3, catering: 3, photography: 2, decoration: 1, invitations: 2, guests: 2, budget: 1, ritual: 2, attire: 1, music: 1 },
  },
  engagement: {
    key: 'engagement',
    label: 'साखरपुडा',
    englishLabel: 'Engagement',
    category: 'wedding',
    glyph: '🤝',
    defaultGuestCount: 80,
    defaultDurationHours: 4,
    typicalStartHour: 11,
    muhuratSensitive: true,
    requiresRitual: true,
    invitation: { invocation: 'ganesh', headline: '॥ साखरपुडा समारंभ ॥', subheadline: 'शुभ मंगल पर्व' },
    budgetTemplate: budgetShare([
      ['catering', 'भोजन', 40], ['venue', 'स्थळ / घर सजावट', 20],
      ['decoration', 'सजावट', 12], ['photography', 'छायाचित्रण', 10],
      ['printing', 'पत्रिका', 3], ['gifts', 'साखर व उपहार', 10], ['misc', 'इतर', 5],
    ]),
    phases: SHORT_EVENT_PHASES,
    samagri: ['साखर', 'श्रीफळ', 'हळद-कुंकू', 'पान-सुपारी', 'फुले', 'गोड धान्य', 'वस्त्र व उपरणे'],
    readiness: { venue: 2, catering: 3, photography: 2, invitations: 3, guests: 2, budget: 1, ritual: 2 },
  },
  sakharpuda: {
    key: 'sakharpuda',
    label: 'साखरपुडा (घरगुती)',
    englishLabel: 'Sakharpuda (family)',
    category: 'wedding',
    glyph: '🥮',
    defaultGuestCount: 40,
    defaultDurationHours: 2,
    typicalStartHour: 11,
    muhuratSensitive: true,
    requiresRitual: true,
    invitation: { invocation: 'ganesh', headline: '॥ साखरपुडा ॥', subheadline: 'शुभ मंगल पर्व' },
    budgetTemplate: budgetShare([
      ['catering', 'भोजन व मिष्टान्न', 45], ['decoration', 'घर सजावट', 20],
      ['photography', 'छायाचित्रण', 15], ['printing', 'पत्रिका', 5], ['gifts', 'उपहार', 10], ['misc', 'इतर', 5],
    ]),
    phases: SHORT_EVENT_PHASES,
    samagri: ['साखर', 'श्रीफळ', 'हळद-कुंकू', 'पान-सुपारी', 'फुले'],
    readiness: { catering: 3, decoration: 2, photography: 1, invitations: 3, guests: 2, ritual: 2, budget: 1 },
  },
  haldi: {
    key: 'haldi',
    label: 'हळदी समारंभ',
    englishLabel: 'Haldi',
    category: 'wedding',
    glyph: '💛',
    defaultGuestCount: 100,
    defaultDurationHours: 3,
    typicalStartHour: 11,
    muhuratSensitive: false,
    requiresRitual: true,
    invitation: { invocation: 'shree', headline: '॥ हळदी समारंभ ॥' },
    budgetTemplate: budgetShare([
      ['catering', 'भोजन', 35], ['decoration', 'फुलांची सजावट', 25],
      ['photography', 'छायाचित्रण', 15], ['music', 'ढोलकी व वादक', 15], ['misc', 'हळद व साहित्य', 10],
    ]),
    phases: SHORT_EVENT_PHASES,
    samagri: ['हळद', 'कुंकू', 'गंध', 'फुलांची वाटी', 'उटणे', 'गोड धान्य'],
    readiness: { catering: 2, decoration: 2, photography: 1, invitations: 2, guests: 1, music: 1, budget: 1 },
  },
  sangeet: {
    key: 'sangeet',
    label: 'संगीत समारंभ',
    englishLabel: 'Sangeet',
    category: 'wedding',
    glyph: '🎶',
    defaultGuestCount: 200,
    defaultDurationHours: 4,
    typicalStartHour: 19,
    muhuratSensitive: false,
    requiresRitual: false,
    invitation: { invocation: 'none', headline: '॥ संगीत समारंभ ॥' },
    budgetTemplate: budgetShare([
      ['venue', 'स्थळ', 25], ['catering', 'भोजन', 30], ['decoration', 'स्टेज व सजावट', 20],
      ['music', 'DJ, साऊंड व लायटिंग', 15], ['photography', 'छायाचित्रण व व्हिडिओ', 10],
    ]),
    phases: SHORT_EVENT_PHASES,
    readiness: { venue: 2, catering: 3, decoration: 2, music: 3, invitations: 2, guests: 2, budget: 1 },
  },
  reception: {
    key: 'reception',
    label: 'स्वागत समारंभ',
    englishLabel: 'Reception',
    category: 'wedding',
    glyph: '✨',
    defaultGuestCount: 300,
    defaultDurationHours: 4,
    typicalStartHour: 19,
    muhuratSensitive: false,
    requiresRitual: false,
    invitation: { invocation: 'none', headline: '॥ स्वागत समारंभ ॥' },
    budgetTemplate: budgetShare([
      ['venue', 'स्थळ', 35], ['catering', 'भोजन', 30],
      ['decoration', 'सजावट व स्टेज', 15], ['photography', 'छायाचित्रण', 10],
      ['music', 'संगीत व लायटिंग', 10],
    ]),
    phases: SHORT_EVENT_PHASES,
    readiness: { venue: 3, catering: 3, decoration: 1, photography: 1, invitations: 2, guests: 2, budget: 1 },
  },
  birthday: {
    key: 'birthday',
    label: 'वाढदिवस',
    englishLabel: 'Birthday',
    category: 'celebration',
    glyph: '🎂',
    defaultGuestCount: 50,
    defaultDurationHours: 3,
    typicalStartHour: 18,
    muhuratSensitive: false,
    requiresRitual: false,
    invitation: { invocation: 'ganesh', headline: '॥ वाढदिवसाच्या हार्दिक शुभेच्छा ॥' },
    budgetTemplate: budgetShare([
      ['catering', 'भोजन व केक', 35], ['venue', 'स्थळ / घर सजावट', 25],
      ['decoration', 'बलून व थीम सजावट', 15], ['photography', 'छायाचित्रण', 10],
      ['entertainment', 'खेळ व मनोरंजन', 7], ['gifts', 'भेटवस्तू व परतीच्या भेटी', 5],
      ['printing', 'निमंत्रण', 3],
    ]),
    phases: SHORT_EVENT_PHASES,
    readiness: { catering: 2, decoration: 2, invitations: 3, guests: 2, photography: 1, budget: 1, print: 1 },
  },
  naming: {
    key: 'naming',
    label: 'नामकरण संस्कार',
    englishLabel: 'Naming ceremony',
    category: 'ritual',
    glyph: '👶',
    defaultGuestCount: 60,
    defaultDurationHours: 3,
    typicalStartHour: 9,
    muhuratSensitive: true,
    requiresRitual: true,
    invitation: { invocation: 'ganesh', headline: '॥ नामकरण संस्कार ॥' },
    budgetTemplate: budgetShare([
      ['catering', 'भोजन व प्रसाद', 40], ['puja', 'गुरुजी व पूजा साहित्य', 15],
      ['decoration', 'सजावट', 15], ['photography', 'छायाचित्रण', 10],
      ['printing', 'पत्रिका', 5], ['gifts', 'उपहार', 10], ['misc', 'इतर', 5],
    ]),
    phases: SHORT_EVENT_PHASES,
    samagri: ['कलश व नारळ', 'अक्षता, हळद, कुंकू', 'गंध व पणती', 'पंचामृत', 'हळदीचा मुटका', 'पाळणा सजावट', 'वस्त्र'],
    readiness: { catering: 2, ritual: 3, decoration: 1, invitations: 3, guests: 2, photography: 1, budget: 1 },
  },
  annaprashan: {
    key: 'annaprashan',
    label: 'अन्नप्राशन',
    englishLabel: 'Annaprashan (first feeding)',
    category: 'ritual',
    glyph: '🍚',
    defaultGuestCount: 40,
    defaultDurationHours: 2,
    typicalStartHour: 9,
    muhuratSensitive: true,
    requiresRitual: true,
    invitation: { invocation: 'ganesh', headline: '॥ अन्नप्राशन संस्कार ॥' },
    budgetTemplate: budgetShare([
      ['catering', 'भोजन व खीर', 45], ['puja', 'गुरुजी व साहित्य', 20],
      ['decoration', 'सजावट', 20], ['photography', 'छायाचित्रण', 15],
    ]),
    phases: SHORT_EVENT_PHASES,
    samagri: ['खीर साहित्य', 'सोन्याचे कंगवा/वाटी', 'अक्षता व हळद-कुंकू', 'गंध व पणती', 'पंचामृत'],
    readiness: { catering: 2, ritual: 3, decoration: 1, invitations: 3, guests: 2, budget: 1 },
  },
  mundan: {
    key: 'mundan',
    label: 'जावळ काढणे',
    englishLabel: 'First haircut',
    category: 'ritual',
    glyph: '✂️',
    defaultGuestCount: 40,
    defaultDurationHours: 2,
    typicalStartHour: 9,
    muhuratSensitive: true,
    requiresRitual: true,
    invitation: { invocation: 'ganesh', headline: '॥ जावळ काढण्याचा विधी ॥' },
    budgetTemplate: budgetShare([
      ['catering', 'भोजन व प्रसाद', 45], ['puja', 'गुरुजी व साहित्य', 20],
      ['decoration', 'सजावट', 15], ['photography', 'छायाचित्रण', 15], ['misc', 'इतर', 5],
    ]),
    phases: SHORT_EVENT_PHASES,
    samagri: ['कलश व नारळ', 'अक्षता, हळद, कुंकू', 'पणती व गंध', 'नवीन वस्त्र'],
    readiness: { catering: 2, ritual: 3, invitations: 3, guests: 2, photography: 1, budget: 1 },
  },
  thread: {
    key: 'thread',
    label: 'उपनयन संस्कार (मुंज)',
    englishLabel: 'Thread ceremony',
    category: 'ritual',
    glyph: '🧵',
    defaultGuestCount: 120,
    defaultDurationHours: 5,
    typicalStartHour: 8,
    muhuratSensitive: true,
    requiresRitual: true,
    invitation: { invocation: 'ganesh', headline: '॥ उपनयन संस्कार ॥' },
    budgetTemplate: budgetShare([
      ['catering', 'भोजन', 40], ['puja', 'गुरुजी व साहित्य', 15],
      ['venue', 'स्थळ', 15], ['decoration', 'सजावट', 10],
      ['photography', 'छायाचित्रण', 10], ['clothing', 'वस्त्र', 5], ['misc', 'इतर', 5],
    ]),
    phases: SHORT_EVENT_PHASES,
    samagri: ['जानवे व उपरणे', 'कलश व नारळ', 'हवन साहित्य', 'अक्षता, हळद, कुंकू', 'दर्भ व कुश', 'पंचामृत'],
    readiness: { catering: 2, ritual: 3, venue: 2, invitations: 3, guests: 2, attire: 1, budget: 1 },
  },
  gruhapravesh: {
    key: 'gruhapravesh',
    label: 'गृहप्रवेश',
    englishLabel: 'House warming',
    category: 'ritual',
    glyph: '🏡',
    defaultGuestCount: 100,
    defaultDurationHours: 4,
    typicalStartHour: 9,
    muhuratSensitive: true,
    requiresRitual: true,
    invitation: { invocation: 'ganesh', headline: '॥ वास्तुशांती व गृहप्रवेश ॥' },
    budgetTemplate: budgetShare([
      ['catering', 'भोजन व प्रसाद', 40], ['puja', 'गुरुजी व वास्तुशांती साहित्य', 15],
      ['decoration', 'घर व फुलांची सजावट', 12], ['photography', 'छायाचित्रण', 8],
      ['printing', 'निमंत्रण', 5], ['gifts', 'उपहार व मिष्टान्न', 10], ['misc', 'इतर', 10],
    ]),
    phases: SHORT_EVENT_PHASES,
    samagri: PUJA_SAMAGRI_GRUHA,
    readiness: { catering: 2, ritual: 3, decoration: 1, invitations: 3, guests: 2, budget: 1 },
  },
  satyanarayan: {
    key: 'satyanarayan',
    label: 'सत्यनारायण महापूजा',
    englishLabel: 'Satyanarayan Puja',
    category: 'ritual',
    glyph: '🪔',
    defaultGuestCount: 50,
    defaultDurationHours: 3,
    typicalStartHour: 10,
    muhuratSensitive: true,
    requiresRitual: true,
    invitation: { invocation: 'ganesh', headline: '॥ श्री सत्यनारायण महापूजा ॥' },
    budgetTemplate: budgetShare([
      ['catering', 'प्रसाद व भोजन', 45], ['puja', 'गुरुजी व पूजा साहित्य', 25],
      ['decoration', 'पूजा सजावट व फुले', 15], ['printing', 'निमंत्रण', 5], ['misc', 'इतर', 10],
    ]),
    phases: SHORT_EVENT_PHASES,
    samagri: PUJA_SAMAGRI_SATYANARAYAN,
    readiness: { catering: 2, ritual: 3, decoration: 1, invitations: 3, guests: 2, budget: 1 },
  },
  ganpati: {
    key: 'ganpati',
    label: 'श्री गणेश स्थापना',
    englishLabel: 'Ganesh Sthapana',
    category: 'ritual',
    glyph: '🐘',
    defaultGuestCount: 80,
    defaultDurationHours: 3,
    typicalStartHour: 8,
    muhuratSensitive: true,
    requiresRitual: true,
    invitation: { invocation: 'ganesh', headline: '॥ श्री गणेश स्थापना ॥' },
    budgetTemplate: budgetShare([
      ['decoration', 'मंडप व सजावट', 25], ['catering', 'प्रसाद व भोजन', 30],
      ['puja', 'पूजा साहित्य व गुरुजी', 15], ['music', 'ढोल-ताशा व आरती', 15],
      ['photography', 'छायाचित्रण', 10], ['misc', 'इतर', 5],
    ]),
    phases: SHORT_EVENT_PHASES,
    samagri: ['मूर्ती', 'कलश व नारळ', 'अक्षता, हळद, कुंकू', 'दुर्वा व फुले', 'पंचामृत', 'आरती साहित्य', 'मोदक साहित्य'],
    readiness: { decoration: 3, catering: 2, ritual: 3, music: 1, invitations: 2, guests: 2, budget: 1 },
  },
  navratri: {
    key: 'navratri',
    label: 'नवरात्र उत्सव',
    englishLabel: 'Navratri',
    category: 'ritual',
    glyph: '🌺',
    defaultGuestCount: 150,
    defaultDurationHours: 4,
    typicalStartHour: 19,
    muhuratSensitive: false,
    requiresRitual: true,
    invitation: { invocation: 'shree', headline: '॥ नवरात्र उत्सव ॥' },
    budgetTemplate: budgetShare([
      ['decoration', 'मंडप व सजावट', 30], ['catering', 'प्रसाद व भोजन', 30],
      ['music', 'गरबा/ढोल व साऊंड', 20], ['puja', 'पूजा साहित्य', 10], ['photography', 'छायाचित्रण', 10],
    ]),
    phases: SHORT_EVENT_PHASES,
    readiness: { decoration: 3, catering: 2, music: 2, ritual: 2, invitations: 2, guests: 2, budget: 1 },
  },
  bhoomipujan: {
    key: 'bhoomipujan',
    label: 'भूमिपूजन',
    englishLabel: 'Ground breaking puja',
    category: 'ritual',
    glyph: '🚧',
    defaultGuestCount: 50,
    defaultDurationHours: 2,
    typicalStartHour: 8,
    muhuratSensitive: true,
    requiresRitual: true,
    invitation: { invocation: 'ganesh', headline: '॥ भूमिपूजन विधी ॥' },
    budgetTemplate: budgetShare([
      ['puja', 'गुरुजी व साहित्य', 35], ['catering', 'प्रसाद', 30],
      ['decoration', 'सजावट', 20], ['photography', 'छायाचित्रण', 15],
    ]),
    phases: SHORT_EVENT_PHASES,
    samagri: ['हळद, कुंकू, अक्षता', 'कलश व नारळ', 'सोने-चांदीचा फाळ', 'वास्तु देवता पूजा साहित्य', 'गंध व पणती'],
    readiness: { ritual: 3, catering: 2, decoration: 1, invitations: 3, guests: 2, budget: 1 },
  },
  punyatithi: {
    key: 'punyatithi',
    label: 'पुण्यतिथी / श्राद्ध विधी',
    englishLabel: 'Memorial ritual',
    category: 'ritual',
    glyph: '🕉️',
    defaultGuestCount: 40,
    defaultDurationHours: 3,
    typicalStartHour: 9,
    muhuratSensitive: true,
    requiresRitual: true,
    invitation: { invocation: 'shree', headline: '॥ पुण्यतिथी स्मरण ॥' },
    budgetTemplate: budgetShare([
      ['puja', 'विधी व ब्राह्मण भोजन', 40], ['catering', 'भोजन', 35],
      ['decoration', 'सजावट', 10], ['misc', 'दान व इतर', 15],
    ]),
    phases: SHORT_EVENT_PHASES,
    samagri: ['तिळ व तूप', 'काळे तिळ', 'दान साहित्य', 'पुण्यतिथी पुस्तिका', 'पिंड साहित्य'],
    readiness: { ritual: 3, catering: 3, invitations: 3, guests: 2, budget: 1 },
  },
  corporate: {
    key: 'corporate',
    label: 'कॉर्पोरेट कार्यक्रम',
    englishLabel: 'Corporate event',
    category: 'institutional',
    glyph: '🏢',
    defaultGuestCount: 200,
    defaultDurationHours: 5,
    typicalStartHour: 10,
    muhuratSensitive: false,
    requiresRitual: false,
    invitation: { invocation: 'none', headline: 'कार्यक्रमाचे निमंत्रण' },
    budgetTemplate: budgetShare([
      ['venue', 'स्थळ व हॉल', 35], ['catering', 'भोजन', 25],
      ['staff', 'आयोजन व कर्मचारी', 15], ['entertainment', 'सादरीकरण / स्पीकर', 10],
      ['photography', 'छायाचित्रण व व्हिडिओ', 8], ['printing', 'मुद्रण व निमंत्रण', 7],
    ]),
    phases: SHORT_EVENT_PHASES,
    readiness: { venue: 3, catering: 3, invitations: 2, guests: 3, budget: 2, print: 1 },
  },
  school: {
    key: 'school',
    label: 'शाळा / महाविद्यालय कार्यक्रम',
    englishLabel: 'School / college event',
    category: 'institutional',
    glyph: '🎓',
    defaultGuestCount: 300,
    defaultDurationHours: 4,
    typicalStartHour: 9,
    muhuratSensitive: false,
    requiresRitual: false,
    invitation: { invocation: 'shree', headline: 'कार्यक्रमाचे निमंत्रण' },
    budgetTemplate: budgetShare([
      ['venue', 'हॉल व मंच', 30], ['catering', 'अल्पोपहार', 25],
      ['decoration', 'सजावट', 15], ['printing', 'मुद्रण', 10],
      ['music', 'साऊंड व सिस्टम', 10], ['gifts', 'बक्षिसे', 10],
    ]),
    phases: SHORT_EVENT_PHASES,
    readiness: { venue: 3, catering: 2, invitations: 2, guests: 3, budget: 2 },
  },
  community: {
    key: 'community',
    label: 'सामाजिक / सांस्कृतिक कार्यक्रम',
    englishLabel: 'Community event',
    category: 'institutional',
    glyph: '🎪',
    defaultGuestCount: 250,
    defaultDurationHours: 5,
    typicalStartHour: 17,
    muhuratSensitive: false,
    requiresRitual: false,
    invitation: { invocation: 'shree', headline: 'स्नेहसंमेलन' },
    budgetTemplate: budgetShare([
      ['venue', 'मंडप व स्थळ', 30], ['catering', 'भोजन', 30],
      ['music', 'सांस्कृतिक कार्यक्रम व साऊंड', 15], ['decoration', 'सजावट', 15],
      ['printing', 'प्रचार व मुद्रण', 10],
    ]),
    phases: SHORT_EVENT_PHASES,
    readiness: { venue: 3, catering: 3, invitations: 2, guests: 3, budget: 2, music: 1 },
  },
  other: {
    key: 'other',
    label: 'इतर कार्यक्रम',
    englishLabel: 'Other event',
    category: 'celebration',
    glyph: '📅',
    defaultGuestCount: 50,
    defaultDurationHours: 3,
    typicalStartHour: 18,
    muhuratSensitive: false,
    requiresRitual: false,
    invitation: { invocation: 'shree', headline: 'निमंत्रण पत्रिका' },
    budgetTemplate: budgetShare([
      ['venue', 'स्थळ', 30], ['catering', 'भोजन', 30], ['decoration', 'सजावट', 20], ['misc', 'इतर', 20],
    ]),
    phases: SHORT_EVENT_PHASES,
    readiness: { venue: 2, catering: 2, invitations: 2, guests: 2, budget: 2 },
  },
};

export const EVENT_TYPE_LIST: EventTypeSpec[] = Object.values(EVENT_TYPES);

export function getEventType(key: string): EventTypeSpec {
  return EVENT_TYPES[key as EventTypeKey] ?? EVENT_TYPES.other;
}

/** Grouped for pickers: "लग्नकार्य", "धार्मिक विधी", "उत्सव", "संस्थात्मक". */
export const EVENT_TYPE_GROUPS: Array<{ label: string; keys: EventTypeKey[] }> = [
  { label: 'लग्नकार्य', keys: ['wedding', 'engagement', 'sakharpuda', 'haldi', 'sangeet', 'reception'] },
  { label: 'धार्मिक विधी', keys: ['gruhapravesh', 'satyanarayan', 'naming', 'annaprashan', 'mundan', 'thread', 'bhoomipujan', 'ganpati', 'navratri', 'punyatithi'] },
  { label: 'उत्सव', keys: ['birthday', 'other'] },
  { label: 'संस्थात्मक', keys: ['corporate', 'school', 'community'] },
];

/** Normalise a budget template to a target total. */
export function budgetFromTemplate(
  key: EventTypeKey,
  totalBudget: number,
): Array<{ category: BudgetCategoryKey; label: string; estimated: number; note?: string }> {
  const spec = getEventType(key);
  const weightSum = spec.budgetTemplate.reduce((sum, line) => sum + line.weight, 0) || 1;
  return spec.budgetTemplate.map((line) => ({
    category: line.category,
    label: line.label,
    estimated: Math.round((totalBudget * line.weight) / weightSum / 100) * 100,
    ...(line.note ? { note: line.note } : {}),
  }));
}

/** Flatten the phase plan into a dated task list for the Event OS. */
export function planFromTemplate(
  key: EventTypeKey,
  eventDate: Date | string,
): Array<{ title: string; dueDate: string; phase: string; critical: boolean; owner?: string }> {
  const spec = getEventType(key);
  const date = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
  const out: Array<{ title: string; dueDate: string; phase: string; critical: boolean; owner?: string }> = [];
  for (const phase of spec.phases) {
    const due = new Date(date.getTime() - phase.daysBefore * 86_400_000);
    for (const task of phase.tasks) {
      out.push({
        title: task.title,
        dueDate: due.toISOString().slice(0, 10),
        phase: phase.label,
        critical: Boolean(task.critical),
        ...(task.owner ? { owner: task.owner } : {}),
      });
    }
  }
  return out;
}
