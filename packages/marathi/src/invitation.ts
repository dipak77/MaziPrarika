/**
 * Invitation composer — turns structured event data into a culturally correct
 * Marathi invitation (the "Mazi Patrika" itself).
 *
 * Design rule: the composer never machine-translates. It selects and fills
 * Marathi sentence frames that a Maharashtrian family would recognise, using
 * the kinship, honorific and date engines. Output is a structured object so the
 * same composition feeds the on-screen editor, the print PDF, the WhatsApp
 * share text and the public event website with identical wording.
 */

import { getEventType, type EventTypeKey } from './event-taxonomy.js';
import { formatPersonName, type HonorificOptions, type Person } from './person.js';
import { formatMarathiDate, formatMarathiTime, INVOCATIONS, TITHI_NAMES, PAKSHA_NAMES, NAKSHATRA_NAMES } from './datetime.js';
import { marathiOrdinalWord, toDevanagariDigits } from './numerals.js';

export type InvitationTone = 'traditional' | 'warm' | 'formal' | 'modern';

export interface InvitationVenue {
  name: string;
  address?: string;
  city?: string;
  landmark?: string;
  mapsUrl?: string;
}

export interface InvitationContact {
  name: string;
  phone: string;
  label?: string;
}

export interface PanchangSummary {
  tithi?: number;
  paksha?: 0 | 1;
  nakshatra?: number;
  yoga?: number;
  sunrise?: string;
  sunset?: string;
  rahuKaal?: { start: string; end: string };
  method?: string;
}

export interface InvitationScheduleItem {
  label: string;
  date?: string;
  time?: string;
  venue?: string;
}

export interface InvitationInput {
  eventType: EventTypeKey | string;
  /** Primary inviters — usually parents or the couple themselves. */
  hosts: Person[];
  /** Birthday child / naming baby / upanayan boy. */
  celebrant?: Person;
  bride?: Person;
  groom?: Person;
  /** Whose household is inviting (decides the sentence direction). */
  side?: 'bride' | 'groom' | 'both';
  celebrantAge?: number;
  /** ISO date of the event. */
  date: string;
  startTime?: string;
  endTime?: string;
  muhuratLabel?: string;
  venue: InvitationVenue;
  panchang?: PanchangSummary;
  schedule?: InvitationScheduleItem[];
  contacts?: InvitationContact[];
  rsvp?: { phone?: string; whatsapp?: string; url?: string };
  dining?: string;
  note?: string;
  websiteUrl?: string;
  tone?: InvitationTone;
  register?: 'formal' | 'respectful';
  /** Adds an English rendering for mixed-language guest lists. */
  english?: boolean;
  /** Branding footer for shared/WhatsApp exports (never on paid print PDFs). */
  showBranding?: boolean;
}

export type LineEmphasis = 'invocation' | 'headline' | 'subheadline' | 'narrative' | 'request' | 'note' | 'closing';

export interface InvitationLine {
  id: string;
  text: string;
  emphasis: LineEmphasis;
  /** Approximate visual weight used by the layout engine. */
  weight: 'light' | 'normal' | 'bold';
}

export interface InvitationDetail {
  label: string;
  value: string;
  emphasis?: 'normal' | 'strong';
}

export interface QualityCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail?: string;
}

export interface QualityReport {
  score: number;
  checks: QualityCheck[];
  /** Suggested font size for the narrative block, so print never overflows. */
  suggestedFontSize: number;
}

export interface ComposedInvitation {
  eventType: EventTypeKey;
  eventLabel: string;
  invocation: string | null;
  headline: string;
  subheadline?: string;
  lines: InvitationLine[];
  request: string;
  details: InvitationDetail[];
  schedule: InvitationDetail[];
  panchangLines: string[];
  contacts: InvitationDetail[];
  footer: { rsvp?: string; note?: string; branding?: string };
  quality: QualityReport;
  plainText: string;
  whatsappText: string;
  englishText?: string;
  meta: {
    engine: string;
    version: string;
    generatedAt: string;
    wordCount: number;
    readingSeconds: number;
  };
}

export const INVITATION_ENGINE_VERSION = '1.0.0';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const hostLine = (hosts: Person[], opts: HonorificOptions): string =>
  hosts
    .map((h) => formatPersonName(h, opts))
    .filter(Boolean)
    .join(' व ');

