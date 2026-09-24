import { describe, expect, it } from 'vitest';

import {
  budgetFromTemplate, composeBiodata, composeInvitation, describeKinshipPath, formatMarathiCurrency,
  formatMarathiDate, formatMarathiTime, formatPersonName, groupIndian, kinshipIndex, lintMarathiText,
  marathiOrdinalWord, moneyToMarathiWords, numberToMarathiWords, planFromTemplate, resolveKinship,
  salutationFor, toDevanagariDigits, transliterate,
} from './index.js';
import type { Person } from './person.js';

describe('marathi/a1 numerals', () => {
  it('converts digits to Devanagari', () => {
    expect(toDevanagariDigits('2026-09-24')).toBe('२०२६-०९-२४');
  });

  it('groups numbers the Indian way', () => {
    expect(groupIndian(150000)).toBe('1,50,000');
    expect(groupIndian(12345678)).toBe('1,23,45,678');
    expect(groupIndian(999)).toBe('999');
  });

  it('writes cardinal words using lakh/crore', () => {
    expect(numberToMarathiWords(0)).toBe('शून्य');
    expect(numberToMarathiWords(21)).toBe('एकवीस');
    expect(numberToMarathiWords(1000)).toBe('एक हजार');
    expect(numberToMarathiWords(150000)).toBe('एक लाख पन्नास हजार');
  });

  it('handles colloquial money magnitudes', () => {
    expect(moneyToMarathiWords(150000)).toBe('दीड लाख');
    expect(moneyToMarathiWords(125000)).toBe('सव्वा लाख');
    expect(formatMarathiCurrency(150000, { words: true })).toBe('दीड लाख रुपये');
    expect(formatMarathiCurrency(150000)).toBe('₹१,५०,०००');
  });

  it('builds Marathi ordinals', () => {
    expect(marathiOrdinalWord(2)).toBe('दुसरा');
    expect(marathiOrdinalWord(2, 'f')).toBe('दुसरी');
    expect(marathiOrdinalWord(12)).toBe('बारावा');
  });
});

describe('marathi/datetime', () => {
  it('formats dates in Marathi', () => {
    expect(formatMarathiDate('2026-12-12', 'long')).toBe('१२ डिसेंबर २०२६');
    expect(formatMarathiDate('2026-12-12', 'full')).toBe('शनिवार, १२ डिसेंबर २०२६');
  });

  it('uses Marathi clock conventions', () => {
    expect(formatMarathiTime('2026-12-12T10:42:00Z')).toBe('सकाळी १०:४२');
    expect(formatMarathiTime('2026-12-12T18:05:00Z')).toBe('संध्याकाळी ६:०५');
    expect(formatMarathiTime('2026-12-12T00:10:00Z')).toBe('रात्री १२:१०');
  });
});

describe('marathi/kinship', () => {
  it('resolves the terms a Marathi family actually uses', () => {
    expect(resolveKinship(['father', 'youngerBrother'])?.term).toBe('काका');
    expect(resolveKinship(['father', 'elderBrother'])?.term).toBe('मोठे काका');
    expect(resolveKinship(['father', 'elderSister'])?.term).toBe('आत्या');
    expect(resolveKinship(['father', 'elderSister', 'husband'])?.term).toBe('आतोबा');
    expect(resolveKinship(['mother', 'youngerBrother'])?.term).toBe('मामा');
    expect(resolveKinship(['mother', 'elderSister'])?.term).toBe('मावशी');
    expect(resolveKinship(['husband', 'mother'])?.term).toBe('सासू');
    expect(resolveKinship(['husband', 'youngerBrother'])?.term).toBe('दीर');
    expect(resolveKinship(['wife', 'elderSister'])?.term).toBe('मेहुणी');
    expect(resolveKinship(['elderSister', 'son'])?.term).toBe('भाचा');
    expect(resolveKinship(['daughter', 'husband'])?.term).toBe('जावई');
    expect(resolveKinship(['son', 'wife'])?.term).toBe('सून');
    expect(resolveKinship(['father', 'father'])?.term).toBe('आजोबा');
  });

  it('carries respect levels and dative forms for sentence building', () => {
    const kaka = resolveKinship(['father', 'youngerBrother']);
    expect(kaka?.respect).toBe(4);
    expect(kaka?.dative).toBe('काकांना');
    expect(kaka?.inviteWithFamily).toBe(true);
  });

  it('knows a broad relation vocabulary', () => {
    expect(kinshipIndex(3).length).toBeGreaterThan(50);
  });

  it('describes unknown paths instead of inventing words', () => {
    expect(describeKinshipPath(['father', 'mother', 'father'])).toBeTruthy();
  });
});

