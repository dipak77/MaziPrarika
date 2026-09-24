/**
 * Marathi kinship & honorific engine ("Cultural Intelligence" pillar).
 *
 * Given a relationship *path* from a host to a relative — for example
 * `father → elderBrother` — the engine resolves the exact Marathi term the
 * family would use (काका), how to address them (काकांना), how much respect
 * the wording must carry, and which side of the family they belong to.
 *
 * This is what lets Mazi Patrika auto-generate an invitation that reads like
 * it was written by the family, not translated by a machine.
 */

import type { PersonGender } from './person.js';

/** Directed edges that can appear in a kinship path. */
export type RelationEdge =
  | 'father' | 'mother'
  | 'husband' | 'wife'
  | 'son' | 'daughter'
  | 'elderBrother' | 'youngerBrother'
  | 'elderSister' | 'youngerSister';

export const RELATION_EDGE_LABELS: Record<RelationEdge, string> = {
  father: 'वडील', mother: 'आई', husband: 'पती', wife: 'पत्नी',
  son: 'मुलगा', daughter: 'मुलगी',
  elderBrother: 'थोरले बंधू', youngerBrother: 'धाकटे बंधू',
  elderSister: 'थोरली भगिनी', youngerSister: 'धाकटी भगिनी',
};

export type FamilySide = 'own' | 'paternal' | 'maternal' | 'in-law' | 'affinal' | 'descendant';
export type RelativeAge = 'elder' | 'younger' | 'same' | 'unknown';

export interface KinshipTerm {
  /** Canonical dotted path, e.g. `father.elderBrother`. */
  path: string;
  /** The word the family actually says. */
  term: string;
  /** Other accepted spellings / regional variants. */
  variants: string[];
  english: string;
  gender: PersonGender;
  relativeAge: RelativeAge;
  side: FamilySide;
  /** 1 = peer, 5 = highest (elder / ritual seniority). Drives verb forms. */
  respect: 1 | 2 | 3 | 4 | 5;
  /** Locative form used in invitation sentences: "काकांना", "मामांना". */
  dative: string;
  /** Genitive form: "वडिलांचे", "मामाचे". */
  genitive: string;
  /** When true the relative must be invited with family ("सहकुटुंब"). */
  inviteWithFamily: boolean;
}

type TermSpec = Omit<KinshipTerm, 'path'>;

const T = (spec: TermSpec): TermSpec => spec;