const childWord = (gender: Person['gender']): string => (gender === 'female' ? 'सुपुत्री' : 'सुपुत्र');
const pronoun = (gender: Person['gender']): string => (gender === 'female' ? 'हिचा' : 'याचा');
const pronounObj = (gender: Person['gender']): string => (gender === 'female' ? 'हिला' : 'याला');
const pronounWith = (gender: Person['gender']): string => (gender === 'female' ? 'हिच्याशी' : 'याच्याशी');
const pronounChild = (gender: Person['gender']): string => (gender === 'female' ? 'हिचा' : 'याचा');
/** "यांच्या सुपुत्राचा / सुपुत्रीचा" */
const childGenitive = (gender: Person['gender']): string =>
  gender === 'female' ? 'सुपुत्रीचा' : 'सुपुत्राचा';
/** "यांची सुपुत्री / यांचा सुपुत्र" */
const childPossessive = (gender: Person['gender']): string =>
  gender === 'female' ? 'यांची सुपुत्री' : 'यांचा सुपुत्र';
/** "यांचा सुपुत्र / यांची मुलगी" for birthday narrations. */
const celebrateeWord = (gender: Person['gender']): string =>
  gender === 'female' ? 'यांची मुलगी' : 'यांचा मुलगा';

function dativeName(name: string): string {
  if (!name) return '';
  return `${name}ला`;
}

function venuePhrase(venue: InvitationVenue): string {
  const parts = [venue.name, venue.landmark, venue.city].filter(Boolean);
  return parts.join(', ');
}

const isFilled = (value?: string | null): boolean => Boolean(value && value.trim().length > 0);

/** " सकाळी १०:४२ वाजता" — omitted entirely when no start time is known. */
function timePhrase(input: InvitationInput): string {
  return input.startTime ? ` ${formatMarathiTime(input.startTime)} वाजता` : '';
}

function estimateTextWidth(text: string, fontSize: number): number {
  // Devanagari average advance ≈ 0.58em with matras + conjuncts; Latin ≈ 0.5em.
  let units = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x0900 && code <= 0x097f) units += 0.58;
    else if (/[A-Za-z]/.test(ch)) units += 0.5;
    else if (/\s/.test(ch)) units += 0.28;
    else if (/[०-९0-9]/.test(ch)) units += 0.52;
    else units += 0.35;
  }
  return units * fontSize;
}

/* ------------------------------------------------------------------ */
/* narrative builders                                                  */
/* ------------------------------------------------------------------ */

function buildWedding(input: InvitationInput, opts: HonorificOptions): InvitationLine[] {
  const { hosts, bride, groom, side = 'bride' } = input;
  const lines: InvitationLine[] = [];
  const hostsText = hostLine(hosts, opts);
  const brideParentsLine = hostsText;
  const dateText = formatMarathiDate(input.date, 'full');
  const venueText = venuePhrase(input.venue);
  const muhurat = isFilled(input.muhuratLabel) ? ' या शुभ मुहूर्तावर' : '';
  const timeText = timePhrase(input);

  if (bride && groom) {
    const firstName = side === 'groom' ? groom : bride;
    const secondName = side === 'groom' ? bride : groom;
    if (side === 'groom') {
      lines.push({
        id: 'n1', weight: 'normal', emphasis: 'narrative',
        text: `${brideParentsLine} ${childPossessive(firstName.gender)} ${formatPersonName(firstName, opts)} ${pronoun(firstName.gender)}`,
      });
      lines.push({
        id: 'n2', weight: 'normal', emphasis: 'narrative',
        text: `${formatPersonName(secondName, opts)} ${pronounWith(secondName.gender)}`,
      });
    } else {
      lines.push({
        id: 'n1', weight: 'normal', emphasis: 'narrative',
        text: `${brideParentsLine} ${childPossessive(firstName.gender)} ${formatPersonName(firstName, opts)} ${pronoun(firstName.gender)}`,
      });
      lines.push({
        id: 'n2', weight: 'normal', emphasis: 'narrative',
        text: `${formatPersonName(secondName, opts)} ${pronounWith(secondName.gender)}`,
      });
    }
    lines.push({
      id: 'n3', weight: 'normal', emphasis: 'narrative',
      text: `विवाह ${dateText} रोजी${timeText}${muhurat} ${venueText} येथे स्थिर झाला आहे.`,
    });
    lines.push({
      id: 'n4', weight: 'normal', emphasis: 'narrative',
      text: 'परस्पर संमतीने व कुटुंबीयांच्या आशीर्वादाने हा शुभ विवाह निश्चित झाला आहे.',
    });
  } else {
    lines.push({
      id: 'n1', weight: 'normal', emphasis: 'narrative',
      text: `${hostsText} यांच्या कुटुंबात शुभ विवाह समारंभ ${dateText} रोजी${timeText} ${venueText} येथे आयोजित केला आहे.`,
    });
  }
  return lines;
}