describe('marathi/person honorifics', () => {
  const married: Person = { name: 'अनिता', surname: 'पाटील', gender: 'female', maritalStatus: 'married' };
  const unmarried: Person = { name: 'स्नेहा', surname: 'पाटील', gender: 'female', maritalStatus: 'unmarried' };
  const male: Person = { name: 'रमेश', surname: 'पाटील', gender: 'male' };

  it('picks सौ./कु./श्री. correctly', () => {
    expect(salutationFor(married)).toBe('सौ.');
    expect(salutationFor(unmarried)).toBe('कु.');
    expect(salutationFor(male)).toBe('श्री.');
    expect(formatPersonName(married)).toBe('सौ. अनिता पाटील');
    expect(formatPersonName(male)).toBe('श्री. रमेश पाटील');
  });

  it('respects academic titles and deceased prefixes', () => {
    expect(salutationFor({ name: 'सुनील', gender: 'male', titles: ['डॉ.'] })).toBe('डॉ.');
    expect(salutationFor({ name: 'रामू', gender: 'male', isDeceased: true })).toBe('स्व.');
  });
});

describe('marathi/invitation composer', () => {
  const bride: Person = { name: 'स्नेहा', surname: 'पाटील', gender: 'female', maritalStatus: 'unmarried' };
  const groom: Person = { name: 'अमोल', surname: 'जोशी', gender: 'male' };
  const father: Person = { name: 'रमेश', surname: 'पाटील', gender: 'male' };
  const mother: Person = { name: 'अनिता', surname: 'पाटील', gender: 'female', maritalStatus: 'married' };

  it('composes a wedding invitation with correct sentence direction', () => {
    const result = composeInvitation({
      eventType: 'wedding',
      hosts: [father, mother],
      bride,
      groom,
      side: 'bride',
      date: '2026-12-12T00:00:00Z',
      startTime: '2026-12-12T05:12:00Z',
      muhuratLabel: 'सकाळी १०:४२ ते ११:०५',
      venue: { name: 'श्री छत्रपती शिवाजी सभागृह', city: 'पुणे' },
      contacts: [{ name: 'रमेश पाटील', phone: '9822012345' }],
      rsvp: { whatsapp: '9822012345' },
    });

    expect(result.invocation).toBe('॥ श्री गणेशाय नमः ॥');
    expect(result.headline).toBe('॥ शुभ विवाह ॥');
    const body = result.lines.map((l) => l.text).join('\n');
    expect(body).toContain('श्री. रमेश पाटील व सौ. अनिता पाटील');
    expect(body).toContain('यांची सुपुत्री कु. स्नेहा पाटील हिचा');
    expect(body).toContain('श्री. अमोल जोशी याच्याशी');
    expect(body).toContain('विवाह शनिवार, १२ डिसेंबर २०२६');
    expect(result.request).toContain('आशीर्वाद');
    expect(result.details.find((d) => d.label === 'मुहूर्त')?.value).toContain('१०:४२');
    expect(result.plainText).toContain('॥ श्री गणेशाय नमः ॥');
    expect(result.whatsappText).toContain('स्नेहा');
    expect(result.quality.score).toBeGreaterThan(70);
  });

  it('flips the sentence for the groom side', () => {
    const result = composeInvitation({
      eventType: 'wedding', hosts: [father], bride, groom, side: 'groom',
      date: '2026-12-12T00:00:00Z', venue: { name: 'सभागृह', city: 'पुणे' },
    });
    const body = result.lines.map((l) => l.text).join('\n');
    expect(body).toContain('यांचा सुपुत्र श्री. अमोल जोशी याचा');
    expect(body).toContain('कु. स्नेहा पाटील हिच्याशी');
  });

  it('composes a birthday invitation with ordinal age', () => {
    const child: Person = { name: 'अथर्व', surname: 'पाटील', gender: 'male' };
    const result = composeInvitation({
      eventType: 'birthday', hosts: [father, mother], celebrant: child, celebrantAge: 2,
      date: '2026-10-05T00:00:00Z', startTime: '2026-10-05T12:30:00Z',
      venue: { name: 'गोकुळ केक शॉप', city: 'पुणे' },
    });
    const body = result.lines.map((l) => l.text).join('\n');
    expect(body).toContain('दुसरा वाढदिवस');
    expect(body).toContain('अथर्वला');
  });

  it('composes a gruhapravesh invitation with puja framing', () => {
    const result = composeInvitation({
      eventType: 'gruhapravesh', hosts: [father, mother],
      date: '2026-11-20T00:00:00Z', startTime: '2026-11-20T03:30:00Z',
      venue: { name: 'साई कृपा, फ्लॅट ५०२', city: 'पिंपरी' },
      panchang: { tithi: 10, paksha: 0, nakshatra: 21, sunrise: 'सकाळी ६:२४' },
    });
    expect(result.headline).toContain('गृहप्रवेश');
    expect(result.lines.map((l) => l.text).join(' ')).toContain('वास्तुशांती');
    expect(result.panchangLines.join(' ')).toContain('नक्षत्र');
  });

  it('runs quality checks and flags missing data without failing hard', () => {
    const result = composeInvitation({
      eventType: 'wedding', hosts: [], date: '2020-01-01T00:00:00Z',
      venue: { name: '', city: '' },
    });
    const statuses = Object.fromEntries(result.quality.checks.map((c) => [c.id, c.status]));
    expect(statuses.hosts).toBe('fail');
    expect(statuses.couple).toBe('fail');
    expect(result.quality.score).toBeLessThan(60);
  });

  it('keeps narrative lines inside the print text box (Smart Layout guard)', () => {
    const longName = { name: 'सुप्रिया', surname: 'देशमुख-कुलकर्णी-परांजपे', gender: 'female' as const };
    const result = composeInvitation({
      eventType: 'wedding',
      hosts: [{ name: 'रमेश', surname: 'देशमुख-कुलकर्णी-परांजपे', gender: 'male' }],
      bride: longName,
      groom: { name: 'अमोल', surname: 'जोशी', gender: 'male' },
      date: '2026-12-12T00:00:00Z',
      venue: { name: 'श्री छत्रपती शिवाजी महाराज स्मारक सभागृह, शिवाजीनगर', city: 'पुणे' },
      english: true,
    });
    expect(result.quality.suggestedFontSize).toBeLessThanOrEqual(16);
    expect(result.englishText).toContain('Wedding');
  });
});

