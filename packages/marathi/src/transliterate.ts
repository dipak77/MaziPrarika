/**
 * Offline Roman → Devanagari transliteration.
 *
 * Indian name romanisation is genuinely ambiguous ("Patil" = पाटील, "Ganesh" =
 * गणेश — the same letter `a`), so this engine is deliberately layered:
 *
 *   1. a curated dictionary of Maharashtrian names, surnames, towns and words
 *      (deterministic, reviewed);
 *   2. a rule engine for everything else, using ITRANS-style digraphs;
 *   3. per-token confidence so the UI can ask the user to confirm, and the
 *      AI adapter can be consulted only for the low-confidence tokens.
 *
 * Nothing here silently guesses: every token comes back with a confidence
 * level and a `needsReview` flag.
 */

export type TransliterationConfidence = 'high' | 'medium' | 'low';

export interface TransliteratedToken {
  source: string;
  devanagari: string;
  confidence: TransliterationConfidence;
  /** 'dictionary' when a curated entry matched, otherwise 'rules'. */
  source_kind: 'dictionary' | 'rules';
  needsReview: boolean;
}

export interface TransliterationResult {
  input: string;
  output: string;
  tokens: TransliteratedToken[];
  /** 0–100 — share of tokens that did not need review. */
  confidence: number;
  needsReview: string[];
}