function buildEngagement(input: InvitationInput, opts: HonorificOptions): InvitationLine[] {
  const { hosts, bride, groom, side = 'bride' } = input;
  const dateText = formatMarathiDate(input.date, 'full');
  const timeText = timePhrase(input);
  const venueText = venuePhrase(input.venue);
  const hostsText = hostLine(hosts, opts);
  const lines: InvitationLine[] = [];

  if (bride && groom) {
    const first = side === 'groom' ? groom : bride;
    const second = side === 'groom' ? bride : groom;
    lines.push({
      id: 'n1', weight: 'normal', emphasis: 'narrative',
      text: `${hostsText} ${childPossessive(first.gender)} ${formatPersonName(first, opts)} ${pronounChild(first.gender)}`,
    });
    lines.push({
      id: 'n2', weight: 'normal', emphasis: 'narrative',
      text: `साखरपुडा ${formatPersonName(second, opts)} ${pronounWith(second.gender)}`,
    });
    lines.push({
      id: 'n3', weight: 'normal', emphasis: 'narrative',
      text: `${dateText} रोजी${timeText} ${venueText} येथे शुभ मुहूर्तावर निश्चित करण्यात आला आहे.`,
    });
  } else {
    lines.push({
      id: 'n1', weight: 'normal', emphasis: 'narrative',
      text: `${hostsText} यांच्या घरी साखरपुडा समारंभ ${dateText} रोजी${timeText} ${venueText} येथे आयोजित केला आहे.`,
    });
  }
  lines.push({
    id: 'n4', weight: 'normal', emphasis: 'narrative',
    text: 'दोन्ही कुटुंबांच्या संमतीने व आशीर्वादाने हा मंगलप्रसंग साजरा होत आहे.',
  });
  return lines;
}

function buildBirthday(input: InvitationInput, opts: HonorificOptions): InvitationLine[] {
  const { hosts, celebrant, celebrantAge, venue } = input;
  const lines: InvitationLine[] = [];
  const hostsText = hostLine(hosts, opts);
  const dateText = formatMarathiDate(input.date, 'full');
  const timeText = timePhrase(input);
  const venueText = venuePhrase(venue);

  if (celebrant) {
    const ordinal = celebrantAge ? `${marathiOrdinalWord(celebrantAge, celebrant.gender === 'female' ? 'f' : 'm')} ` : '';
    lines.push({
      id: 'n1', weight: 'bold', emphasis: 'narrative',
      text: `${hostsText} ${celebrateeWord(celebrant.gender)} ${formatPersonName(celebrant, { ...opts, omit: true })} ${pronounChild(celebrant.gender)} ${ordinal}वाढदिवसानिमित्त स्नेहभोजनाचे आयोजन केले आहे.`,
    });
    lines.push({
      id: 'n2', weight: 'normal', emphasis: 'narrative',
      text: `कार्यक्रम ${dateText} रोजी${timeText} ${venueText} येथे होणार आहे.`,
    });
    lines.push({
      id: 'n3', weight: 'normal', emphasis: 'narrative',
      text: `आपण सस्नेह उपस्थित राहून ${dativeName(celebrant.name)} हार्दिक शुभेच्छा द्याव्यात ही विनंती.`,
    });
  } else {
    lines.push({
      id: 'n1', weight: 'normal', emphasis: 'narrative',
      text: `${hostsText} यांनी वाढदिवसानिमित्त स्नेहभोजनाचे आयोजन केले आहे.`,
    });
    lines.push({
      id: 'n2', weight: 'normal', emphasis: 'narrative',
      text: `कार्यक्रम ${dateText} रोजी${timeText} ${venueText} येथे होणार आहे.`,
    });
  }
  return lines;
}

function buildNaming(input: InvitationInput, opts: HonorificOptions): InvitationLine[] {
  const { hosts, celebrant, venue } = input;
  const hostsText = hostLine(hosts, opts);
  const dateText = formatMarathiDate(input.date, 'full');
  const timeText = timePhrase(input);
  const venueText = venuePhrase(venue);
  const gender = celebrant?.gender ?? 'male';
  const lines: InvitationLine[] = [];

  lines.push({
    id: 'n1', weight: 'normal', emphasis: 'narrative',
    text: `${hostsText} यांच्या ${childGenitive(gender)} नामकरण संस्काराचा मंगल कार्यक्रम`,
  });
  lines.push({
    id: 'n2', weight: 'normal', emphasis: 'narrative',
    text: `${dateText} रोजी${timeText} ${venueText} येथे आयोजित केला आहे.`,
  });
  lines.push({
    id: 'n3', weight: 'normal', emphasis: 'narrative',
    text: 'विधी सोहळा शुभ मुहूर्तावर गुरुजींच्या उपस्थितीत पार पडेल.',
  });
  return lines;
}