const TERMS: Record<string, TermSpec> = {
  /* ---------------- immediate ---------------- */
  father: T({
    term: 'वडील', variants: ['बाबा', 'पिता', 'अप्पा'], english: 'father', gender: 'male',
    relativeAge: 'elder', side: 'own', respect: 5, dative: 'वडिलांना', genitive: 'वडिलांचे', inviteWithFamily: false,
  }),
  mother: T({
    term: 'आई', variants: ['मातोश्री', 'आम्मा'], english: 'mother', gender: 'female',
    relativeAge: 'elder', side: 'own', respect: 5, dative: 'आईला', genitive: 'आईचे', inviteWithFamily: false,
  }),
  husband: T({
    term: 'पती', variants: ['नवरा', 'पती'], english: 'husband', gender: 'male',
    relativeAge: 'same', side: 'own', respect: 4, dative: 'पतीला', genitive: 'पतीचे', inviteWithFamily: false,
  }),
  wife: T({
    term: 'पत्नी', variants: ['बायको'], english: 'wife', gender: 'female',
    relativeAge: 'same', side: 'own', respect: 4, dative: 'पत्नीला', genitive: 'पत्नीचे', inviteWithFamily: false,
  }),
  son: T({
    term: 'मुलगा', variants: ['सुपुत्र', 'चिरंजीव'], english: 'son', gender: 'male',
    relativeAge: 'younger', side: 'descendant', respect: 2, dative: 'मुलाला', genitive: 'मुलाचे', inviteWithFamily: false,
  }),
  daughter: T({
    term: 'मुलगी', variants: ['सुपुत्री', 'कन्या'], english: 'daughter', gender: 'female',
    relativeAge: 'younger', side: 'descendant', respect: 2, dative: 'मुलीला', genitive: 'मुलीचे', inviteWithFamily: false,
  }),

  /* ---------------- siblings ---------------- */
  elderBrother: T({
    term: 'दादा', variants: ['थोरले बंधू', 'अण्णा'], english: 'elder brother', gender: 'male',
    relativeAge: 'elder', side: 'own', respect: 5, dative: 'दादांना', genitive: 'दादांचे', inviteWithFamily: true,
  }),
  youngerBrother: T({
    term: 'भाऊ', variants: ['धाकटे बंधू', 'बंधू'], english: 'younger brother', gender: 'male',
    relativeAge: 'younger', side: 'own', respect: 3, dative: 'भावाला', genitive: 'भावाचे', inviteWithFamily: true,
  }),
  elderSister: T({
    term: 'ताई', variants: ['थोरली भगिनी', 'दीदी'], english: 'elder sister', gender: 'female',
    relativeAge: 'elder', side: 'own', respect: 5, dative: 'ताईला', genitive: 'ताईचे', inviteWithFamily: true,
  }),
  youngerSister: T({
    term: 'बहीण', variants: ['धाकटी भगिनी'], english: 'younger sister', gender: 'female',
    relativeAge: 'younger', side: 'own', respect: 3, dative: 'बहिणीला', genitive: 'बहिणीचे', inviteWithFamily: true,
  }),

  /* ---------------- paternal ---------------- */
  'father.father': T({
    term: 'आजोबा', variants: ['आजोबा (वडिलांचे वडील)'], english: 'paternal grandfather', gender: 'male',
    relativeAge: 'elder', side: 'paternal', respect: 5, dative: 'आजोबांना', genitive: 'आजोबांचे', inviteWithFamily: false,
  }),
  'father.mother': T({
    term: 'आजी', variants: ['आजी (वडिलांची आई)'], english: 'paternal grandmother', gender: 'female',
    relativeAge: 'elder', side: 'paternal', respect: 5, dative: 'आजीला', genitive: 'आजीचे', inviteWithFamily: false,
  }),
  'father.elderBrother': T({
    term: 'मोठे काका', variants: ['काका', 'थोरले काका'], english: "father's elder brother", gender: 'male',
    relativeAge: 'elder', side: 'paternal', respect: 5, dative: 'मोठ्या काकांना', genitive: 'मोठ्या काकांचे', inviteWithFamily: true,
  }),
  'father.youngerBrother': T({
    term: 'काका', variants: ['धाकटे काका'], english: "father's younger brother", gender: 'male',
    relativeAge: 'elder', side: 'paternal', respect: 4, dative: 'काकांना', genitive: 'काकांचे', inviteWithFamily: true,
  }),
  'father.elderSister': T({
    term: 'आत्या', variants: [], english: "father's sister", gender: 'female',
    relativeAge: 'elder', side: 'paternal', respect: 4, dative: 'आत्यांना', genitive: 'आत्यांचे', inviteWithFamily: true,
  }),
  'father.youngerSister': T({
    term: 'आत्या', variants: ['धाकट्या आत्या'], english: "father's younger sister", gender: 'female',
    relativeAge: 'elder', side: 'paternal', respect: 4, dative: 'आत्यांना', genitive: 'आत्यांचे', inviteWithFamily: true,
  }),
  'father.elderBrother.wife': T({
    term: 'मोठी काकू', variants: ['काकू', 'वहिनी'], english: "elder paternal uncle's wife", gender: 'female',
    relativeAge: 'elder', side: 'paternal', respect: 4, dative: 'मोठ्या काकूंना', genitive: 'मोठ्या काकूंचे', inviteWithFamily: false,
  }),
  'father.youngerBrother.wife': T({
    term: 'काकू', variants: [], english: "paternal uncle's wife", gender: 'female',
    relativeAge: 'elder', side: 'paternal', respect: 4, dative: 'काकूंना', genitive: 'काकूंचे', inviteWithFamily: false,
  }),
  'father.elderSister.husband': T({
    term: 'आतोबा', variants: ['आत्याभाऊ'], english: "father's sister's husband", gender: 'male',
    relativeAge: 'elder', side: 'paternal', respect: 4, dative: 'आतोबांना', genitive: 'आतोबांचे', inviteWithFamily: false,
  }),

  /* ---------------- maternal ---------------- */
  'mother.father': T({
    term: 'आजोबा', variants: ['आजोबा (आईचे वडील)'], english: 'maternal grandfather', gender: 'male',
    relativeAge: 'elder', side: 'maternal', respect: 5, dative: 'आजोबांना', genitive: 'आजोबांचे', inviteWithFamily: false,
  }),
  'mother.mother': T({
    term: 'आजी', variants: ['आजी (आईची आई)'], english: 'maternal grandmother', gender: 'female',
    relativeAge: 'elder', side: 'maternal', respect: 5, dative: 'आजीला', genitive: 'आजीचे', inviteWithFamily: false,
  }),
  'mother.brother': T({
    term: 'मामा', variants: ['मामा (आईचा भाऊ)'], english: "mother's brother", gender: 'male',
    relativeAge: 'elder', side: 'maternal', respect: 4, dative: 'मामांना', genitive: 'मामांचे', inviteWithFamily: true,
  }),
  'mother.elderBrother': T({
    term: 'मोठे मामा', variants: ['मामा'], english: "mother's elder brother", gender: 'male',
    relativeAge: 'elder', side: 'maternal', respect: 5, dative: 'मोठ्या मामांना', genitive: 'मोठ्या मामांचे', inviteWithFamily: true,
  }),
  'mother.youngerBrother': T({
    term: 'मामा', variants: ['धाकटे मामा'], english: "mother's younger brother", gender: 'male',
    relativeAge: 'elder', side: 'maternal', respect: 4, dative: 'मामांना', genitive: 'मामांचे', inviteWithFamily: true,
  }),
  'mother.brother.wife': T({
    term: 'मामी', variants: ['मामी (मामांची पत्नी)'], english: "mother's brother's wife", gender: 'female',
    relativeAge: 'elder', side: 'maternal', respect: 4, dative: 'मामींना', genitive: 'मामींचे', inviteWithFamily: false,
  }),
  'mother.sister': T({
    term: 'मावशी', variants: ['मौशी'], english: "mother's sister", gender: 'female',
    relativeAge: 'elder', side: 'maternal', respect: 4, dative: 'मावशींना', genitive: 'मावशींचे', inviteWithFamily: true,
  }),
  'mother.sister.husband': T({
    term: 'मावसा', variants: ['मावशीचे पती'], english: "mother's sister's husband", gender: 'male',
    relativeAge: 'elder', side: 'maternal', respect: 4, dative: 'मावसांना', genitive: 'मावसांचे', inviteWithFamily: false,
  }),

  /* ---------------- in-laws (सासर / माहेर) ---------------- */
  'husband.father': T({
    term: 'सासरे', variants: ['सासरे (पतीचे वडील)'], english: 'father-in-law', gender: 'male',
    relativeAge: 'elder', side: 'in-law', respect: 5, dative: 'सासऱ्यांना', genitive: 'सासऱ्यांचे', inviteWithFamily: false,
  }),
  'husband.mother': T({
    term: 'सासू', variants: ['सासूबाई'], english: 'mother-in-law', gender: 'female',
    relativeAge: 'elder', side: 'in-law', respect: 5, dative: 'सासूबाईंना', genitive: 'सासूबाईंचे', inviteWithFamily: false,
  }),
  'husband.elderBrother': T({
    term: 'मोठा दीर', variants: ['दादा'], english: 'elder brother-in-law (husband’s side)', gender: 'male',
    relativeAge: 'elder', side: 'in-law', respect: 5, dative: 'मोठ्या दीरांना', genitive: 'मोठ्या दीरांचे', inviteWithFamily: true,
  }),
  'husband.youngerBrother': T({
    term: 'दीर', variants: [], english: 'younger brother-in-law (husband’s side)', gender: 'male',
    relativeAge: 'younger', side: 'in-law', respect: 3, dative: 'दीराला', genitive: 'दीराचे', inviteWithFamily: true,
  }),
  'husband.elderSister': T({
    term: 'नणंद', variants: ['मोठी नणंद'], english: 'husband’s elder sister', gender: 'female',
    relativeAge: 'elder', side: 'in-law', respect: 4, dative: 'नणंदेला', genitive: 'नणंदेचे', inviteWithFamily: true,
  }),
  'husband.youngerSister': T({
    term: 'नणंद', variants: ['धाकटी नणंद'], english: 'husband’s younger sister', gender: 'female',
    relativeAge: 'younger', side: 'in-law', respect: 3, dative: 'नणंदेला', genitive: 'नणंदेचे', inviteWithFamily: true,
  }),
  'wife.father': T({
    term: 'सासरे', variants: ['सासरे (पत्नीचे वडील)'], english: 'father-in-law', gender: 'male',
    relativeAge: 'elder', side: 'in-law', respect: 5, dative: 'सासऱ्यांना', genitive: 'सासऱ्यांचे', inviteWithFamily: false,
  }),
  'wife.mother': T({
    term: 'सासू', variants: ['सासूबाई'], english: 'mother-in-law', gender: 'female',
    relativeAge: 'elder', side: 'in-law', respect: 5, dative: 'सासूबाईंना', genitive: 'सासूबाईंचे', inviteWithFamily: false,
  }),
  'wife.brother': T({
    term: 'मेहुणा', variants: ['मेहुणा भाऊ'], english: 'wife’s brother', gender: 'male',
    relativeAge: 'younger', side: 'affinal', respect: 3, dative: 'मेहुण्याला', genitive: 'मेहुण्याचे', inviteWithFamily: true,
  }),
  'wife.sister': T({
    term: 'मेहुणी', variants: [], english: 'wife’s sister', gender: 'female',
    relativeAge: 'same', side: 'affinal', respect: 3, dative: 'मेहुणीला', genitive: 'मेहुणीचे', inviteWithFamily: true,
  }),
  'wife.sister.husband': T({
    term: 'साडू', variants: [], english: 'wife’s sister’s husband', gender: 'male',
    relativeAge: 'same', side: 'affinal', respect: 2, dative: 'साडूला', genitive: 'साडूचे', inviteWithFamily: true,
  }),
  'husband.sister.husband': T({
    term: 'साडू', variants: [], english: 'husband’s sister’s husband', gender: 'male',
    relativeAge: 'same', side: 'affinal', respect: 2, dative: 'साडूला', genitive: 'साडूचे', inviteWithFamily: true,
  }),

  /* ---------------- children & grandchildren ---------------- */
  'son.wife': T({
    term: 'सून', variants: ['सूनबाई'], english: 'daughter-in-law', gender: 'female',
    relativeAge: 'younger', side: 'descendant', respect: 3, dative: 'सुनेला', genitive: 'सुनेचे', inviteWithFamily: false,
  }),
  'daughter.husband': T({
    term: 'जावई', variants: ['जावईसाहेब'], english: 'son-in-law', gender: 'male',
    relativeAge: 'younger', side: 'descendant', respect: 4, dative: 'जावयाला', genitive: 'जावयाचे', inviteWithFamily: false,
  }),
  'son.son': T({
    term: 'नातू', variants: [], english: 'grandson (son’s son)', gender: 'male',
    relativeAge: 'younger', side: 'descendant', respect: 2, dative: 'नातवाला', genitive: 'नातवाचे', inviteWithFamily: false,
  }),
  'son.daughter': T({
    term: 'नात', variants: ['नातवंड'], english: 'granddaughter (son’s daughter)', gender: 'female',
    relativeAge: 'younger', side: 'descendant', respect: 2, dative: 'नातीला', genitive: 'नातीचे', inviteWithFamily: false,
  }),
  'daughter.son': T({
    term: 'नातू', variants: [], english: 'grandson (daughter’s son)', gender: 'male',
    relativeAge: 'younger', side: 'descendant', respect: 2, dative: 'नातवाला', genitive: 'नातवाचे', inviteWithFamily: false,
  }),
  'daughter.daughter': T({
    term: 'नात', variants: [], english: 'granddaughter (daughter’s daughter)', gender: 'female',
    relativeAge: 'younger', side: 'descendant', respect: 2, dative: 'नातीला', genitive: 'नातीचे', inviteWithFamily: false,
  }),

  /* ---------------- nephew / niece ---------------- */
  'elderBrother.son': T({
    term: 'पुतण्या', variants: [], english: "brother's son", gender: 'male',
    relativeAge: 'younger', side: 'own', respect: 2, dative: 'पुतण्याला', genitive: 'पुतण्याचे', inviteWithFamily: false,
  }),
  'elderBrother.daughter': T({
    term: 'पुतणी', variants: [], english: "brother's daughter", gender: 'female',
    relativeAge: 'younger', side: 'own', respect: 2, dative: 'पुतणीला', genitive: 'पुतणीचे', inviteWithFamily: false,
  }),
  'youngerBrother.son': T({
    term: 'पुतण्या', variants: [], english: "brother's son", gender: 'male',
    relativeAge: 'younger', side: 'own', respect: 2, dative: 'पुतण्याला', genitive: 'पुतण्याचे', inviteWithFamily: false,
  }),
  'youngerBrother.daughter': T({
    term: 'पुतणी', variants: [], english: "brother's daughter", gender: 'female',
    relativeAge: 'younger', side: 'own', respect: 2, dative: 'पुतणीला', genitive: 'पुतणीचे', inviteWithFamily: false,
  }),
  'elderSister.son': T({
    term: 'भाचा', variants: [], english: "sister's son", gender: 'male',
    relativeAge: 'younger', side: 'own', respect: 2, dative: 'भाच्याला', genitive: 'भाच्याचे', inviteWithFamily: false,
  }),
  'elderSister.daughter': T({
    term: 'भाची', variants: [], english: "sister's daughter", gender: 'female',
    relativeAge: 'younger', side: 'own', respect: 2, dative: 'भाचीला', genitive: 'भाचीचे', inviteWithFamily: false,
  }),
  'youngerSister.son': T({
    term: 'भाचा', variants: [], english: "sister's son", gender: 'male',
    relativeAge: 'younger', side: 'own', respect: 2, dative: 'भाच्याला', genitive: 'भाच्याचे', inviteWithFamily: false,
  }),
  'youngerSister.daughter': T({
    term: 'भाची', variants: [], english: "sister's daughter", gender: 'female',
    relativeAge: 'younger', side: 'own', respect: 2, dative: 'भाचीला', genitive: 'भाचीचे', inviteWithFamily: false,
  }),

  /* ---------------- cousins ---------------- */
  'father.brother.son': T({
    term: 'चुलत भाऊ', variants: ['चुलत भाऊ (काकांचा मुलगा)'], english: 'paternal cousin brother', gender: 'male',
    relativeAge: 'same', side: 'paternal', respect: 3, dative: 'चुलत भावाला', genitive: 'चुलत भावाचे', inviteWithFamily: true,
  }),
  'father.brother.daughter': T({
    term: 'चुलत बहीण', variants: [], english: 'paternal cousin sister', gender: 'female',
    relativeAge: 'same', side: 'paternal', respect: 3, dative: 'चुलत बहिणीला', genitive: 'चुलत बहिणीचे', inviteWithFamily: true,
  }),
  'mother.brother.son': T({
    term: 'मामे भाऊ', variants: ['मामे भाऊ (मामांचा मुलगा)'], english: 'maternal cousin brother', gender: 'male',
    relativeAge: 'same', side: 'maternal', respect: 3, dative: 'मामे भावाला', genitive: 'मामे भावाचे', inviteWithFamily: true,
  }),
  'mother.brother.daughter': T({
    term: 'मामे बहीण', variants: [], english: 'maternal cousin sister', gender: 'female',
    relativeAge: 'same', side: 'maternal', respect: 3, dative: 'मामे बहिणीला', genitive: 'मामे बहिणीचे', inviteWithFamily: true,
  }),
  'father.sister.son': T({
    term: 'आते भाऊ', variants: ['आते भाऊ (आत्येकडचा भाऊ)'], english: 'paternal aunt’s son', gender: 'male',
    relativeAge: 'same', side: 'paternal', respect: 3, dative: 'आते भावाला', genitive: 'आते भावाचे', inviteWithFamily: true,
  }),
  'father.sister.daughter': T({
    term: 'आते बहीण', variants: [], english: 'paternal aunt’s daughter', gender: 'female',
    relativeAge: 'same', side: 'paternal', respect: 3, dative: 'आते बहिणीला', genitive: 'आते बहिणीचे', inviteWithFamily: true,
  }),
  'mother.sister.son': T({
    term: 'मावस भाऊ', variants: ['मावस भाऊ (मावशीकडचा भाऊ)'], english: 'maternal aunt’s son', gender: 'male',
    relativeAge: 'same', side: 'maternal', respect: 3, dative: 'मावस भावाला', genitive: 'मावस भावाचे', inviteWithFamily: true,
  }),
  'mother.sister.daughter': T({
    term: 'मावस बहीण', variants: [], english: 'maternal aunt’s daughter', gender: 'female',
    relativeAge: 'same', side: 'maternal', respect: 3, dative: 'मावस बहिणीला', genitive: 'मावस बहिणीचे', inviteWithFamily: true,
  }),
  'father.brother': T({
    term: 'काका', variants: ['चुलते'], english: "father's brother", gender: 'male',
    relativeAge: 'elder', side: 'paternal', respect: 4, dative: 'काकांना', genitive: 'काकांचे', inviteWithFamily: true,
  }),
  'mother.brother.wife.generic': T({
    term: 'मामी', variants: [], english: "mother's brother's wife", gender: 'female',
    relativeAge: 'elder', side: 'maternal', respect: 4, dative: 'मामींना', genitive: 'मामींचे', inviteWithFamily: false,
  }),

  /* ---------------- great grandparents ---------------- */
  'father.father.father': T({
    term: 'पणजोबा', variants: [], english: 'paternal great-grandfather', gender: 'male',
    relativeAge: 'elder', side: 'paternal', respect: 5, dative: 'पणजोबांना', genitive: 'पणजोबांचे', inviteWithFamily: false,
  }),
  'father.mother.mother': T({
    term: 'पणजी', variants: [], english: 'paternal great-grandmother', gender: 'female',
    relativeAge: 'elder', side: 'paternal', respect: 5, dative: 'पणजीला', genitive: 'पणजीचे', inviteWithFamily: false,
  }),
};

