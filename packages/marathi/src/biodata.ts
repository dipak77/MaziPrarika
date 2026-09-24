/**
 * Biodata (वैवाहिक माहिती पत्रक) composer.
 *
 * PRODUCT BOUNDARY: Mazi Patrika builds *private, share-by-link* biodata
 * documents. There is deliberately no public search, discovery or profile
 * browsing — the platform starts AFTER the decision is made and never becomes
 * a matrimony marketplace.
 */

import { formatMarathiDate } from './datetime.js';
import { formatPersonName, type Person } from './person.js';
import { toDevanagariDigits, formatMarathiCurrency } from './numerals.js';

export interface FamilyMemberLine {
  /** Marathi relation label: "वडील", "आई", "भाऊ (थोरले)". */
  relation: string;
  name: string;
  occupation?: string;
  note?: string;
}

export interface BiodataInput {
  subject: Person;
  /** ISO date of birth. */
  dob?: string;
  /** "सकाळी ४:१२" — birth time matters for Guna Milan. */
  birthTime?: string;
  birthPlace?: string;
  rashi?: string;
  nakshatra?: string;
  gotra?: string;
  heightCm?: number;
  complexion?: string;
  education: Array<{ degree: string; institute?: string; year?: number }>;
  occupation?: { title: string; company?: string; city?: string; since?: number };
  annualIncome?: number;
  family: FamilyMemberLine[];
  nativePlace?: string;
  currentResidence?: string;
  kuldaiwat?: string;
  hobbies?: string[];
  cuisine?: string[];
  about?: string;
  expectations?: string;
  contact: { phone?: string; email?: string; address?: string; throughFamily?: string };
  /** Show income section. Defaults to false — modern Marathi biodata omits it. */
  showIncome?: boolean;
  /** Section order override, e.g. put education first (common for professionals). */
  sectionOrder?: BiodataSectionKey[];
}

export type BiodataSectionKey =
  | 'personal' | 'astrological' | 'education' | 'career' | 'family' | 'lifestyle' | 'expectations' | 'contact';

export interface BiodataSection {
  key: BiodataSectionKey;
  title: string;
  rows: Array<{ label: string; value: string }>;
}

export interface ComposedBiodata {
  title: string;
  subtitle: string;
  subjectLine: string;
  sections: BiodataSection[];
  footer: string;
  plainText: string;
  quality: { score: number; checks: Array<{ id: string; label: string; status: 'pass' | 'warn' | 'fail'; detail?: string }> };
  meta: { engine: string; version: string; generatedAt: string; privacy: 'private-link-only' };
}

export const BIODATA_ENGINE_VERSION = '1.0.0';

export const DEFAULT_SECTION_ORDER: BiodataSectionKey[] = [
  'personal', 'astrological', 'education', 'career', 'family', 'lifestyle', 'expectations', 'contact',
];

const SECTION_TITLES: Record<BiodataSectionKey, string> = {
  personal: 'वैयक्तिक माहिती',
  astrological: 'जन्म व ज्योतिष माहिती',
  education: 'शिक्षण',
  career: 'व्यवसाय / नोकरी',
  family: 'कौटुंबिक माहिती',
  lifestyle: 'आवडी-निवडी',
  expectations: 'अपेक्षा',
  contact: 'संपर्क',
};

function cmToFeet(cm: number): string {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return `${feet} फूट ${inches} इंच`;
}