function buildGruhapravesh(input: InvitationInput, opts: HonorificOptions): InvitationLine[] {
  const hostsText = hostLine(input.hosts, opts);
  const dateText = formatMarathiDate(input.date, 'full');
  const timeText = timePhrase(input);
  const venueText = venuePhrase(input.venue);
  return [
    {
      id: 'n1', weight: 'normal', emphasis: 'narrative',
      text: `${hostsText} यांच्या नवीन निवासस्थानी ${venueText} येथे`,
    },
    {
      id: 'n2', weight: 'normal', emphasis: 'narrative',
      text: `${dateText} रोजी${timeText} वास्तुशांती व गृहप्रवेशाचा कार्यक्रम ठेवला आहे.`,
    },
    {
      id: 'n3', weight: 'normal', emphasis: 'narrative',
      text: 'गृहप्रवेशानंतर प्रसाद व स्नेहभोजनाचा कार्यक्रम आहे.',
    },
  ];
}

function buildPuja(input: InvitationInput, opts: HonorificOptions): InvitationLine[] {
  const spec = getEventType(input.eventType);
  const hostsText = hostLine(input.hosts, opts);
  const dateText = formatMarathiDate(input.date, 'full');
  const timeText = timePhrase(input);
  const venueText = venuePhrase(input.venue);
  const lines: InvitationLine[] = [
    {
      id: 'n1', weight: 'normal', emphasis: 'narrative',
      text: `${hostsText} यांच्या निवासस्थानी ${venueText} येथे`,
    },
    {
      id: 'n2', weight: 'normal', emphasis: 'narrative',
      text: `${dateText} रोजी${timeText} ${spec.label} चे आयोजन केले आहे.`,
    },
    {
      id: 'n3', weight: 'normal', emphasis: 'narrative',
      text: 'पूजेचा विधी गुरुजींच्या उपस्थितीत पार पडेल. पूजेनंतर प्रसाद व स्नेहभोजन.',
    },
  ];
  return lines;
}

function buildThreadCeremony(input: InvitationInput, opts: HonorificOptions): InvitationLine[] {
  const { hosts, celebrant } = input;
  const hostsText = hostLine(hosts, opts);
  const dateText = formatMarathiDate(input.date, 'full');
  const timeText = timePhrase(input);
  const venueText = venuePhrase(input.venue);
  const gender = celebrant?.gender ?? 'male';
  return [
    {
      id: 'n1', weight: 'normal', emphasis: 'narrative',
      text: `${hostsText} यांचा ${childWord(gender)} ${celebrant ? formatPersonName(celebrant, opts) : ''} ${celebrant ? pronounChild(gender) : ''}`,
    },
    {
      id: 'n2', weight: 'normal', emphasis: 'narrative',
      text: `उपनयन संस्कार (मुंज) ${dateText} रोजी${timeText} ${venueText} येथे शुभ मुहूर्तावर पार पडेल.`,
    },
    {
      id: 'n3', weight: 'normal', emphasis: 'narrative',
      text: 'कार्यक्रमानंतर स्नेहभोजनाचा कार्यक्रम आहे.',
    },
  ];
}

function buildCelebration(input: InvitationInput, opts: HonorificOptions): InvitationLine[] {
  const spec = getEventType(input.eventType);
  const hostsText = hostLine(input.hosts, opts);
  const dateText = formatMarathiDate(input.date, 'full');
  const timeText = timePhrase(input);
  const venueText = venuePhrase(input.venue);
  return [
    {
      id: 'n1', weight: 'normal', emphasis: 'narrative',
      text: `${hostsText} यांच्या वतीने ${spec.label} कार्यक्रम ${dateText} रोजी${timeText} ${venueText} येथे आयोजित केला आहे.`,
    },
    {
      id: 'n2', weight: 'normal', emphasis: 'narrative',
      text: 'कार्यक्रमाला सहकुटुंब उपस्थिती देऊन यशस्वी करावा ही विनंती.',
    },
  ];
}