/** Curated, reviewed Marathi vocabulary — names first. */
export const TRANSLITERATION_DICTIONARY: Record<string, string> = {
  /* male given names */
  ramesh: 'रमेश', suresh: 'सुरेश', mahesh: 'महेश', rajesh: 'राजेश', nilesh: 'नीलेश',
  amol: 'अमोल', amit: 'अमित', anil: 'अनिल', sunil: 'सुनील', sanjay: 'संजय',
  vijay: 'विजय', ajay: 'अजय', ashok: 'अशोक', arun: 'अरुण', atul: 'अतुल',
  prashant: 'प्रशांत', prasad: 'प्रसाद', prakash: 'प्रकाश', pankaj: 'पंकज',
  milind: 'मिलिंद', makarand: 'मकरंद', mangesh: 'मंगेश', mandar: 'मंदार', nikhil: 'निखिल',
  ninad: 'निनाद', niranjan: 'निरंजन', omkar: 'ओंकार', onkar: 'ओंकार', pradip: 'प्रदीप',
  rahul: 'राहुल', ravi: 'रवी', ravindra: 'रविंद्र', sachin: 'सचिन', sameer: 'समीर',
  sandeep: 'संदीप', shrikant: 'श्रीकांत', shubham: 'शुभम', sidharth: 'सिद्धार्थ',
  swapnil: 'स्वप्निल', tejas: 'तेजस', tushar: 'तुषार', vaibhav: 'वैभव', varad: 'वरद',
  vishal: 'विशाल', yash: 'यश', yogesh: 'योगेश', ganesh: 'गणेश', dinesh: 'दिनेश',
  girish: 'गिरीश', harish: 'हरीश', jagdish: 'जगदीश', kamlesh: 'कमलेश', mukesh: 'मुकेश',
  naresh: 'नरेश', parag: 'पराग', rakesh: 'राकेश', satish: 'सतीश', shailesh: 'शैलेश',
  vasant: 'वसंत', vinay: 'विनय', vishwas: 'विश्वास', abhijit: 'अभिजित', aditya: 'आदित्य',
  akash: 'आकाश', amey: 'अमेय', aniket: 'अनिकेत', atharva: 'अथर्व', avinash: 'अविनाश',
  bhushan: 'भूषण', chetan: 'चेतन', devendra: 'देवेंद्र', dhananjay: 'धनंजय', gajanan: 'गजानन',
  harshad: 'हर्षद', hemant: 'हेमंत', jayesh: 'जयेश', kalpesh: 'कल्पेश', kiran: 'किरण',
  krishna: 'कृष्णा', lalit: 'ललित', madhav: 'माधव', manoj: 'मनोज', mihir: 'मिहिर',
  narendra: 'नरेंद्र', nikhilesh: 'निखिलेश', pramod: 'प्रमोद', rajendra: 'राजेंद्र',
  sarang: 'सारंग', shantanu: 'शांतनु', sudhir: 'सुधीर', suhas: 'सुहास',
  sagar: 'सागर', tapan: 'तपन', uday: 'उदय', vivek: 'विवेक', yatin: 'यतीन',

  /* female given names */
  sneha: 'स्नेहा', priya: 'प्रिया', anita: 'अनिता', archana: 'अर्चना', ashwini: 'अश्विनी',
  aarti: 'आरती', arti: 'आरती', anuja: 'अनुजा', anjali: 'अंजली', apurva: 'अपूर्वा',
  bhavana: 'भावना', chaitali: 'चैताली', deepali: 'दीपाली', dipali: 'दीपाली', dhanashree: 'धनश्री',
  gauri: 'गौरी', gayatri: 'गायत्री', hemangi: 'हेमांगी', isha: 'ईशा', jayashree: 'जयश्री',
  kalpana: 'कल्पना', kavita: 'कविता', ketaki: 'केतकी', kirti: 'कीर्ती', komal: 'कोमल',
  lina: 'लीना', madhuri: 'माधुरी', malvika: 'मालविका', manasi: 'मनसी', manisha: 'मनीषा',
  meera: 'मीरा', mira: 'मीरा', mrunal: 'मृणाल', neha: 'नेहा', nisha: 'निशा',
  pallavi: 'पल्लवी', puja: 'पूजा', prajakta: 'प्राजक्ता', purnima: 'पूर्णिमा',
  radhika: 'राधिका', rasika: 'रसिका', rachana: 'रचना', samruddhi: 'समृद्धी', sanika: 'सानिका',
  sarika: 'सारिका', sayali: 'सायली', shalini: 'शालिनी', sharvari: 'शर्वरी', shital: 'शीतल',
  sheetal: 'शीतल', shruti: 'श्रुती', shweta: 'श्वेता', snehal: 'स्नेहल', supriya: 'सुप्रिया',
  swati: 'स्वाती', tanvi: 'तन्वी', tejaswini: 'तेजस्विनी', trisha: 'त्रिशा', urmila: 'उर्मिला',
  vaishali: 'वैशाली', vandana: 'वंदना', veda: 'वेदा', vidya: 'विद्या', yashashree: 'यशश्री',
  snehalata: 'स्नेहलता', sunita: 'सुनीता', sheela: 'शीला', shila: 'शीला', sushma: 'सुषमा',
  vaidehi: 'वैदेही', yogita: 'योगिता', sanjana: 'संजना', rupali: 'रूपाली', rutuja: 'ऋतुजा',

  /* surnames */
  patil: 'पाटील', deshpande: 'देशपांडे', joshi: 'जोशी', kulkarni: 'कुलकर्णी', jadhav: 'जाधव',
  shinde: 'शिंदे', pawar: 'पवार', gaikwad: 'गायकवाड', sawant: 'सावंत', naik: 'नाईक',
  chavan: 'चव्हाण', kadam: 'कदम', kamble: 'कांबळे', salunkhe: 'साळुंखे', mane: 'माने',
  more: 'मोरे', bhagat: 'भगत', chougule: 'चौगुले', dalvi: 'दळवी', deshmukh: 'देशमुख',
  desai: 'देसाई', ghadge: 'घाडगे', gore: 'गोरे', gujar: 'गुजर', ingle: 'इंगळे',
  jagtap: 'जगताप', kale: 'काळे', karve: 'कर्वे', khedkar: 'खेडकर', kokate: 'कोकाटे',
  landge: 'लांडगे', lokhande: 'लोखंडे', mahajan: 'महाजन', mandlik: 'मंडलिक', mhatre: 'म्हात्रे',
  nikam: 'निकम', palkar: 'पालकर', pandit: 'पंडित', phadke: 'फडके', pingle: 'पिंगळे',
  raut: 'राऊत', sable: 'साबळे', sabnis: 'सबनीस', sathe: 'साठे', shelar: 'शेलार',
  sonawane: 'सोनवणे', tambe: 'तांबे', thakur: 'ठाकूर', thorat: 'थोरात', tilak: 'टिळक',
  vaidya: 'वैद्य', wagh: 'वाघ', yadav: 'यादव', patel: 'पटेल', agarwal: 'अग्रवाल',
  bhosale: 'भोसले', bhosle: 'भोसले', dandekar: 'दांडेकर', date: 'दाते',
  gokhale: 'गोखले', hardikar: 'हर्दिकर', joglekar: 'जोगळेकर', kane: 'काणे', limaye: 'लिमये',
  marathe: 'मराठे', paranjape: 'परांजपे', ranade: 'रानडे', sabane: 'सबाने', shanbhag: 'शानभाग',
  shedge: 'शेडगे', tapase: 'तापसे', vaze: 'वाझे', velankar: 'वेलणकर', sarnaik: 'सरनाईक',
  shirke: 'शिर्के', chaudhari: 'चौधरी', chaudhary: 'चौधरी', ghule: 'घुले', gunjal: 'गुंजाळ',
  honrao: 'होनराव', jain: 'जैन', kanade: 'कानडे', khatri: 'खत्री', kolhe: 'कोल्हे',
  mangal: 'मंगळ', misal: 'मिसाळ', nagpure: 'नागपुरे', patange: 'पटांगे', rane: 'राणे',
  shah: 'शहा', sharma: 'शर्मा', shenoy: 'शेनॉय', singh: 'सिंग', sonar: 'सोनार',
  suryawanshi: 'सूर्यवंशी', todi: 'तोडी', tupe: 'तुपे', ubale: 'उबाळे', waghmare: 'वाघमारे',

  /* places */
  pune: 'पुणे', mumbai: 'मुंबई', nashik: 'नाशिक', nagpur: 'नागपूर', thane: 'ठाणे',
  kolhapur: 'कोल्हापूर', satara: 'सातारा', sangli: 'सांगली', solapur: 'सोलापूर',
  aurangabad: 'औरंगाबाद', chhatrapatisambhajinagar: 'छत्रपती संभाजीनगर', pimpri: 'पिंपरी',
  chinchwad: 'चिंचवड', pcmc: 'पिं.चि.म.न.', lonavala: 'लोणावळा', maharashtra: 'महाराष्ट्र',
  baramati: 'बारामती', shirur: 'शिरूर', junnar: 'जुन्नर', wai: 'वाई', karad: 'कराड',
  ichalkaranji: 'इचलकरंजी', ahmadnagar: 'अहमदनगर', ahmednagar: 'अहमदनगर', latur: 'लातूर',
  jalgaon: 'जळगाव', amravati: 'अमरावती', akola: 'अकोला', nanded: 'नांदेड',

  /* common words used in event data */
  shubh: 'शुभ', vivah: 'विवाह', lagna: 'लग्न', muhurt: 'मुहूर्त', muhurta: 'मुहूर्त',
  gruhapravesh: 'गृहप्रवेश', grihapravesh: 'गृहप्रवेश', namkaran: 'नामकरण', naming: 'नामकरण',
  vadhdivas: 'वाढदिवस', birthday: 'वाढदिवस', satyanarayan: 'सत्यनारायण',
  sangeet: 'संगीत', mehendi: 'मेहंदी', reception: 'स्वागत समारंभ',
  sakharpuda: 'साखरपुडा', halad: 'हळद', akshata: 'अक्षता', kalash: 'कलश',
  nariyal: 'नारळ', snan: 'स्नान', mandap: 'मंडप',
  rangoli: 'रांगोळी', diya: 'दिवा', phule: 'फुले', vastra: 'वस्त्र', upahar: 'उपहार',
  shendur: 'शेंदूर', kunku: 'कुंकू', ganthan: 'गाठणे', mangalsutra: 'मंगळसूत्र',
};