/** Non-family (social) relations used by the guest list. */
export const SOCIAL_RELATIONS: Record<string, TermSpec> = {
  friend: T({
    term: 'मित्र', variants: ['मित्र', 'स्नेही'], english: 'friend', gender: 'male',
    relativeAge: 'same', side: 'own', respect: 2, dative: 'मित्राला', genitive: 'मित्राचे', inviteWithFamily: true,
  }),
  friendFemale: T({
    term: 'मैत्रीण', variants: ['सखी'], english: 'friend (female)', gender: 'female',
    relativeAge: 'same', side: 'own', respect: 2, dative: 'मैत्रिणीला', genitive: 'मैत्रिणीचे', inviteWithFamily: true,
  }),
  guru: T({
    term: 'गुरुजी', variants: ['गुरुवर्य'], english: 'teacher / guru', gender: 'male',
    relativeAge: 'elder', side: 'own', respect: 5, dative: 'गुरुजींना', genitive: 'गुरुजींचे', inviteWithFamily: true,
  }),
  neighbour: T({
    term: 'शेजारी', variants: ['शेजारी (कुटुंब)'], english: 'neighbour', gender: 'male',
    relativeAge: 'same', side: 'own', respect: 3, dative: 'शेजाऱ्यांना', genitive: 'शेजाऱ्यांचे', inviteWithFamily: true,
  }),
  colleague: T({
    term: 'सहकारी', variants: [], english: 'colleague', gender: 'male',
    relativeAge: 'same', side: 'own', respect: 2, dative: 'सहकाऱ्याला', genitive: 'सहकाऱ्याचे', inviteWithFamily: false,
  }),
  doctor: T({
    term: 'डॉक्टर', variants: ['डॉ.'], english: 'doctor', gender: 'male',
    relativeAge: 'same', side: 'own', respect: 4, dative: 'डॉक्टरांना', genitive: 'डॉक्टरांचे', inviteWithFamily: true,
  }),
  relative: T({
    term: 'नातेवाईक', variants: ['स्नेहजन'], english: 'relative', gender: 'male',
    relativeAge: 'same', side: 'own', respect: 3, dative: 'नातेवाईकांना', genitive: 'नातेवाईकांचे', inviteWithFamily: true,
  }),
};