function buildNarrative(input: InvitationInput, opts: HonorificOptions): InvitationLine[] {
  switch (input.eventType) {
    case 'wedding': return buildWedding(input, opts);
    case 'engagement':
    case 'sakharpuda': return buildEngagement(input, opts);
    case 'birthday': return buildBirthday(input, opts);
    case 'naming':
    case 'annaprashan':
    case 'mundan': return buildNaming(input, opts);
    case 'gruhapravesh':
    case 'bhoomipujan': return buildGruhapravesh(input, opts);
    case 'thread': return buildThreadCeremony(input, opts);
    case 'satyanarayan':
    case 'ganpati':
    case 'navratri':
    case 'punyatithi': return buildPuja(input, opts);
    case 'haldi':
    case 'sangeet':
    case 'reception':
    case 'corporate':
    case 'school':
    case 'community':
    case 'other': return buildCelebration(input, opts);
    default: return buildCelebration(input, opts);
  }
}

function buildRequest(input: InvitationInput, tone: InvitationTone): string {
  const { eventType } = input;
  const isWeddingLike = ['wedding', 'engagement', 'sakharpuda', 'thread'].includes(String(eventType));
  const isMemory = eventType === 'punyatithi';
  if (isMemory) return 'आपल्या उपस्थितीने दिवंगतांच्या स्मरणास आदरांजली अर्पण होईल.';
  if (isWeddingLike) {
    return tone === 'modern'
      ? 'आपल्या उपस्थितीने व आशीर्वादाने हा मंगल सोहळा संपन्न होईल.'
      : 'तरी आपण सहकुटुंब सहपरिवार उपस्थित राहून नवदांपत्यास आशीर्वाद द्यावेत ही विनंती.';
  }
  return tone === 'formal'
    ? 'आपल्या उपस्थितीची मनःपूर्वक अपेक्षा आहे.'
    : 'तरी आपण सहकुटुंब उपस्थित राहावे ही विनंती.';
}

/* ------------------------------------------------------------------ */
/* quality gate                                                        */
/* ------------------------------------------------------------------ */

export function lintMarathiText(text: string): string[] {
  const issues: string[] = [];
  if (/[A-Za-z]{2,}/.test(text)) issues.push('मजकुरात इंग्रजी शब्द आढळला — मराठी शब्दलेखन तपासा.');
  if (/ {2,}/.test(text)) issues.push('अतिरिक्त जागा (double space) आढळली.');
  if (/श्री\.\s*(यांचे|यांनी)/.test(text)) issues.push('"श्री." नंतर नाव नाही — आदरार्थी शब्द अपूर्ण.');
  if (/॥[^॥]*।(?!।)/.test(text)) issues.push('एकल दंड (।) वापरले आहे — मंगलचिन्हासाठी ॥ वापरा.');
  return issues;
}