const CONSONANTS: Array<[string, string]> = [
  ['kh', 'ख'], ['gh', 'घ'], ['chh', 'छ'], ['ch', 'च'], ['jh', 'झ'],
  ['th', 'थ'], ['dh', 'ध'], ['ph', 'फ'], ['bh', 'भ'], ['sh', 'श'],
  ['ss', 'ष'], ['tt', 'ट'], ['dd', 'ड'], ['nn', 'ण'], ['ll', 'ळ'],
  ['ks', 'क्ष'], ['dny', 'ज्ञ'], ['gy', 'ज्ञ'], ['tr', 'त्र'], ['pr', 'प्र'],
  ['k', 'क'], ['g', 'ग'], ['j', 'ज'], ['z', 'ज'], ['t', 'ट'], ['d', 'ड'],
  ['n', 'न'], ['p', 'प'], ['f', 'फ'], ['b', 'ब'], ['m', 'म'], ['y', 'य'],
  ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['w', 'व'], ['s', 'स'], ['h', 'ह'],
  ['q', 'क'], ['x', 'क्स'], ['c', 'क'],
] as Array<[string, string]>;

const VOWELS_INDEPENDENT: Array<[string, string]> = [
  ['aa', 'आ'], ['ai', 'ऐ'], ['au', 'औ'], ['ee', 'ई'], ['ii', 'ई'], ['oo', 'ऊ'],
  ['uu', 'ऊ'], ['ea', 'ई'], ['ei', 'ऐ'], ['ou', 'औ'], ['a', 'अ'], ['i', 'इ'],
  ['u', 'उ'], ['e', 'ए'], ['o', 'ओ'], ['A', 'आ'],
] as Array<[string, string]>;