describe('marathi/lint & layout', () => {
  it('detects Latin text and spacing issues', () => {
    expect(lintMarathiText('Ramesh Patil यांचे')).toContain('मजकुरात इंग्रजी शब्द आढळला — मराठी शब्दलेखन तपासा.');
    expect(lintMarathiText('दोन  जागा')).toContain('अतिरिक्त जागा (double space) आढळली.');
    expect(lintMarathiText('शुद्ध मराठी वाक्य.')).toHaveLength(0);
  });

  it('keeps the danda convention intact', () => {
    expect(lintMarathiText('॥ श्री गणेशाय नमः ॥')).toHaveLength(0);
  });
});

describe('marathi/event taxonomy', () => {
  it('splits a budget by the event template', () => {
    const lines = budgetFromTemplate('wedding', 1000000);
    expect(lines.length).toBeGreaterThan(10);
    const total = lines.reduce((s, l) => s + l.estimated, 0);
    expect(total).toBeGreaterThan(900000);
    expect(total).toBeLessThan(1100000);
    expect(lines.find((l) => l.category === 'venue')?.estimated).toBe(300000);
  });

  it('generates a dated task plan', () => {
    const tasks = planFromTemplate('birthday', '2026-10-05T00:00:00Z');
    expect(tasks.length).toBeGreaterThan(5);
    expect(tasks.some((t) => t.critical)).toBe(true);
    expect(tasks.every((t) => t.dueDate <= '2026-10-05')).toBe(true);
  });
});

describe('marathi/biodata', () => {
  it('composes a private biodata document with quality checks', () => {
    const result = composeBiodata({
      subject: { name: 'स्नेहा', surname: 'पाटील', gender: 'female', maritalStatus: 'unmarried' },
      dob: '1998-04-12T00:00:00Z',
      birthPlace: 'पुणे',
      birthTime: 'सकाळी ६:१५',
      rashi: 'वृषभ',
      nakshatra: 'रोहिणी',
      heightCm: 160,
      education: [{ degree: 'बी.ई. संगणक', institute: 'पुणे विद्यापीठ', year: 2020 }],
      occupation: { title: 'सॉफ्टवेअर अभियंता', company: 'माहिती तंत्रज्ञान कंपनी', since: 2020 },
      family: [
        { relation: 'वडील', name: 'श्री. रमेश पाटील', occupation: 'व्यवसाय' },
        { relation: 'आई', name: 'सौ. अनिता पाटील', occupation: 'गृहिणी' },
      ],
      hobbies: ['वाचन', 'चित्रकला'],
      contact: { phone: '9822012345' },
    });
    expect(result.title).toBe('वैवाहिक माहिती पत्रक');
    expect(result.meta.privacy).toBe('private-link-only');
    expect(result.sections.map((s) => s.key)).toContain('education');
    expect(result.quality.score).toBeGreaterThan(60);
    expect(result.plainText).toContain('नक्षत्र: रोहिणी');
  });
});

describe('marathi/transliteration', () => {
  it('uses the curated dictionary first', () => {
    const r = transliterate('Ramesh Patil');
    expect(r.output).toBe('रमेश पाटील');
    expect(r.confidence).toBe(100);
  });

  it('flags low-confidence tokens for review instead of guessing silently', () => {
    const r = transliterate('Sneha Kulkarni');
    expect(r.output).toBe('स्नेहा कुलकर्णी');
    expect(r.needsReview.length).toBe(0);
    const gn = transliterate('Xyzzyq');
    expect(gn.tokens.some((t) => t.needsReview)).toBe(true);
  });

  it('passes Devanagari through untouched', () => {
    expect(transliterate('पुणे').output).toBe('पुणे');
  });
});