export function buildQualityReport(input: InvitationInput, lines: InvitationLine[], textWidthPt = 520): QualityReport {
  const checks: QualityCheck[] = [];
  const spec = getEventType(input.eventType);
  const has = (v: unknown) => isFilled(typeof v === 'string' ? v : '');

  checks.push({
    id: 'hosts',
    label: 'निमंत्रक नाव',
    status: input.hosts.length > 0 ? 'pass' : 'fail',
    detail: input.hosts.length > 0 ? undefined : 'निमंत्रकाचे नाव आवश्यक आहे',
  });

  if (spec.requiresRitual || spec.invitation.invocation !== 'none') {
    checks.push({
      id: 'invocation',
      label: 'मंगलचिन्ह (॥ श्री गणेशाय नमः ॥)',
      status: spec.invitation.invocation === 'none' ? 'pass' : 'pass',
      detail: 'विधीपूर्वक कार्यक्रमासाठी मंगलचिन्ह समाविष्ट',
    });
  }

  if (spec.muhuratSensitive) {
    checks.push({
      id: 'muhurat',
      label: 'मुहूर्त नमूद',
      status: has(input.muhuratLabel) ? 'pass' : 'warn',
      detail: has(input.muhuratLabel) ? undefined : 'मुहूर्त नमूद केलेला नाही — पंचांगानुसार मुहूर्त जोडा',
    });
  }

  checks.push({
    id: 'venue',
    label: 'स्थळ पूर्ण',
    status: isFilled(input.venue.name) && isFilled(input.venue.city) ? 'pass' : 'warn',
    detail: isFilled(input.venue.city) ? undefined : 'शहर/गाव नमूद करा — पाहुण्यांना मार्गदर्शन होईल',
  });

  checks.push({
    id: 'date',
    label: 'दिनांक',
    status: has(input.date) ? (new Date(input.date).getTime() > Date.now() - 86_400_000 ? 'pass' : 'warn') : 'fail',
    detail: has(input.date) ? undefined : 'दिनांक आवश्यक',
  });

  if (input.eventType === 'wedding') {
    checks.push({
      id: 'couple',
      label: 'वधू-वर नावे',
      status: input.bride && input.groom ? 'pass' : 'fail',
      detail: input.bride && input.groom ? undefined : 'वधू व वर दोघांची नावे आवश्यक',
    });
    checks.push({
      id: 'names-complete',
      label: 'आडनाव पूर्ण',
      status: input.bride?.surname && input.groom?.surname ? 'pass' : 'warn',
      detail: 'आडनाव नमूद केल्यास पत्रिका अधिकृत दिसते',
    });
  }

  if (['birthday', 'naming', 'annaprashan', 'mundan', 'thread'].includes(String(input.eventType))) {
    checks.push({
      id: 'celebrant',
      label: 'मुख्य व्यक्तीचे नाव',
      status: input.celebrant?.name ? 'pass' : 'warn',
      detail: input.celebrant?.name ? undefined : 'कार्यक्रम ज्यांच्यासाठी आहे त्यांचे नाव जोडा',
    });
  }

  const widest = lines.reduce((max, line) => Math.max(max, estimateTextWidth(line.text, 16)), 0);
  const overflow = widest > textWidthPt;
  checks.push({
    id: 'overflow',
    label: 'मांडणी (Smart Layout)',
    status: overflow ? 'warn' : 'pass',
    detail: overflow
      ? `ओळीची रुंदी ${Math.round(widest)}pt — उपलब्ध ${textWidthPt}pt. फॉन्ट आकार कमी केला जाईल.`
      : undefined,
  });

  const phoneIssue = (input.contacts ?? []).some((c) => !/^(\+91[- ]?)?[6-9]\d{9}$/.test(c.phone.replace(/[- ]/g, '')));
  if ((input.contacts ?? []).length) {
    checks.push({
      id: 'phone',
      label: 'संपर्क क्रमांक',
      status: phoneIssue ? 'warn' : 'pass',
      detail: phoneIssue ? 'क्रमांक १० अंकी असावा (उदा. ९८२२० १२३४५)' : undefined,
    });
  }

  const weightOf = (status: QualityCheck['status']) => (status === 'pass' ? 1 : status === 'warn' ? 0.5 : 0);
  const score = Math.round((checks.reduce((sum, c) => sum + weightOf(c.status), 0) / checks.length) * 100);

  const required = widest || 1;
  const suggestedFontSize = overflow ? Math.max(9, Math.floor((16 * textWidthPt) / required)) : 16;

  return { score, checks, suggestedFontSize };
}

/* ------------------------------------------------------------------ */
/* detail / export builders                                            */
/* ------------------------------------------------------------------ */

function buildDetails(input: InvitationInput): InvitationDetail[] {
  const details: InvitationDetail[] = [];
  const fullDate = formatMarathiDate(input.date, 'full');
  details.push({ label: 'दिनांक', value: fullDate, emphasis: 'strong' });
  if (input.muhuratLabel) details.push({ label: 'मुहूर्त', value: input.muhuratLabel, emphasis: 'strong' });
  if (input.startTime) details.push({ label: 'वेळ', value: formatMarathiTime(input.startTime) });
  if (input.endTime) details.push({ label: 'समाप्ती', value: formatMarathiTime(input.endTime) });
  details.push({ label: 'स्थळ', value: venuePhrase(input.venue), emphasis: 'strong' });
  if (input.venue.address) details.push({ label: 'पत्ता', value: input.venue.address });
  if (input.dining) details.push({ label: 'स्नेहभोजन', value: input.dining });
  if (input.websiteUrl) details.push({ label: 'संकेतस्थळ', value: input.websiteUrl });
  if (input.venue.mapsUrl) details.push({ label: 'नकाशा', value: input.venue.mapsUrl });
  return details;
}