export const KINSHIP_TERM_COUNT = Object.keys(TERMS).length + Object.keys(SOCIAL_RELATIONS).length;

/**
 * Resolve a kinship path into the term a Marathi family actually uses.
 * Falls back to an explicit descriptive construction so we never invent a word.
 */
/**
 * Sibling edges appear in the term table both with and without an age qualifier
 * (`father.elderSister` vs `mother.sister`). These aliases let callers pass
 * whichever form their UI produced and still get the right term — with the
 * age-appropriate reading tried first.
 */
const SIBLING_ALIASES: Record<string, string[]> = {
  elderBrother: ['elderBrother', 'brother', 'youngerBrother'],
  youngerBrother: ['youngerBrother', 'brother', 'elderBrother'],
  brother: ['brother', 'youngerBrother', 'elderBrother'],
  elderSister: ['elderSister', 'sister', 'youngerSister'],
  youngerSister: ['youngerSister', 'sister', 'elderSister'],
  sister: ['sister', 'elderSister', 'youngerSister'],
};

export function resolveKinship(path: RelationEdge[] | string): KinshipTerm | null {
  const key = Array.isArray(path) ? path.join('.') : path;
  const spec = TERMS[key] ?? SOCIAL_RELATIONS[key];
  if (spec) return { path: key, ...spec };

  const parts = key.split('.');

  // Shortcut resolution: father.brother === father.youngerBrother (default assumption)
  if (parts.length === 2 && parts[0] === 'father' && parts[1] === 'brother') {
    return resolveKinship('father.youngerBrother');
  }
  if (parts.length === 2 && parts[0] === 'mother' && parts[1] === 'brother') {
    return resolveKinship('mother.youngerBrother');
  }

  // Age-qualifier aliasing for any path whose second hop is a sibling.
  const second = parts[1];
  const alternatives = second ? SIBLING_ALIASES[second] : undefined;
  if (alternatives) {
    for (const alternative of alternatives) {
      const candidate = [parts[0], alternative, ...parts.slice(2)].join('.');
      if (candidate === key) continue;
      const found = TERMS[candidate] ?? SOCIAL_RELATIONS[candidate];
      if (found) return { path: candidate, ...found };
    }
  }

  return null;
}