const VOWEL_MATRAS: Record<string, string> = {
  aa: 'ा', a: '', ai: 'ै', au: 'ौ', ee: 'ी', ii: 'ी', oo: 'ू', uu: 'ू',
  ea: 'ी', ei: 'ै', ou: 'ौ', i: 'ि', u: 'ु', e: 'े', o: 'ो', A: 'ा',
};

const VOWEL_SET = new Set(['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']);

// Longest-match-first for every table (devanagari transliteration is greedy).
VOWELS_INDEPENDENT.sort((a, b) => b[0].length - a[0].length);
CONSONANTS.sort((a, b) => b[0].length - a[0].length);
const MATCHED_VOWEL_KEYS = VOWELS_INDEPENDENT.map(([k]) => k).sort((a, b) => b.length - a.length);

function transliterateWord(word: string): { output: string; kind: 'dictionary' | 'rules'; ambiguous: boolean } {
  const lower = word.toLowerCase();
  const dict = TRANSLITERATION_DICTIONARY[lower];
  if (dict) return { output: dict, kind: 'dictionary', ambiguous: false };

  let out = '';
  let i = 0;
  let sawConsonant = false;
  let ambiguity = false;

  while (i < word.length) {
    const rest = word.slice(i);

    // word-initial vowels take independent forms
    if (!sawConsonant) {
      const vowel = MATCHED_VOWEL_KEYS.find((v) => rest.startsWith(v));
      if (vowel && VOWEL_SET.has(vowel[0] as string)) {
        out += VOWELS_INDEPENDENT.find(([k]) => k === vowel)?.[1] ?? '';
        i += vowel.length;
        ambiguity = ambiguity || vowel.length === 1;
        continue;
      }
    }

    const consonant = CONSONANTS.find(([c]) => rest.startsWith(c));
    if (consonant) {
      out += consonant[1];
      sawConsonant = true;
      i += consonant[0].length;

      const afterRest = word.slice(i);
      // anusvara: n/m followed by a consonant becomes ं / ँ
      if ((consonant[0] === 'n' || consonant[0] === 'm') && afterRest.length === 0 && word.length > 2) {
        out = out.slice(0, -1);
        continue;
      }

      // consonant cluster: two consonants in a row → virama
      const nextIsConsonant = CONSONANTS.some(([c]) => afterRest.startsWith(c)) &&
        !MATCHED_VOWEL_KEYS.some((v) => afterRest.startsWith(v));
      if (nextIsConsonant) {
        // nasal + stop → anusvara for the common "n/m + consonant" case
        if (consonant[0] === 'n' || consonant[0] === 'm') {
          out = out.slice(0, -1) + (consonant[1] === 'म' ? 'ं' : 'ं');
        } else {
          out += '्';
        }
        continue;
      }

      const matraKey = MATCHED_VOWEL_KEYS.find((v) => afterRest.startsWith(v));
      if (matraKey) {
        const isWordFinal = afterRest.length === matraKey.length;
        if (isWordFinal && matraKey === 'a') {
          // schwa: word-final short `a` is inherent, printed as nothing
          i += matraKey.length;
          continue;
        }
        out += VOWEL_MATRAS[matraKey] ?? '';
        i += matraKey.length;
        continue;
      }
      continue;
    }

    // bare vowel after a consonant
    const vowel = MATCHED_VOWEL_KEYS.find((v) => rest.startsWith(v));
    if (vowel) {
      out += VOWEL_MATRAS[vowel] ?? '';
      i += vowel.length;
      continue;
    }

    // unknown character — keep as-is (numbers, punctuation, danda)
    out += word[i];
    i += 1;
  }

  // devanagari words never end in a matra-only or dangling virama from our rules
  out = out.replace(/्$/, '').replace(/््+/g, '्');

  return { output: out, kind: 'rules', ambiguous: ambiguity };
}