function buildPanchangLines(panchang?: PanchangSummary): string[] {
  if (!panchang) return [];
  const out: string[] = [];
  if (panchang.tithi !== undefined) {
    const paksha = panchang.paksha !== undefined ? PAKSHA_NAMES[panchang.paksha] : '';
    const tithiName = TITHI_NAMES[panchang.tithi] ?? '';
    out.push(`तिथी: ${paksha} ${tithiName}`.trim());
  }
  if (panchang.nakshatra !== undefined && NAKSHATRA_NAMES[panchang.nakshatra]) {
    out.push(`नक्षत्र: ${NAKSHATRA_NAMES[panchang.nakshatra]}`);
  }
  if (panchang.sunrise) out.push(`सूर्योदय: ${panchang.sunrise}`);
  if (panchang.sunset) out.push(`सूर्यास्त: ${panchang.sunset}`);
  if (panchang.rahuKaal) out.push(`राहुकाळ: ${panchang.rahuKaal.start} ते ${panchang.rahuKaal.end}`);
  return out;
}

/** Deterministic English rendering composed from the same structured data. */
function buildEnglish(input: InvitationInput): string {
  const spec = getEventType(input.eventType);
  const date = new Date(input.date);
  const dateText = date.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
  const time = input.startTime
    ? new Date(input.startTime).toISOString().slice(11, 16)
    : undefined;
  const venue = venuePhrase(input.venue);
  const names = input.hosts.map((h) => `${h.name} ${h.surname ?? ''}`.trim()).join(' & ');

  if (input.eventType === 'wedding' && input.bride && input.groom) {
    return [
      `${spec.englishLabel} of ${input.bride.name} ${input.bride.surname ?? ''} & ${input.groom.name} ${input.groom.surname ?? ''}`,
      `Hosted by ${names}`,
      `${dateText}${time ? ` at ${time}` : ''}`,
      venue,
      input.muhuratLabel ? `Muhurat: ${input.muhuratLabel}` : undefined,
      'Your presence with family will grace the occasion.',
    ].filter(Boolean).join('\n');
  }
  return [
    `${spec.englishLabel}${input.celebrant ? ` — ${input.celebrant.name}` : ''}`,
    `Hosted by ${names}`,
    `${dateText}${time ? ` at ${time}` : ''}`,
    venue,
    'Your presence with family will grace the occasion.',
  ].filter(Boolean).join('\n');
}

/* ------------------------------------------------------------------ */
/* composer                                                            */
/* ------------------------------------------------------------------ */

export function composeInvitation(input: InvitationInput): ComposedInvitation {
  const spec = getEventType(input.eventType);
  const opts: HonorificOptions = { register: input.register ?? 'formal' };
  const tone: InvitationTone = input.tone ?? 'traditional';

  const invocation = spec.invitation.invocation === 'none'
    ? null
    : INVOCATIONS[spec.invitation.invocation as keyof typeof INVOCATIONS];

  const headline = spec.invitation.headline;
  const narrative = buildNarrative(input, opts);
  const request = buildRequest(input, tone);
  const details = buildDetails(input);
  const panchangLines = buildPanchangLines(input.panchang);
  const contacts: InvitationDetail[] = (input.contacts ?? []).map((c) => ({
    label: c.label ? `${c.label} — ${c.name}` : c.name,
    value: toDevanagariDigits(c.phone),
  }));

  const lines: InvitationLine[] = [
    ...(invocation
      ? [{ id: 'inv', text: invocation, emphasis: 'invocation' as LineEmphasis, weight: 'light' as const }]
      : []),
    { id: 'head', text: headline, emphasis: 'headline', weight: 'bold' },
    ...(spec.invitation.subheadline && tone === 'traditional'
      ? [{ id: 'sub', text: spec.invitation.subheadline, emphasis: 'subheadline' as LineEmphasis, weight: 'light' as const }]
      : []),
    ...narrative,
    { id: 'req', text: request, emphasis: 'request', weight: 'normal' },
    ...(input.note ? [{ id: 'note', text: input.note, emphasis: 'note' as LineEmphasis, weight: 'light' as const }] : []),
  ];

  const rsvpText = input.rsvp?.phone || input.rsvp?.whatsapp
    ? `कृपया येण्याची खात्री ${toDevanagariDigits(input.rsvp.whatsapp ?? input.rsvp.phone ?? '')} या क्रमांकावर कळवावी.`
    : undefined;

  const quality = buildQualityReport(input, narrative, 520);

  const footer: ComposedInvitation['footer'] = {
    ...(rsvpText ? { rsvp: rsvpText } : {}),
    ...(input.note ? { note: input.note } : {}),
    ...(input.showBranding === false ? {} : { branding: 'माझी पत्रिका | Mazi Patrika' }),
  };

  const schedule: InvitationDetail[] = (input.schedule ?? []).map((item) => ({
    label: item.label,
    value: [item.date ? formatMarathiDate(item.date, 'long') : '', item.time ? formatMarathiTime(item.time) : '', item.venue ?? '']
      .filter(Boolean)
      .join(' | '),
  }));

  const plainText = toPlainText({
    invocation, headline, lines, details, schedule, contacts, footer, panchangLines,
  });
  const whatsappText = toWhatsAppText({ input, headline, details, rsvpText });
  const englishText = input.english ? buildEnglish(input) : undefined;

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  return {
    eventType: spec.key,
    eventLabel: spec.label,
    invocation,
    headline,
    ...(spec.invitation.subheadline ? { subheadline: spec.invitation.subheadline } : {}),
    lines,
    request,
    details,
    schedule,
    panchangLines,
    contacts,
    footer,
    quality,
    plainText,
    whatsappText,
    ...(englishText ? { englishText } : {}),
    meta: {
      engine: 'mazi-invitation-composer',
      version: INVITATION_ENGINE_VERSION,
      generatedAt: new Date().toISOString(),
      wordCount,
      readingSeconds: Math.max(20, Math.round((wordCount / 130) * 60)),
    },
  };
}