/**
 * Human readable Marathi description of any path — including paths the term
 * table does not know, e.g. `father.mother.father` → "वडिलांच्या आईचे वडील".
 * Used for the "आपले …" sentence on invitations.
 */
export function describeKinshipPath(path: RelationEdge[] | string): string {
  const edges = (Array.isArray(path) ? path : path.split('.')) as RelationEdge[];
  const resolved = resolveKinship(edges);
  const descriptive = edges
    .map((edge, index) => {
      const label = RELATION_EDGE_LABELS[edge] ?? edge;
      if (index === 0) {
        const first = `${label}${label.endsWith('ई') || label.endsWith('ी') ? 'ंचे' : 'चे'}`;
        return (edge === 'father' || edge === 'mother') ? `${label.replace(/ल$/, 'लां').replace(/ई$/, 'ईं')}चे` : first;
      }
      return label;
    })
    .join(' → ');
  if (resolved) return resolved.term;
  return descriptive;
}

/** "…यांना" form for invitations: "काकांना व काकूंना". */
export function dativeOf(term: KinshipTerm): string {
  return term.dative;
}

/** Respect-aware imperative used when asking guests to attend. */
export function requestLine(respect: number): string {
  return respect >= 4
    ? 'आपण सस्नेह उपस्थित राहावे ही विनंती.'
    : 'आपल्या उपस्थितीची मनःपूर्वक अपेक्षा आहे.';
}

/** Combine a couple's two dative forms: "काकांना व काकूंना". */
export function coupleDative(a: KinshipTerm | null, b: KinshipTerm | null): string {
  if (a && b) return `${a.dative} व ${b.dative}`;
  if (a) return a.dative;
  if (b) return b.dative;
  return '';
}

/**
 * Relative address lookup for the family tree UI: given a "self" person, list
 * every relative reachable in ≤ 3 edges with the correct Marathi term.
 */
export function kinshipIndex(maxDepth = 3): Array<{ path: string; term: string; depth: number }> {
  return Object.entries(TERMS)
    .map(([path, spec]) => ({ path, term: spec.term, depth: path.split('.').length }))
    .filter((row) => row.depth <= maxDepth)
    .sort((a, b) => a.depth - b.depth || a.term.localeCompare(b.term));
}