/**
 * Transliterate a full string (names, phrases). Latin words are converted,
 * already-Devanagari text is passed through untouched, digits are converted.
 */
export function transliterate(input: string): TransliterationResult {
  const tokens: TransliteratedToken[] = [];
  const parts = input.split(/(\s+)/);

  for (const part of parts) {
    if (/^\s+$/.test(part) || part.length === 0) {
      tokens.push({ source: part, devanagari: part, confidence: 'high', source_kind: 'rules', needsReview: false });
      continue;
    }
    if (/[\u0900-\u097F]/.test(part)) {
      tokens.push({ source: part, devanagari: part, confidence: 'high', source_kind: 'rules', needsReview: false });
      continue;
    }
    const clean = part.replace(/[^A-Za-z]/g, '');
    if (!clean) {
      tokens.push({ source: part, devanagari: part.replace(/[0-9]/g, (d) => '०१२३४५६७८९'[Number(d)] as string), confidence: 'high', source_kind: 'rules', needsReview: false });
      continue;
    }
    const { output, kind, ambiguous } = transliterateWord(clean);
    const confidence: TransliterationConfidence =
      kind === 'dictionary' ? 'high' : ambiguous && clean.length > 6 ? 'low' : 'medium';
    tokens.push({
      source: part,
      devanagari: part.replace(clean, output),
      confidence,
      source_kind: kind,
      needsReview: confidence !== 'high',
    });
  }

  const needsReview = tokens.filter((t) => t.needsReview).map((t) => t.source);
  const reviewable = tokens.filter((t) => t.source.trim().length > 0 && /[A-Za-z]/.test(t.source)).length;
  const confidence = reviewable === 0
    ? 100
    : Math.round(((reviewable - needsReview.length) / reviewable) * 100);

  return {
    input,
    output: tokens.map((t) => t.devanagari).join(''),
    tokens,
    confidence,
    needsReview,
  };
}

/** Convenience: just the Devanagari string. */
export function toDevanagari(input: string): string {
  return transliterate(input).output;
}
