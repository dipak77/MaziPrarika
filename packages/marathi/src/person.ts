/**
 * Person model, Marathi honorifics (श्री. / सौ. / कु.) and name formatting.
 *
 * Honorifics are a real correctness issue on printed invitations: calling a
 * married woman "कु." or an unmarried girl "सौ." is a visible social error.
 * The rules here encode the conventions used across Maharashtra.
 */

import type { RelationEdge } from './kinship.js';

export type PersonGender = 'male' | 'female' | 'other';
export type MaritalStatus = 'unmarried' | 'married' | 'widowed' | 'unknown';
export type Salutation = 'श्री.' | 'सौ.' | 'कु.' | 'श्रीमती' | 'डॉ.' | 'अॅड.' | 'प्रा.' | 'मा.' | 'स्व.' | '';

export interface Person {
  id?: string;
  /** Full name as it should appear in print (without honorific). */
  name: string;
  /** Optional middle name / father's name (used by Maharashtra convention). */
  middleName?: string;
  surname?: string;
  gender?: PersonGender;
  maritalStatus?: MaritalStatus;
  /** Academic / professional titles, e.g. ['डॉ.', 'इंजि.']. */
  titles?: string[];
  /** Family relations expressed as edges from the invitation host. */
  relationPath?: RelationEdge[];
  /** Free-text Marathi relation label - highest precedence. */
  relationLabel?: string;
  /** Village / town (used by "गाव" convention in interior Maharashtra). */
  village?: string;
  /** आदरार्थी suffix, e.g. "साहेब", "मॅडम". */
  honorificSuffix?: string;
  /** For the deceased: printed as "स्व. …" and remembered in the invitation. */
  isDeceased?: boolean;
  phone?: string;
  photoUrl?: string;
}

export interface HonorificOptions {
  /** Force a specific salutation, bypassing the rules. */
  force?: Salutation;
  /** Drop the honorific entirely (used in running prose, not letterheads). */
  omit?: boolean;
  /** Print style: `formal` = श्री./सौ., `respectful` = श्रीमती for elders. */
  register?: 'formal' | 'respectful';
  /** Age hint helps pick सौ. vs श्रीमती / कु. vs सौ. */
  age?: number;
}

/** Choose the correct Marathi salutation for a person. */
export function salutationFor(person: Person, options: HonorificOptions = {}): Salutation {
  const { force, omit, register = 'formal', age } = options;
  if (omit) return '';
  if (force !== undefined) return force;

  const titles = person.titles ?? [];
  if (titles.some((t) => /^डॉ/.test(t))) return 'डॉ.';
  if (titles.some((t) => /^(अॅड|अॅडव्होकेट|वकील)/.test(t))) return 'अॅड.';
  if (titles.some((t) => /^(प्रा|प्राध्यापक)/.test(t))) return 'प्रा.';

  if (person.isDeceased) return 'स्व.';
  if (person.gender === 'male') return 'श्री.';
  if (person.gender === 'female') {
    if (person.maritalStatus === 'married' || person.maritalStatus === 'widowed') {
      return register === 'respectful' || (age !== undefined && age >= 45) ? 'श्रीमती' : 'सौ.';
    }
    if (person.maritalStatus === 'unmarried') return 'कु.';
    return 'सौ.';
  }
  return '';
}

/** "श्री. रमेश पाटील" — the print-ready name. */
export function formatPersonName(person: Person, options: HonorificOptions = {}): string {
  const salutation = salutationFor(person, options);
  const parts = [person.name, person.middleName, person.surname].filter(Boolean) as string[];
  const base = parts.join(' ').trim();
  const withVillage = person.village && !/गावकर$/.test(base) ? `${base} (${person.village})` : base;
  const suffix = person.honorificSuffix ? ` ${person.honorificSuffix}` : '';
  return [salutation, withVillage + suffix].filter(Boolean).join(' ').trim();
}

/** "श्री. रमेश पाटील यांना" / "सौ. अनिता पाटील यांना". */
export function formatPersonDative(person: Person, options: HonorificOptions = {}): string {
  return `${formatPersonName(person, options)} यांना`;
}

/** "श्री. रमेश पाटील व सौ. अनिता पाटील" — a host couple line. */
export function formatCouple(a: Person, b: Person, options: HonorificOptions = {}): string {
  return `${formatPersonName(a, options)} व ${formatPersonName(b, options)}`;
}

/** "श्री. रमेश पाटील यांची सुपुत्री कु. स्नेहा पाटील" */
export function describeChild(parent: Person, child: Person, relation: 'daughter' | 'son'): string {
  const possessive = personPossessive(parent);
  const childWord = relation === 'daughter' ? 'सुपुत्री' : 'सुपुत्र';
  return `${possessive} ${childWord} ${formatPersonName(child)}`;
}

/** "श्री. रमेश पाटील यांचे" (animate masculine genitive). */
export function personPossessive(person: Person, options: HonorificOptions = {}): string {
  const name = formatPersonName(person, options);
  return `${name} यांचे`;
}

export function isMinor(age: number): boolean {
  return age < 18;
}

/** Initials-friendly short name for lists and badges: "रमेश पाटील". */
export function shortName(person: Person): string {
  return [person.name, person.surname].filter(Boolean).join(' ');
}