export function composeBiodata(input: BiodataInput): ComposedBiodata {
  const { subject } = input;
  const name = formatPersonName(subject, { omit: true });
  const sections = new Map<BiodataSectionKey, BiodataSection>();

  /* personal */
  const personalRows = [
    { label: 'नाव', value: name },
    input.dob ? { label: 'जन्मदिनांक', value: formatMarathiDate(input.dob, 'long') } : null,
    input.subject.gender ? { label: 'लिंग', value: subject.gender === 'female' ? 'स्त्री' : 'पुरुष' } : null,
    input.heightCm ? { label: 'उंची', value: `${cmToFeet(input.heightCm)} (${toDevanagariDigits(input.heightCm)} सें.मी.)` } : null,
    input.complexion ? { label: 'वर्ण', value: input.complexion } : null,
    input.currentResidence ? { label: 'सध्याचे निवासस्थान', value: input.currentResidence } : null,
    input.nativePlace ? { label: 'मूळ गाव', value: input.nativePlace } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  sections.set('personal', { key: 'personal', title: SECTION_TITLES.personal, rows: personalRows });

  /* astrological */
  const astroRows = [
    input.birthTime ? { label: 'जन्मवेळ', value: input.birthTime } : null,
    input.birthPlace ? { label: 'जन्मस्थळ', value: input.birthPlace } : null,
    input.rashi ? { label: 'राशी', value: input.rashi } : null,
    input.nakshatra ? { label: 'नक्षत्र', value: input.nakshatra } : null,
    input.gotra ? { label: 'गोत्र', value: input.gotra } : null,
    input.kuldaiwat ? { label: 'कुलदैवत', value: input.kuldaiwat } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  if (astroRows.length) {
    sections.set('astrological', { key: 'astrological', title: SECTION_TITLES.astrological, rows: astroRows });
  }

  /* education */
  if (input.education.length) {
    sections.set('education', {
      key: 'education',
      title: SECTION_TITLES.education,
      rows: input.education.map((e) => ({
        label: e.year ? toDevanagariDigits(e.year) : '—',
        value: [e.degree, e.institute].filter(Boolean).join(' — '),
      })),
    });
  }

  /* career */
  const careerRows: Array<{ label: string; value: string }> = [];
  if (input.occupation) {
    careerRows.push({ label: 'व्यवसाय', value: input.occupation.title });
    if (input.occupation.company) careerRows.push({ label: 'संस्था', value: input.occupation.company });
    if (input.occupation.city) careerRows.push({ label: 'कार्यस्थळ', value: input.occupation.city });
    if (input.occupation.since) {
      const years = new Date().getFullYear() - input.occupation.since;
      careerRows.push({ label: 'अनुभव', value: `${toDevanagariDigits(years)} वर्षे` });
    }
  }
  if (input.showIncome && input.annualIncome) {
    careerRows.push({ label: 'वार्षिक उत्पन्न', value: formatMarathiCurrency(input.annualIncome, { words: true }) });
  }
  if (careerRows.length) sections.set('career', { key: 'career', title: SECTION_TITLES.career, rows: careerRows });

  /* family */
  if (input.family.length) {
    sections.set('family', {
      key: 'family',
      title: SECTION_TITLES.family,
      rows: input.family.map((m) => ({
        label: m.relation,
        value: [m.name, m.occupation, m.note].filter(Boolean).join(' — '),
      })),
    });
  }

  /* lifestyle */
  const lifestyleRows: Array<{ label: string; value: string }> = [];
  if (input.hobbies?.length) lifestyleRows.push({ label: 'छंद', value: input.hobbies.join(', ') });
  if (input.cuisine?.length) lifestyleRows.push({ label: 'आवडते व्यंजन', value: input.cuisine.join(', ') });
  if (input.about) lifestyleRows.push({ label: 'स्वभाव / माहिती', value: input.about });
  if (lifestyleRows.length) {
    sections.set('lifestyle', { key: 'lifestyle', title: SECTION_TITLES.lifestyle, rows: lifestyleRows });
  }

  /* expectations */
  if (input.expectations) {
    sections.set('expectations', {
      key: 'expectations',
      title: SECTION_TITLES.expectations,
      rows: [{ label: 'अपेक्षा', value: input.expectations }],
    });
  }

  /* contact */
  const contactRows = [
    input.contact.phone ? { label: 'भ्रमणध्वनी', value: toDevanagariDigits(input.contact.phone) } : null,
    input.contact.email ? { label: 'ई-मेल', value: input.contact.email } : null,
    input.contact.address ? { label: 'पत्ता', value: input.contact.address } : null,
    input.contact.throughFamily ? { label: 'संपर्क (कुटुंबामार्फत)', value: input.contact.throughFamily } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  sections.set('contact', { key: 'contact', title: SECTION_TITLES.contact, rows: contactRows });

  const order = input.sectionOrder ?? DEFAULT_SECTION_ORDER;
  const ordered = order.map((k) => sections.get(k)).filter(Boolean) as BiodataSection[];

  const checks: ComposedBiodata['quality']['checks'] = [
    {
      id: 'education', label: 'शैक्षणिक माहिती',
      status: input.education.length ? 'pass' : 'warn',
      ...(input.education.length ? {} : { detail: 'किमान एक शैक्षणिक पात्रता जोडा' }),
    },
    {
      id: 'family', label: 'कौटुंबिक माहिती',
      status: input.family.length >= 2 ? 'pass' : 'warn',
      ...(input.family.length >= 2 ? {} : { detail: 'वडील व आईची माहिती आवश्यक' }),
    },
    {
      id: 'contact', label: 'संपर्क',
      status: input.contact.phone || input.contact.throughFamily ? 'pass' : 'warn',
      ...(input.contact.phone || input.contact.throughFamily ? {} : { detail: 'संपर्क क्रमांक किंवा कुटुंबामार्फत संपर्क नमूद करा' }),
    },
    {
      id: 'nakshatra', label: 'नक्षत्र (गुण मिलानासाठी)',
      status: input.nakshatra ? 'pass' : 'warn',
      ...(input.nakshatra ? {} : { detail: 'नक्षत्र दिल्यास ज्योतिष गुण मिलान अचूक होते' }),
    },
    { id: 'privacy', label: 'गोपनीयता', status: 'pass', detail: 'डीफॉल्ट: फक्त दुवा असलेल्यांनाच दिसते' },
  ];
  const score = Math.round(
    (checks.reduce((sum, c) => sum + (c.status === 'pass' ? 1 : c.status === 'warn' ? 0.5 : 0), 0) / checks.length) * 100,
  );

  const plainText = [
    '॥ श्री ॥',
    'वैवाहिक माहिती पत्रक',
    '',
    name,
    '──────────────',
    ...ordered.flatMap((s) => [
      `【${s.title}】`,
      ...s.rows.map((r) => `  • ${r.label}: ${r.value}`),
      '',
    ]),
    'माझी पत्रिका | Mazi Patrika',
  ].join('\n').trim();

  return {
    title: 'वैवाहिक माहिती पत्रक',
    subtitle: '॥ श्री ॥',
    subjectLine: name,
    sections: ordered,
    footer: 'ही माहिती कुटुंबाच्या संमतीने तयार करण्यात आली आहे.',
    plainText,
    quality: { score, checks },
    meta: {
      engine: 'mazi-biodata-composer',
      version: BIODATA_ENGINE_VERSION,
      generatedAt: new Date().toISOString(),
      privacy: 'private-link-only',
    },
  };
}