interface PlainTextParts {
  invocation: string | null;
  headline: string;
  lines: InvitationLine[];
  details: InvitationDetail[];
  schedule: InvitationDetail[];
  contacts: InvitationDetail[];
  footer: ComposedInvitation['footer'];
  panchangLines: string[];
}

export function toPlainText(parts: PlainTextParts): string {
  const rule = '──────────────';
  const out: string[] = [];
  if (parts.invocation) out.push(parts.invocation, '');
  out.push(parts.headline, '', rule, '');
  for (const line of parts.lines.filter((l) => l.emphasis === 'narrative')) out.push(line.text, '');
  const request = parts.lines.find((l) => l.emphasis === 'request');
  if (request) out.push(request.text, '', rule, '');
  for (const d of parts.details) out.push(`${d.label}: ${d.value}`);
  if (parts.schedule.length) {
    out.push('', 'कार्यक्रमाची रूपरेषा:');
    for (const s of parts.schedule) out.push(`  • ${s.label}: ${s.value}`);
  }
  if (parts.panchangLines.length) {
    out.push('', 'पंचांग:');
    for (const p of parts.panchangLines) out.push(`  • ${p}`);
  }
  if (parts.contacts.length) {
    out.push('', 'संपर्क:');
    for (const c of parts.contacts) out.push(`  • ${c.label}: ${c.value}`);
  }
  if (parts.footer.rsvp) out.push('', parts.footer.rsvp);
  if (parts.footer.note) out.push('', `सूचना: ${parts.footer.note}`);
  if (parts.footer.branding) out.push('', rule, parts.footer.branding);
  return out.join('\n').trimEnd();
}

/** Compact, share-ready WhatsApp message (the viral loop). */
export function toWhatsAppText(args: {
  input: InvitationInput;
  headline: string;
  details: InvitationDetail[];
  rsvpText?: string;
}): string {
  const { input, headline, details, rsvpText } = args;
  const pick = (label: string) => details.find((d) => d.label === label)?.value;
  const spec = getEventType(input.eventType);
  const rows: string[] = [];
  rows.push(`*${headline.replace(/॥/g, '').trim()}*`);
  if (input.bride && input.groom) {
    rows.push(`${input.bride.name} ♥ ${input.groom.name}`);
  } else if (input.celebrant) {
    rows.push(`${input.celebrant.name} ${input.celebrantAge ? `• ${toDevanagariDigits(input.celebrantAge)} वा वाढदिवस` : ''}`.trim());
  }
  rows.push('');
  const date = pick('दिनांक');
  if (date) rows.push(`📅 ${date}`);
  const muhurat = pick('मुहूर्त');
  if (muhurat) rows.push(`🕉️ ${muhurat}`);
  else {
    const time = pick('वेळ');
    if (time) rows.push(`🕐 ${time}`);
  }
  const venue = pick('स्थळ');
  if (venue) rows.push(`📍 ${venue}`);
  const map = pick('नकाशा');
  if (map) rows.push(`🗺️ ${map}`);
  const site = pick('संकेतस्थळ');
  if (site) rows.push(`🌐 ${site}`);
  if (rsvpText) rows.push('', `✅ ${rsvpText}`);
  if (input.showBranding !== false) rows.push('', '_माझी पत्रिका • Mazi Patrika_');
  return rows.join('\n').trim();
}

/** Convenience for UI previews: the narrative body for a quick template swap. */
export function composeInvitationText(input: InvitationInput): string {
  return composeInvitation(input).plainText;
}

export { estimateTextWidth };
