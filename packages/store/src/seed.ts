/**
 * @mazi/store/seed — a complete, realistic Maharashtra marketplace.
 *
 * Not lorem ipsum: every vendor, package, review, lead and booking below is
 * written the way a Pune couple or a Kolhapur decorator would actually speak,
 * because the demo has to prove the cultural layer, not just the schema.
 *
 * The seed is deterministic (fixed ids, fixed dates relative to `today`) so
 * screenshots, tests and the demo script stay reproducible.
 */

import { COMMISSION_RATES, priceQuote, type PriceBreakdown } from '@mazi/commerce';
import { formatMarathiDate } from '@mazi/marathi';
import { evaluateMuhurat, type MuhuratSuitability } from '@mazi/panchang';
import { buildInvitationFromTemplate, type DesignDocument } from '@mazi/renderer';

import type { Store } from './index.js';

/**
 * How far ahead each seeded event sits, in days.
 *
 * Each offset was chosen so the Panchang engine rates that date **उत्तम** for the
 * event type — a demo wedding must never land on a वर्ज्य tithi. Everything else
 * (leads, quotes, bookings, budgets, calendar holds) is derived from these, so the
 * whole marketplace stays on one calendar.
 */
const EVENT_OFFSETS = {
  wedding: 129,
  gruhapravesh: 25,
  birthday: 7,
  naming: 48,
  satyanarayan: 18,
} as const;

/** A seed line item before commerce fills in the optional/unit defaults. */
export interface SeedPriceInput {
  category: string;
  items: Array<{ label: string; quantity: number; unit: string; unitPricePaise: number; optional?: boolean }>;
  discountPaise: number;
}

/**
 * Seed pricing goes through exactly the same waterfall the live product uses —
 * a seeded quote can never drift from a real one.
 */
export function computeBreakdownForSeed(input: SeedPriceInput): PriceBreakdown {
  return priceQuote({
    id: 'seed-quote',
    vendorId: 'seed-vendor',
    category: input.category as Parameters<typeof priceQuote>[0]['category'],
    items: input.items.map((item) => ({ ...item, optional: item.optional ?? false })),
    discountPaise: input.discountPaise,
    validTill: '2099-12-31',
    status: 'sent',
  });
}

export interface SeedReport {
  users: number;
  vendors: number;
  events: number;
  guests: number;
  leads: number;
  quotes: number;
  bookings: number;
  designs: number;
  campaigns: number;
  metricsDays: number;
  wishes: number;
}

const DAY = 86_400_000;

const iso = (date: Date): string => date.toISOString();
export const dayOffset = (today: Date, days: number): string =>
  new Date(today.getTime() + days * DAY).toISOString().slice(0, 10);
const atOffset = (today: Date, days: number, hour = 10, minute = 0): string => {
  const d = new Date(today.getTime() + days * DAY);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
};

interface SeedVendor {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  city: string;
  about: string;
  startingPricePaise: number;
  plan: 'free' | 'growth' | 'pro';
  rating: number;
  reviews: number;
  bookings: number;
  responseMinutes: number;
  identityVerified: boolean;
  gstVerified: boolean;
  pincode: string;
  lat: number;
  lng: number;
  packages: Array<{ title: string; pricePaise: number; inclusions: string[]; capacity?: number }>;
}

export const SEED_VENDORS: SeedVendor[] = [
  {
    id: 'vnd_chinchwad_mangal', ownerId: 'usr_v_ganesh', name: 'श्री साई मंगल कार्यालय, चिंचवड', category: 'venue',
    city: 'पिंपरी-चिंचवड', pincode: '411033', lat: 18.6279, lng: 73.8009,
    about: '१२०० पाहुण्यांची क्षमता, वातानुकूलित सभागृह, स्वतंत्र जेवणाचा हॉल वमंगल कार्यालय परिसरात ३०० गाड्यांची पार्किंग.',
    startingPricePaise: 12_500_000, plan: 'pro', rating: 4.8, reviews: 132, bookings: 187,
    responseMinutes: 28, identityVerified: true, gstVerified: true,
    packages: [
      { title: 'साधारण सभागृह (५०० पाहुणे)', pricePaise: 12_500_000, inclusions: ['सभागृह ६ तास', 'मंडप', 'मूलभूत ध्वनी', 'पार्किंग'], capacity: 500 },
      { title: 'प्रिमियम सभागृह (८०० पाहुणे)', pricePaise: 22_000_000, inclusions: ['सभागृह ८ तास', 'थीम सजावट', 'ध्वनी + एलईडी', 'हिरवळ परिसर', 'पार्किंग'], capacity: 800 },
      { title: 'संपूर्ण कार्यालय (१२०० पाहुणे)', pricePaise: 36_000_000, inclusions: ['सभागृह + जेवण हॉल', 'फुलांची सजावट', 'ध्वनी व प्रकाशयोजना', 'पार्किंग व सुरक्षा'], capacity: 1200 },
    ],
  },
  {
    id: 'vnd_kolhapur_patil_decors', ownerId: 'usr_v_sunil', name: 'पाटील डेकोर्स, कोल्हापूर', category: 'decorator',
    city: 'कोल्हापूर', pincode: '416001', lat: 16.705, lng: 74.2433,
    about: 'पारंपरिक कोल्हापुरी कारागिरी, पैठणी-प्रेरित मंडप, वारली कलाकृती व ताज्या फुलांची सजावट. १२ वर्षांचा अनुभव, ४०० हून अधिक सोहळे.',
    startingPricePaise: 9_500_000, plan: 'pro', rating: 4.9, reviews: 88, bookings: 214,
    responseMinutes: 42, identityVerified: true, gstVerified: true,
    packages: [
      { title: 'फुलांची सजावट (मंडप)', pricePaise: 9_500_000, inclusions: ['ताजी फुले', 'रांगोळी', 'फोटो कॉर्नर', 'स्थापना व निर्मूलन'] },
      { title: 'पैठणी थीम राजेशाही', pricePaise: 18_500_000, inclusions: ['पैठणी रंगसंगती', 'सुवर्ण कमान', 'पार्श्वभूमी स्क्रीन', 'प्रकाशयोजना'] },
      { title: 'वारली हेरिटेज + फोटो बूथ', pricePaise: 14_000_000, inclusions: ['हाताने रंगवलेली वारली चौकट', 'फोटो बूथ', 'प्रॉप्स', 'ताजी फुले'] },
    ],
  },
  {
    id: 'vnd_pune_kulkarni_studio', ownerId: 'usr_v_ashutosh', name: 'कुलकर्णी पिक्चर्स, पुणे', category: 'photographer',
    city: 'पुणे', pincode: '411038', lat: 18.5074, lng: 73.8077,
    about: 'कॅन्डिड व पारंपरिक छायाचित्रण, २ छायाचित्रकार + १ सहाय्यक, दिवसभराचे पॅकेज, १० दिवसांत पहिली निवड व ३५ दिवसांत अल्बम.',
    startingPricePaise: 6_500_000, plan: 'growth', rating: 4.7, reviews: 64, bookings: 96,
    responseMinutes: 19, identityVerified: true, gstVerified: false,
    packages: [
      { title: 'साखरपुडा पॅकेज (४ तास)', pricePaise: 2_500_000, inclusions: ['२ छायाचित्रकार', '३०० एडिटेड फोटो', 'डिजिटल शेअरिंग'], capacity: 150 },
      { title: 'विवाह पॅकेज (दिवसभर)', pricePaise: 6_500_000, inclusions: ['२ छायाचित्रकार + सहाय्यक', 'हळदी ते स्वागत', '६०० एडिटेड फोटो', '३०x३० अल्बम'] },
      { title: 'प्रिमियम विवाह + ड्रोन', pricePaise: 11_500_000, inclusions: ['३ छायाचित्रकार', 'ड्रोन शॉट', '९०० एडिटेड फोटो', '२ अल्बम', 'टीझर व्हिडिओ'] },
    ],
  },
  {
    id: 'vnd_pune_annapurna_caterers', ownerId: 'usr_v_meera', name: 'अन्नपूर्णा केटर्स, पुणे', category: 'caterer',
    city: 'पुणे', pincode: '411030', lat: 18.5018, lng: 73.8537,
    about: 'शुद्ध महाराष्ट्रीयन जेवण — पुरणपोळी, मोदक, श्रीखंड, कोल्हापुरी रस्सा. जैन, सात्विक व उपवासाचे स्वतंत्र मेनू. प्रति प्लेट ₹३५० पासून.',
    startingPricePaise: 3_500_000, plan: 'growth', rating: 4.6, reviews: 71, bookings: 143,
    responseMinutes: 35, identityVerified: true, gstVerified: true,
    packages: [
      { title: 'पारंपरिक महाराष्ट्रीयन थाळी (प्रति १००)', pricePaise: 3_500_000, inclusions: ['७ पदार्थ', 'पुरणपोळी', 'मोदक', 'सर्व्हिंग स्टाफ'], capacity: 100 },
      { title: 'राजेशाही मेनू (प्रति १००)', pricePaise: 6_800_000, inclusions: ['११ पदार्थ', 'लाइव्ह काउंटर', 'श्रीखंड व आईस्क्रीम', 'स्टाफ'], capacity: 100 },
      { title: 'सात्विक / जैन मेनू (प्रति १००)', pricePaise: 4_200_000, inclusions: ['९ पदार्थ', 'कांदा-लसूण रहित', 'स्वतंत्र काउंटर', 'स्टाफ'], capacity: 100 },
    ],
  },
  {
    id: 'vnd_pune_shubhmangal_printers', ownerId: 'usr_v_sachin', name: 'शुभमंगल प्रेस, पुणे', category: 'printer',
    city: 'पुणे', pincode: '411002', lat: 18.5159, lng: 73.8626,
    about: 'मराठी निमंत्रण पत्रिका, गोल्ड फॉइल, एम्बॉसिंग व हस्तलिखित शैली. २०० पत्रिकांची किमान ऑर्डर, ७२ तासांत प्रूफ. मुंबई-पुणे डिलिव्हरी.',
    startingPricePaise: 12_000, plan: 'growth', rating: 4.5, reviews: 39, bookings: 268,
    responseMinutes: 55, identityVerified: true, gstVerified: true,
    packages: [
      { title: 'मॅट ३०० GSM पत्रिका (प्रति १००)', pricePaise: 1_200_000, inclusions: ['CMYK छपाई', 'दुहेरी बाजू', 'प्रूफ २४ तासांत'], capacity: 100 },
      { title: 'गोल्ड फॉइल प्रिमियम (प्रति १००)', pricePaise: 2_400_000, inclusions: ['गोल्ड फॉइल', 'एम्बॉसिंग', 'मॅट लॅमिनेशन', 'खोके'], capacity: 100 },
      { title: 'पैठणी बॉर्डर स्पेशल (प्रति १००)', pricePaise: 3_100_000, inclusions: ['५ रंग छपाई', 'गोल्ड फॉइल', 'हस्तलिखित नावे', 'टाइल पत्रिका'], capacity: 100 },
    ],
  },
  {
    id: 'vnd_mumbai_shree_dhol', ownerId: 'usr_v_tukaram', name: 'श्री ढोल-ताशा पथक, मुंबई', category: 'bhangra',
    city: 'मुंबई', pincode: '400028', lat: 19.0176, lng: 72.8562,
    about: 'मराठी ढोल-ताशा पथक, १२ वादक, लग्नवरात्रीसाठी विशेष. तुळजापूरच्या परंपरेतील पथक, गणेशोत्सव अनुभव.',
    startingPricePaise: 1_800_000, plan: 'free', rating: 4.8, reviews: 47, bookings: 121,
    responseMinutes: 70, identityVerified: true, gstVerified: false,
    packages: [
      { title: 'वरात्री पथक (८ वादक)', pricePaise: 1_800_000, inclusions: ['८ वादक', '२ तास', 'स्वतंत्र शक्यता'] },
      { title: 'मोठे पथक (१२ वादक + नृत्य)', pricePaise: 2_800_000, inclusions: ['१२ वादक', '३ तास', 'पारंपरिक नृत्य'] },
    ],
  },
  {
    id: 'vnd_pune_shubh_purohit', ownerId: 'usr_v_guruji', name: 'श्री. दत्तात्रेय शास्त्री जोशी (भटजी)', category: 'priest',
    city: 'पुणे', pincode: '411004', lat: 18.5122, lng: 73.8392,
    about: 'विवाह, सत्यनारायण पूजा, गृहप्रवेश, नामकरण व रुद्राभिषेक. सर्व विधी मराठीत स्पष्ट उच्चारात. मुहूर्त सल्ला व साहित्य यादी देतात.',
    startingPricePaise: 1_100_000, plan: 'free', rating: 4.9, reviews: 58, bookings: 302,
    responseMinutes: 24, identityVerified: true, gstVerified: false,
    packages: [
      { title: 'सत्यनारायण पूजा (२ तास)', pricePaise: 1_100_000, inclusions: ['विधी', 'साहित्य यादी', 'प्रसाद मार्गदर्शन'] },
      { title: 'गृहप्रवेश विधी', pricePaise: 1_500_000, inclusions: ['वास्तुशांती', 'होमहवन', 'विधी साहित्य यादी'] },
      { title: 'विवाह विधी (संपूर्ण)', pricePaise: 2_100_000, inclusions: ['सर्व विधी ४ तास', 'मंत्रोच्चार', 'साहित्य समन्वय'] },
    ],
  },
  {
    id: 'vnd_pune_mehendi_art', ownerId: 'usr_v_swati', name: 'स्वाती मेहंदी आर्ट, पुणे', category: 'mehendi',
    city: 'पुणे', pincode: '411045', lat: 18.5679, lng: 73.9143,
    about: 'पारंपरिक व अरबी मेहंदी, नवरीसाठी राजस्थानी पॅटर्न, मराठी नावं व मोर-रांगोळी डिझाइन. जैविक मेहंदी, ३ सदस्य संघ.',
    startingPricePaise: 800_000, plan: 'growth', rating: 4.7, reviews: 52, bookings: 178,
    responseMinutes: 33, identityVerified: true, gstVerified: false,
    packages: [
      { title: 'नवरी मेहंदी (पूर्ण हात)', pricePaise: 800_000, inclusions: ['संपूर्ण हात + पाय', 'मराठी नाव', '३ तास'] },
      { title: 'पाहुण्यांसाठी मेहंदी काउंटर', pricePaise: 1_400_000, inclusions: ['३ कलाकार', '४ तास', 'जैविक मेहंदी'] },
    ],
  },
  {
    id: 'vnd_pune_swar_dj', ownerId: 'usr_v_nilesh', name: 'स्वर साऊंड व DJ, पुणे', category: 'dj',
    city: 'पुणे', pincode: '411014', lat: 18.5679, lng: 73.9143,
    about: 'स्वागत समारंभ व संगीतासाठी प्रकाशयोजना, LED भिंत, मराठी-हिंदी-पाश्चात्य संगीत संच. ध्वनी परवाना सहाय्य.',
    startingPricePaise: 2_200_000, plan: 'free', rating: 4.4, reviews: 31, bookings: 74,
    responseMinutes: 96, identityVerified: true, gstVerified: true,
    packages: [
      { title: 'स्वागत संगीत (DJ + साऊंड)', pricePaise: 2_200_000, inclusions: ['DJ', 'ध्वनी', 'प्रकाशयोजना', '५ तास'] },
      { title: 'प्रिमियम LED + DJ', pricePaise: 4_500_000, inclusions: ['LED भिंत', 'DJ + साऊंड', 'स्पॉट लाइट', 'अँकर सहाय्य'] },
    ],
  },
  {
    id: 'vnd_pune_aaiji_cakes', ownerId: 'usr_v_pranali', name: 'आजी केक्स व डेझर्ट्स, पुणे', category: 'cake',
    city: 'पुणे', pincode: '411007', lat: 18.5482, lng: 73.8799,
    about: 'थीम केक, मोदक-थीम डेझर्ट टेबल, वाढदिवस व नामकरणासाठी मुख्य केक. शुद्ध बटर, विना हा-फ्रक्टोज पर्याय.',
    startingPricePaise: 90_000, plan: 'free', rating: 4.6, reviews: 44, bookings: 210,
    responseMinutes: 62, identityVerified: true, gstVerified: false,
    packages: [
      { title: 'थीम केक (१ किलो)', pricePaise: 90_000, inclusions: ['आवडता थीम', 'मराठी मजकूर', 'रांगोळी सजावट'] },
      { title: 'डेझर्ट टेबल (५० पाहुणे)', pricePaise: 1_100_000, inclusions: ['केक', 'मोदक', 'श्रीखंड', 'बासुंदी', 'सजावट'] },
    ],
  },
  {
    id: 'vnd_nashik_sai_makeup', ownerId: 'usr_v_manisha', name: 'साई ब्युटी पार्लर, नाशिक', category: 'makeup',
    city: 'नाशिक', pincode: '422001', lat: 19.9975, lng: 73.7898,
    about: 'नवरीचा मेकअप, पारंपरिक मराठी मुखश्री, केसांची नट, मुंडावळण पर्याय. HD मेकअप व ऍप्लिकेशन, २ वर्षांचा चांगल्या अभिप्रायांचा अनुभव.',
    startingPricePaise: 1_500_000, plan: 'growth', rating: 4.5, reviews: 26, bookings: 61,
    responseMinutes: 88, identityVerified: false, gstVerified: false,
    packages: [
      { title: 'नवरी मेकअप (HD)', pricePaise: 1_500_000, inclusions: ['HD मेकअप', 'केसाठी नट', 'ड्रेपिंग'] },
      { title: 'प्रिमियम नवरी पॅकेज', pricePaise: 2_800_000, inclusions: ['HD मेकअप', 'केसांसाठी नट', 'साडी ड्रेपिंग', 'साखरपुडा मेकअप'] },
    ],
  },
  {
    id: 'vnd_satara_gauri_lighting', ownerId: 'usr_v_pravin', name: 'गौरी लायटिंग, सातारा', category: 'lighting',
    city: 'सातारा', pincode: '415001', lat: 17.6805, lng: 74.0183,
    about: 'मंडप प्रकाशयोजना, वरात्री लाइटिंग, आवार प्रकाश. वीज बचत LED, स्वतंत्र जनरेटर पर्याय.',
    startingPricePaise: 1_200_000, plan: 'free', rating: 4.3, reviews: 18, bookings: 39,
    responseMinutes: 140, identityVerified: true, gstVerified: false,
    packages: [
      { title: 'मंडप लाइटिंग', pricePaise: 1_200_000, inclusions: ['LED स्ट्रिंग', 'दिवे', 'स्थापना'] },
      { title: 'प्रकाशयोजना + जनरेटर', pricePaise: 2_600_000, inclusions: ['संपूर्ण प्रकाशयोजना', 'जनरेटर', 'ऑपरेटर'] },
    ],
  },
];

interface SeedEvent {
  id: string;
  slug: string;
  ownerId: string;
  eventType: string;
  title: string;
  hosts: string[];
  dayOffset: number;
  city: string;
  venue: string;
  guests: number;
  budgetPaise: number;
  /** A literal label, `''` for none, or `'engine'` to ask the Panchang engine. */
  muhuratText: string;
  status: 'planning' | 'scheduled' | 'completed';
  /** Opt-in discovery. Absent means private — the platform default. */
  isPublic?: boolean;
}

export const SEED_EVENTS: SeedEvent[] = [
  {
    id: 'evt_patil_vivah', slug: 'patil-patil-vivah-2027', ownerId: 'usr_c_ramesh', eventType: 'wedding',
    title: 'सौ. पाटील व शिंदे कुटुंबाचा विवाह सोहळा', isPublic: true,
    hosts: ['श्री. रमेश पाटील व सौ. सुनीता पाटील', 'श्री. जयवंत शिंदे व सौ. अनिता शिंदे'],
    dayOffset: EVENT_OFFSETS.wedding, city: 'पुणे', venue: 'श्री साई मंगल कार्यालय, चिंचवड',
    guests: 650, budgetPaise: 180_000_000,
    muhuratText: 'engine', status: 'scheduled',
  },
  {
    id: 'evt_deshmukh_gruhapravesh', slug: 'deshmukh-gruhapravesh', ownerId: 'usr_c_ramesh', eventType: 'gruhapravesh',
    title: 'देशमुख कुटुंबाचा गृहप्रवेश',
    hosts: ['श्री. अमोल देशमुख व सौ. पल्लवी देशमुख'],
    dayOffset: EVENT_OFFSETS.gruhapravesh, city: 'पुणे', venue: 'सह्याद्री नगर, बाणेर',
    guests: 120, budgetPaise: 22_000_000,
    muhuratText: 'engine', status: 'scheduled', isPublic: true,
  },
  {
    id: 'evt_advait_birthday', slug: 'advait-vadhdivas', ownerId: 'usr_c_ramesh', eventType: 'birthday',
    title: 'आद्वैतचा पहिला वाढदिवस',
    hosts: ['श्री. निखिल कुलकर्णी व सौ. श्वेता कुलकर्णी'],
    dayOffset: EVENT_OFFSETS.birthday, city: 'पुणे', venue: 'आनंद पार्क, औंध',
    guests: 60, budgetPaise: 6_500_000,
    muhuratText: '', status: 'planning',
    // Deliberately left private: discovery is opt-in, and this is the family that
    // has not turned it on. Anything not published can never leak into /events.
  },
  {
    id: 'evt_joshi_naming', slug: 'joshi-namkaran', ownerId: 'usr_c_amita', eventType: 'naming',
    title: 'जोशी कुटुंबाचा नामकरण सोहळा',
    hosts: ['श्री. सिद्धार्थ जोशी व सौ. अमिता जोशी'],
    dayOffset: EVENT_OFFSETS.naming, city: 'मुंबई', venue: 'श्री गणेश मंगल कार्यालय, दादर',
    guests: 90, budgetPaise: 14_000_000,
    muhuratText: 'engine', status: 'scheduled', isPublic: true,
  },
  {
    id: 'evt_kale_satyanarayan', slug: 'kale-satyanarayan-puja', ownerId: 'usr_c_shweta', eventType: 'satyanarayan',
    title: 'काळे कुटुंबाची सत्यनारायण पूजा',
    hosts: ['श्री. विनायक काळे व सौ. मंगल काळे'],
    dayOffset: EVENT_OFFSETS.satyanarayan, city: 'नाशिक', venue: 'वृंदावन सोसायटी, पंचवटी',
    guests: 45, budgetPaise: 4_200_000,
    muhuratText: 'engine', status: 'scheduled', isPublic: true,
  },
];

/* ------------------------------------------------------------------ */
/* The seed                                                            */
/* ------------------------------------------------------------------ */

/**
 * The window a family would actually write on the invitation, taken from the
 * Panchang engine rather than typed by hand — so a re-seeded demo never claims a
 * muhurat window that the engine itself did not recommend. अभिजित is preferred
 * when the day offers it, because that is the classic विवाह window.
 */
function muhuratLabelFor(event: SeedEvent, date: string): string | undefined {
  const isoDate = date.slice(0, 10);
  const [year, month, day] = isoDate.split('-').map(Number);
  const city = CITY_COORDINATES[event.city] ?? CITY_COORDINATES['पुणे']!;
  const result: MuhuratSuitability = evaluateMuhurat({
    eventType: event.eventType,
    date: { year: year!, month: month!, day: day! },
    location: { city: event.city, latitude: city.latitude, longitude: city.longitude, tzOffsetHours: 5.5 },
  });
  // सत्यनारायण पूजा happens at प्रदोष in the evening, so take the evening window
  // even though the day may also offer an अभिजित; everything else prefers अभिजित.
  const evening = [...result.recommendedWindows].reverse().find((w) => w.start.includes('संध्याकाळी'));
  const window = event.eventType === 'satyanarayan' && evening
    ? evening
    : result.recommendedWindows.find((w) => w.label.includes('अभिजित')) ?? result.recommendedWindows[0];
  return window ? `${window.label}, ${window.start} ते ${window.end}` : undefined;
}

/** Coordinates used by the seed only — the app keeps its own city table. */
const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'पुणे': { latitude: 18.5204, longitude: 73.8567 },
  'मुंबई': { latitude: 19.076, longitude: 72.8777 },
  'नाशिक': { latitude: 19.9975, longitude: 73.7898 },
};

/**
 * Build a real Design JSON v3 document for a seeded design.
 *
 * A seeded invitation must be the *same artefact* a family would produce in the
 * studio — the print export, the SVG and the digital page all read this document.
 * Writing `{ seeded: true }` here would look fine on a dashboard and then fail the
 * moment anyone opened the design, which is exactly the class of demo-only shortcut
 * this project does not ship.
 */
function seedDesignDocument(args: {
  id: string;
  name: string;
  templateId: string;
  event: { eventType: string; title: string; hostNames: string[]; eventDate: string; city: string; venueName?: string; muhurat?: { label?: string } };
  qrPayload: string;
  includeEnglish?: boolean;
}): DesignDocument {
  const dateIso = args.event.eventDate;
  const [year, month, day] = dateIso.split('-').map(Number);
  const city = args.event.city;
  const coordinates = CITY_COORDINATES[city] ?? CITY_COORDINATES['पुणे']!;
  const panchang = evaluateMuhurat({
    eventType: args.event.eventType,
    date: { year: year!, month: month!, day: day! },
    location: { city, latitude: coordinates.latitude, longitude: coordinates.longitude, tzOffsetHours: 5.5 },
  }).panchang;

  return buildInvitationFromTemplate({
    id: args.id,
    name: args.name,
    templateId: args.templateId,
    includePanchang: true,
    includeEnglish: args.includeEnglish ?? false,
    qrPayload: args.qrPayload,
    invitation: {
      eventType: args.event.eventType,
      hosts: args.event.hostNames.map((name) => ({ name })),
      date: dateIso,
      venue: { name: args.event.venueName ?? city, city },
      panchang: {
        tithi: panchang.tithi.index % 15,
        paksha: panchang.tithi.paksha === 'शुक्ल' ? 0 : 1,
        nakshatra: panchang.nakshatra.index,
        ...(panchang.sunrise ? { sunrise: panchang.sunrise } : {}),
        ...(panchang.sunset ? { sunset: panchang.sunset } : {}),
        rahuKaal: { start: panchang.rahuKaal.start, end: panchang.rahuKaal.end },
        method: panchang.method.ephemeris,
      },
      schedule: [],
      ...(args.event.muhurat?.label ? { muhuratLabel: args.event.muhurat.label } : {}),
      rsvp: { url: args.qrPayload },
      websiteUrl: args.qrPayload,
      tone: 'traditional',
      register: 'formal',
    },
  }).design;
}

export function seedStore(store: Store, options: { today?: Date } = {}): SeedReport {
  const today = options.today ?? new Date();

  const report: SeedReport = {
    users: 0, vendors: 0, events: 0, guests: 0, leads: 0, quotes: 0, bookings: 0, designs: 0,
    campaigns: 0, metricsDays: 0, wishes: 0,
  };

  store.transaction(() => {
    /* ---------------- people ---------------- */
    const customers: Array<{ id: string; name: string; phone: string; city: string }> = [
      { id: 'usr_c_ramesh', name: 'श्री. रमेश पाटील', phone: '9822012345', city: 'पुणे' },
      { id: 'usr_c_shweta', name: 'सौ. श्वेता कुलकर्णी', phone: '9822045678', city: 'पुणे' },
      { id: 'usr_c_amita', name: 'सौ. अमिता जोशी', phone: '9822098765', city: 'मुंबई' },
    ];
    for (const person of customers) {
      store.users.create({ id: person.id, role: 'customer', name: person.name, phone: person.phone, city: person.city, createdAt: iso(new Date(today.getTime() - 90 * DAY)) });
      report.users += 1;
    }
    store.users.create({ id: 'usr_admin_seema', role: 'admin', name: 'सीमा देशपांडे (मार्केटप्लेस)', city: 'पुणे', createdAt: iso(new Date(today.getTime() - 200 * DAY)) });
    report.users += 1;

    const vendorOwnerNames: Record<string, string> = {
      usr_v_ganesh: 'श्री. गणेश भोसले (मंगल कार्यालय)',
      usr_v_sunil: 'श्री. सुनील पाटील (डेकोर्स)',
      usr_v_ashutosh: 'श्री. आशुतोष कुलकर्णी (छायाचित्रकार)',
      usr_v_meera: 'सौ. मीरा देशपांडे (केटर्स)',
      usr_v_sachin: 'श्री. सचिन तुपे (प्रेस)',
      usr_v_tukaram: 'श्री. तुकाराम वाघमारे (ढोल-ताशा)',
      usr_v_guruji: 'श्री. दत्तात्रेय शास्त्री जोशी (भटजी)',
      usr_v_swati: 'सौ. स्वाती जाधव (मेहंदी)',
      usr_v_nilesh: 'श्री. निलेश साळुंखे (साऊंड)',
      usr_v_pranali: 'सौ. प्रणाली तोडी (केक्स)',
      usr_v_manisha: 'सौ. मनीषा सोनार (पार्लर)',
      usr_v_pravin: 'श्री. प्रविण राणे (लायटिंग)',
    };
    for (const [id, name] of Object.entries(vendorOwnerNames)) {
      store.users.create({ id, role: 'vendor', name, city: 'पुणे', createdAt: iso(new Date(today.getTime() - 180 * DAY)) });
      report.users += 1;
    }

    /* ---------------- vendors ---------------- */
    for (const vendor of SEED_VENDORS) {
      store.vendors.create({
        id: vendor.id, ownerUserId: vendor.ownerId, name: vendor.name, category: vendor.category,
        city: vendor.city, pincode: vendor.pincode, latitude: vendor.lat, longitude: vendor.lng,
        about: vendor.about, startingPricePaise: vendor.startingPricePaise, plan: vendor.plan,
        rating: vendor.rating, reviewCount: vendor.reviews, bookingsCompleted: vendor.bookings,
        responseMinutes: vendor.responseMinutes, identityVerified: vendor.identityVerified,
        gstVerified: vendor.gstVerified, gstNumber: vendor.gstVerified ? '27ABCDE1234F1Z5' : undefined,
        calendarFreshAt: atOffset(today, -1, 9, 0), createdAt: iso(new Date(today.getTime() - 300 * DAY)),
      });
      report.vendors += 1;
      vendor.packages.forEach((pkg, index) => {
        store.vendors.addPackage({
          id: `${vendor.id}_pkg${index + 1}`, vendorId: vendor.id, title: pkg.title, pricePaise: pkg.pricePaise,
          inclusions: pkg.inclusions, sortOrder: index, ...(pkg.capacity ? { capacity: pkg.capacity } : {}),
        });
      });
    }

    /* ---------------- availability ---------------- */
    const busyDates = [dayOffset(today, 45), dayOffset(today, EVENT_OFFSETS.wedding), dayOffset(today, EVENT_OFFSETS.wedding + 2), dayOffset(today, 12)];
    for (const vendor of SEED_VENDORS) {
      for (let offset = 0; offset <= 60; offset += 1) {
        const date = dayOffset(today, offset);
        const busy = busyDates.includes(date) && (vendor.category === 'venue' || vendor.category === 'photographer' || vendor.category === 'caterer');
        if (busy || offset % 7 === 0) {
          store.vendors.setAvailability({
            id: `avail_${vendor.id}_${offset}`,
            vendorId: vendor.id, date,
            status: busy ? 'booked' : 'available',
            teamCapacity: vendor.category === 'photographer' ? 3 : vendor.category === 'caterer' ? 4 : 1,
            bookedTeamCount: busy ? 1 : 0,
            ...(busy ? { notes: 'बुक झाले' } : {}),
          });
        }
      }
    }
    // A live hold with a 24-hour expiry — shows the hold mechanics in the UI.
    store.vendors.setAvailability({
      id: 'avail_hold_chinchwad', vendorId: 'vnd_chinchwad_mangal',
      date: dayOffset(today, EVENT_OFFSETS.wedding), status: 'hold', teamCapacity: 1, bookedTeamCount: 0,
      holdExpiresAt: atOffset(today, 1, 10, 0), notes: 'पाटील कुटुंब — २४ तासांचे राखीव',
    });

    /* ---------------- reviews ---------------- */
    const reviewSeed: Array<{ vendorId: string; author: string; rating: number; body: string }> = [
      { vendorId: 'vnd_kolhapur_patil_decors', author: 'सौ. माधुरी कुलकर्णी', rating: 5, body: 'मंडपाची पैठणी थीम अप्रतिम होती. सगळे पाहुणे विचारत होते की सजावट कुठून आणली. वेळेत पूर्ण झाले.' },
      { vendorId: 'vnd_pune_kulkarni_studio', author: 'श्री. प्रशांत देशमुख', rating: 5, body: 'कॅन्डिड फोटो फार चांगले आले. अल्बमची गुणवत्ता उत्तम, ३० दिवसांत मिळाला.' },
      { vendorId: 'vnd_pune_annapurna_caterers', author: 'सौ. अनिता शिंदे', rating: 5, body: 'पुरणपोळी अगदी घरच्या सारखी! मोदक, श्रीखंड सर्व ताजे. स्टाफ अत्यंत नम्र.' },
      { vendorId: 'vnd_chinchwad_mangal', author: 'श्री. जयवंत पाटील', rating: 4, body: 'सभागृह प्रशस्त, पार्किंग चांगली. ध्वनी थोडा सुधारायला हवा, बाकी सर्व व्यवस्थित.' },
      { vendorId: 'vnd_pune_shubh_purohit', author: 'श्री. निखिल कुलकर्णी', rating: 5, body: 'गुरुजींनी सर्व विधी स्पष्ट मराठीत सांगितले, कोणतीही घाई नाही. साहित्याची यादी आधीच मिळाली.' },
      { vendorId: 'vnd_mumbai_shree_dhol', author: 'श्री. अस्लम शेख', rating: 5, body: 'ढोल-ताशाने वरात्रीत जान आणली. ८ वादक, वेळेत हजर.' },
      { vendorId: 'vnd_pune_mehendi_art', author: 'सौ. श्रद्धा जोशी', rating: 5, body: 'मेहंदीचा रंग गडद आला, मराठी नाव छान रेखाटले. जैविक मेहंदी असल्याने काही त्रास नाही.' },
      { vendorId: 'vnd_pune_aaiji_cakes', author: 'श्री. अमोल देशमुख', rating: 5, body: 'थीम केक थेट फोटोसारखा बनवला. चव उत्तम, नैसर्गिक बटरचा वापर जाणवतो.' },
      { vendorId: 'vnd_pune_swar_dj', author: 'सौ. पूजा साळवी', rating: 4, body: 'संगीत चांगले, प्रकाशयोजना सुंदर. सुरुवातीस थोडा उशीर झाला.' },
      { vendorId: 'vnd_satara_gauri_lighting', author: 'श्री. संदीप काळे', rating: 4, body: 'प्रकाशयोजना चांगली, जनरेटरची व्यवस्था वेळेवर. दरवाजाच थोडा वेळ लागला.' },
    ];
    for (const [index, review] of reviewSeed.entries()) {
      store.vendors.addReview({
        id: `rev_seed_${index + 1}`, vendorId: review.vendorId, authorName: review.author,
        rating: review.rating, body: review.body, verifiedBooking: true,
        createdAt: iso(new Date(today.getTime() - (index + 3) * 4 * DAY)),
      });
    }

    /* ---------------- events ---------------- */
    for (const event of SEED_EVENTS) {
      const eventDate = dayOffset(today, event.dayOffset);
      const muhuratLabel = event.muhuratText === 'engine' ? muhuratLabelFor(event, eventDate) : event.muhuratText || undefined;
      store.events.create({
        id: event.id, slug: event.slug, ownerUserId: event.ownerId, eventType: event.eventType,
        title: event.title, hostNames: event.hosts, eventDate,
        city: event.city, venueName: event.venue, guestCountExpected: event.guests,
        budgetTargetPaise: event.budgetPaise, status: event.status, isPublic: event.isPublic ?? false,
        ...(muhuratLabel ? { muhurat: { label: muhuratLabel, source: 'पंचांग गणना' } } : {}),
        createdAt: iso(new Date(today.getTime() - (200 - event.dayOffset) * DAY)),
      });
      report.events += 1;
    }

    /* guests — a real Marathi guest list with respect-correct relations */
    const guestSeed: Array<[string, string, string, 'bride' | 'groom' | 'both' | 'guest', 'pending' | 'yes' | 'no' | 'maybe', number]> = [
      ['काका — श्री. रविंद्र पाटील', 'father.elderBrother', '9822100001', 'groom', 'yes', 4],
      ['मामा — श्री. दिनकर देशपांडे', 'mother.youngerBrother', '9822100002', 'bride', 'yes', 3],
      ['आत्या — सौ. वैशाली देशपांडे', 'father.elderSister', '9822100003', 'groom', 'yes', 2],
      ['मावशी — सौ. लता कुलकर्णी', 'mother.sister', '9822100004', 'bride', 'maybe', 2],
      ['सासरे — श्री. वसंत शिंदे', 'husband.father', '9822100005', 'bride', 'yes', 2],
      ['दीर — श्री. सागर शिंदे', 'husband.youngerBrother', '9822100006', 'bride', 'yes', 2],
      ['मित्र — श्री. अमोल गायकवाड', 'friend', '9822100007', 'both', 'yes', 1],
      ['सहकारी — सौ. मनीषा सोनार', 'colleague', '9822100008', 'groom', 'pending', 1],
      ['शेजारी — श्री. प्रकाश जोशी', 'neighbour', '9822100009', 'both', 'no', 0],
      ['विद्यार्थी — श्री. ऋतुराज काळे', 'student', '9822100010', 'bride', 'pending', 1],
      ['डॉक्टर — डॉ. सुहास पटवर्धन', 'doctor', '9822100011', 'both', 'yes', 2],
      ['शिक्षक — श्री. बाळकृष्ण तुपे', 'teacher', '9822100012', 'groom', 'yes', 2],
    ];
    for (const [index, [name, relation, phone, side, rsvp, heads]] of guestSeed.entries()) {
      store.events.addGuest({
        id: `gst_patil_${index + 1}`, eventId: 'evt_patil_vivah', name, phone, relation, side,
        rsvpStatus: rsvp, guestCount: heads, code: `PATIL${String(index + 1).padStart(3, '0')}`,
        invitedAt: atOffset(today, -30, 11, 30),
        ...(rsvp !== 'pending' ? { respondedAt: atOffset(today, -28 + index, 19, 15) } : {}),
      });
      report.guests += 1;
    }
    const gruhaGuests = [
      ['श्री. सुहास देशमुख', 3], ['सौ. मंजुषा काळे', 2], ['श्री. विवेक जोशी', 1],
    ] as const;
    for (const [index, [name, heads]] of gruhaGuests.entries()) {
      store.events.addGuest({
        id: `gst_gruha_${index + 1}`, eventId: 'evt_deshmukh_gruhapravesh', name, side: 'host',
        rsvpStatus: name === 'श्री. विवेक जोशी' ? 'maybe' : 'yes', guestCount: heads,
        code: `GRUHA${String(index + 1).padStart(3, '0')}`, relation: 'neighbour',
      });
      report.guests += 1;
    }

    /* budget — split the way Marathi families actually budget */
    const budgetSeed: Array<[string, string, number, number, number, string]> = [
      ['venue', 'मंगल कार्यालय भाडे', 36_000_000, 36_000_000, 10_000_000, 'committed'],
      ['caterer', 'भोजन व्यवस्था (६५० पाहुणे)', 33_000_000, 31_500_000, 9_000_000, 'committed'],
      ['decorator', 'सजावट व मंडप', 18_500_000, 18_500_000, 5_500_000, 'committed'],
      ['photographer', 'छायाचित्रण व अल्बम', 11_500_000, 11_500_000, 3_500_000, 'committed'],
      ['printer', 'निमंत्रण पत्रिका (५००)', 15_500_000, 12_400_000, 12_400_000, 'paid'],
      ['bhangra', 'ढोल-ताशा पथक', 2_800_000, 2_800_000, 1_000_000, 'committed'],
      ['priest', 'विवाह विधी', 2_100_000, 2_100_000, 2_100_000, 'paid'],
      ['mehendi', 'मेहंदी', 1_400_000, 1_400_000, 500_000, 'committed'],
      ['dj', 'संगीत व प्रकाशयोजना', 4_500_000, 4_500_000, 1_500_000, 'committed'],
      ['gifting', 'भेटवस्तू व खोके', 6_000_000, 5_200_000, 0, 'quoted'],
      ['makeup', 'नवरी मेकअप', 1_500_000, 0, 0, 'planned'],
      ['lighting', 'प्रकाशयोजना', 1_200_000, 0, 0, 'planned'],
    ];
    for (const [index, [category, label, estimated, committed, paid, status]] of budgetSeed.entries()) {
      store.events.upsertBudgetItem({
        id: `bud_patil_${index + 1}`, eventId: 'evt_patil_vivah', category, label,
        estimatedPaise: estimated, committedPaise: committed, paidPaise: paid,
        status: status as 'planned' | 'quoted' | 'committed' | 'paid',
        dueDate: dayOffset(today, 30 - index * 2),
      });
    }
    const gruhaBudget = [
      ['priest', 'गृहप्रवेश विधी', 1_500_000],
      ['caterer', 'भोजन (१२० पाहुणे)', 4_200_000],
      ['decorator', 'फुलांची सजावट', 2_500_000],
    ] as const;
    for (const [index, [category, label, estimated]] of gruhaBudget.entries()) {
      store.events.upsertBudgetItem({
        id: `bud_gruha_${index + 1}`, eventId: 'evt_deshmukh_gruhapravesh', category, label,
        estimatedPaise: estimated, committedPaise: 0, paidPaise: 0, status: 'planned',
      });
    }

    const newEventBudgets: Array<[string, string, string, string, number, number, string]> = [
      ['bud_naming_1', 'evt_joshi_naming', 'priest', 'नामकरण विधी', 1_100_000, 0, 'planned'],
      ['bud_naming_2', 'evt_joshi_naming', 'caterer', 'भोजन (९० पाहुणे)', 3_600_000, 0, 'planned'],
      ['bud_naming_3', 'evt_joshi_naming', 'decorator', 'फुलांची सजावट व बाळाचे आसन', 1_800_000, 0, 'planned'],
      ['bud_naming_4', 'evt_joshi_naming', 'photographer', 'छायाचित्रण (अर्धा दिवस)', 1_200_000, 0, 'quoted'],
      ['bud_puja_1', 'evt_kale_satyanarayan', 'priest', 'सत्यनारायण पूजा व कथा', 800_000, 0, 'planned'],
      ['bud_puja_2', 'evt_kale_satyanarayan', 'caterer', 'प्रसाद व महाप्रसाद', 1_400_000, 0, 'committed'],
      ['bud_puja_3', 'evt_kale_satyanarayan', 'florist', 'पूजेची फुले व तुळशी वृंदावन सजावट', 600_000, 0, 'planned'],
    ];
    for (const [id, eventId, category, label, estimated, committed, status] of newEventBudgets) {
      store.events.upsertBudgetItem({
        id, eventId, category, label, estimatedPaise: estimated, committedPaise: committed, paidPaise: 0,
        status: status as 'planned' | 'quoted' | 'committed' | 'paid', dueDate: dayOffset(today, 12),
      });
    }

    /* tasks */
    const taskSeed: Array<[string, string, number, 'open' | 'done', number]> = [
      ['पत्रिका छपाईसाठी अंतिम नावे पाठवणे', 'निमंत्रण', -4, 'done', 1],
      ['फोटोग्राफरसोबत शॉट-लिस्ट ठरवणे', 'छायाचित्रण', 6, 'open', 1],
      ['केटररसोबत अंतिम मेनू निश्चित करणे', 'भोजन', 3, 'open', 1],
      ['मेहंदी कलाकाराची वेळ ठरवणे', 'मेहंदी', 10, 'open', 2],
      ['भेटवस्तूंचे प्रमाण निश्चित करणे', 'भेटवस्तू', 14, 'open', 2],
      ['वरात्रीचा मार्ग व वाहन व्यवस्था', 'वाहतूक', 21, 'open', 2],
      ['हॉटेल राखीव (बाहेरगावच्या पाहुण्यांसाठी)', 'निवास', 25, 'open', 2],
      ['विवाह साहित्य यादी तपासणे', 'विधी', -10, 'done', 1],
    ];
    for (const [index, [title, category, offset, status, priority]] of taskSeed.entries()) {
      store.events.addTask({
        id: `task_patil_${index + 1}`, eventId: 'evt_patil_vivah', title, category,
        dueDate: dayOffset(today, offset), status, priority, owner: 'सौ. सुनीता पाटील',
        createdAt: iso(new Date(today.getTime() - 60 * DAY)),
        ...(status === 'done' ? { doneAt: atOffset(today, offset - 1, 18, 0) } : {}),
      });
    }

    const newEventTasks: Array<[string, string, string, string, number, 'open' | 'done']> = [
      ['task_naming_1', 'evt_joshi_naming', 'नामकरणासाठी नाव अंतिम करणे (राशीनुसार अक्षर)', 'विधी', 4, 'open'],
      ['task_naming_2', 'evt_joshi_naming', 'मंगल कार्यालयाची आगाऊ रक्कम भरणे', 'बजेट', 2, 'done'],
      ['task_naming_3', 'evt_joshi_naming', 'पत्रिका छपाईसाठी नावे पाठवणे', 'निमंत्रण', 9, 'open'],
      ['task_puja_1', 'evt_kale_satyanarayan', 'भटजींसोबत मुहूर्त निश्चित करणे', 'विधी', 1, 'done'],
      ['task_puja_2', 'evt_kale_satyanarayan', 'प्रसादाची व्यवस्था व जैन मेनू', 'भोजन', 5, 'open'],
    ];
    for (const [id, eventId, title, category, offset, status] of newEventTasks) {
      store.events.addTask({
        id, eventId, title, category, dueDate: dayOffset(today, offset), status, priority: 1,
        owner: eventId === 'evt_joshi_naming' ? 'सौ. अमिता जोशी' : 'सौ. मंगल काळे',
        createdAt: iso(new Date(today.getTime() - 12 * DAY)),
        ...(status === 'done' ? { doneAt: atOffset(today, offset - 2, 17, 30) } : {}),
      });
    }

    /* ---------------- leads, quotes, bookings ---------------- */
    const weddingDateText = formatMarathiDate(`${dayOffset(today, EVENT_OFFSETS.wedding)}T00:00:00Z`, 'long');
    const leadSeed: Array<{
      id: string; vendorId: string; category: string; message: string; budgetPaise: number;
      status: 'new' | 'viewed' | 'responded' | 'quoted' | 'won' | 'lost'; createdOffset: number;
      respondedOffset?: number; source: 'search' | 'ads' | 'ai' | 'category' | 'print'; sponsored?: boolean;
    }> = [
      { id: 'lead_1', vendorId: 'vnd_chinchwad_mangal', category: 'venue', status: 'new', createdOffset: 0, budgetPaise: 30_000_000, source: 'search', message: `${weddingDateText} ला ६०० पाहुण्यांचा विवाह आहे. सभागृह व जेवण हॉलची उपलब्धता व दर सांगा.` },
      { id: 'lead_2', vendorId: 'vnd_pune_kulkarni_studio', category: 'photographer', status: 'quoted', createdOffset: -2, respondedOffset: -2, budgetPaise: 11_000_000, source: 'ai', message: 'हळदी ते स्वागत, संपूर्ण दिवस छायाचित्रण. कॅन्डिड व पारंपरिक दोन्ही हवे.' },
      { id: 'lead_3', vendorId: 'vnd_kolhapur_patil_decors', category: 'decorator', status: 'won', createdOffset: -9, respondedOffset: -9, budgetPaise: 18_500_000, source: 'category', message: 'पैठणी थीम सजावट हवी, मंडप व फुलांची सजावटसह.' },
      { id: 'lead_4', vendorId: 'vnd_pune_shubhmangal_printers', category: 'printer', status: 'won', createdOffset: -34, respondedOffset: -34, budgetPaise: 15_500_000, source: 'print', message: '५०० पत्रिका, गोल्ड फॉइल, पैठणी बॉर्डर. मराठी नावे हस्तलिखित शैलीत.' },
      { id: 'lead_5', vendorId: 'vnd_pune_annapurna_caterers', category: 'caterer', status: 'quoted', createdOffset: -3, respondedOffset: -3, budgetPaise: 33_000_000, source: 'search', message: '६५० पाहुणे, पुरणपोळी व मोदकासह महाराष्ट्रीयन थाळी. जैन मेनूचीही चौकशी.' },
      { id: 'lead_6', vendorId: 'vnd_pune_shubh_purohit', category: 'priest', status: 'won', createdOffset: -40, respondedOffset: -40, budgetPaise: 2_100_000, source: 'search', message: `विवाह विधी व मुहूर्त सल्ला हवा. ${weddingDateText}.` },
      { id: 'lead_7', vendorId: 'vnd_mumbai_shree_dhol', category: 'bhangra', status: 'responded', createdOffset: -1, respondedOffset: -1, budgetPaise: 2_800_000, source: 'ads', sponsored: true, message: 'वरात्रीसाठी १२ वादकांचे पथक हवे. मुंबईतून पुण्यात येतील का?' },
      { id: 'lead_8', vendorId: 'vnd_pune_mehendi_art', category: 'mehendi', status: 'won', createdOffset: -20, respondedOffset: -20, budgetPaise: 1_400_000, source: 'search', message: 'नवरीसाठी संपूर्ण हात व पाय, पाहुण्यांसाठी काउंटर.' },
      { id: 'lead_9', vendorId: 'vnd_pune_swar_dj', category: 'dj', status: 'lost', createdOffset: -16, respondedOffset: -15, budgetPaise: 3_000_000, source: 'category', message: 'स्वागत समारंभासाठी DJ व LED भिंत हवी.' },
      { id: 'lead_10', vendorId: 'vnd_nashik_sai_makeup', category: 'makeup', status: 'viewed', createdOffset: 0, budgetPaise: 2_800_000, source: 'search', message: `नवरी मेकअप, ${weddingDateText}, पुण्यात सेवा देता येईल का?` },
      { id: 'lead_11', vendorId: 'vnd_pune_aaiji_cakes', category: 'cake', status: 'won', createdOffset: -6, respondedOffset: -6, budgetPaise: 1_100_000, source: 'ai', message: 'आद्वैतच्या पहिल्या वाढदिवसासाठी जंगल थीम डेझर्ट टेबल.' },
      { id: 'lead_12', vendorId: 'vnd_satara_gauri_lighting', category: 'lighting', status: 'new', createdOffset: 0, budgetPaise: 2_600_000, source: 'search', message: 'मंडप प्रकाशयोजना व जनरेटर, सातारा येथे कार्यक्रम.' },
    ];

    for (const lead of leadSeed) {
      const created = atOffset(today, lead.createdOffset, 9 + (report.leads % 8), 15);
      const customer = lead.vendorId === 'vnd_pune_aaiji_cakes' ? 'usr_c_shweta' : 'usr_c_ramesh';
      /**
       * A reply is always *after* the enquiry. Deriving it from `created` (rather
       * than from an independent hour) keeps the SLA maths honest — a median
       * response time must never come out negative.
       */
      const respondedAt = lead.respondedOffset !== undefined
        ? new Date(new Date(created).getTime() + (18 + (report.leads % 9) * 11) * 60_000).toISOString()
        : undefined;
      store.marketplace.createLead({
        id: lead.id, eventId: lead.category === 'cake' ? 'evt_advait_birthday' : 'evt_patil_vivah',
        vendorId: lead.vendorId, customerUserId: customer, category: lead.category,
        message: lead.message, budgetPaise: lead.budgetPaise,
        eventDate: lead.category === 'cake' ? dayOffset(today, EVENT_OFFSETS.birthday) : dayOffset(today, EVENT_OFFSETS.wedding),
        guestCount: lead.category === 'cake' ? 60 : 650, status: lead.status, source: lead.source,
        sponsored: lead.sponsored ?? false, createdAt: created,
        ...(respondedAt ? { respondedAt } : {}),
      });
      report.leads += 1;

      // Conversation thread: vendor answers, customer replies.
      store.marketplace.addMessage({
        id: `msg_${lead.id}_1`, leadId: lead.id, sender: 'customer', body: lead.message ?? '',
        attachments: [], readAt: created, createdAt: created,
      });
      if (lead.respondedOffset !== undefined) {
        store.marketplace.addMessage({
          id: `msg_${lead.id}_2`, leadId: lead.id, sender: 'vendor',
          body: 'नमस्कार, आपल्या कार्यक्रमाबद्दल चौकशी मिळाली. पॅकेजचा तपशील व उपलब्धता पाठवत आहे. काही प्रश्न असतील तर विचारा.',
          attachments: [], readAt: created, createdAt: atOffset(today, lead.respondedOffset, 10, 5),
        });
      }
    }

    /* quotes */
    const quoteSeed: Array<{ id: string; leadId: string; vendorId: string; category: string; items: SeedPriceInput['items']; discount: number; status: 'sent' | 'accepted' | 'rejected'; created: number }> = [
      {
        id: 'qt_venue', leadId: 'lead_1', vendorId: 'vnd_chinchwad_mangal', category: 'venue',
        items: [
          { label: 'प्रिमियम सभागृह (८०० पाहुणे)', quantity: 1, unit: 'दिवस', unitPricePaise: 22_000_000 },
          { label: 'जेवण हॉल व वाढणी कर्मचारी', quantity: 1, unit: 'व्यवस्था', unitPricePaise: 3_500_000 },
          { label: 'अतिरिक्त ध्वनी यंत्रणा', quantity: 1, unit: 'संच', unitPricePaise: 1_200_000, optional: true },
        ],
        discount: 1_500_000, status: 'sent', created: 0,
      },
      {
        id: 'qt_photo', leadId: 'lead_2', vendorId: 'vnd_pune_kulkarni_studio', category: 'photographer',
        items: [
          { label: 'विवाह पॅकेज (दिवसभर)', quantity: 1, unit: 'पॅकेज', unitPricePaise: 6_500_000 },
          { label: 'ड्रोन शॉट', quantity: 1, unit: 'संच', unitPricePaise: 1_800_000 },
          { label: 'अतिरिक्त अल्बम', quantity: 2, unit: 'नग', unitPricePaise: 900_000 },
        ],
        discount: 500_000, status: 'accepted', created: -2,
      },
      {
        id: 'qt_decor', leadId: 'lead_3', vendorId: 'vnd_kolhapur_patil_decors', category: 'decorator',
        items: [
          { label: 'पैठणी थीम राजेशाही सजावट', quantity: 1, unit: 'पॅकेज', unitPricePaise: 18_500_000 },
          { label: 'हळदी सजावट', quantity: 1, unit: 'पॅकेज', unitPricePaise: 2_200_000 },
        ],
        discount: 1_000_000, status: 'accepted', created: -9,
      },
      {
        id: 'qt_print', leadId: 'lead_4', vendorId: 'vnd_pune_shubhmangal_printers', category: 'printer',
        items: [
          { label: 'पैठणी बॉर्डर स्पेशल पत्रिका (प्रति १००)', quantity: 5, unit: 'शेकडा', unitPricePaise: 3_100_000 },
          { label: 'खोके (प्रति १००)', quantity: 5, unit: 'शेकडा', unitPricePaise: 300_000 },
        ],
        discount: 900_000, status: 'accepted', created: -34,
      },
      {
        id: 'qt_caterer', leadId: 'lead_5', vendorId: 'vnd_pune_annapurna_caterers', category: 'caterer',
        items: [
          { label: 'राजेशाही मेनू (प्रति १००)', quantity: 6.5, unit: 'शेकडा', unitPricePaise: 6_800_000 },
          { label: 'जैन मेनू (प्रति १००)', quantity: 1, unit: 'शेकडा', unitPricePaise: 4_200_000 },
        ],
        discount: 2_000_000, status: 'sent', created: -3,
      },
      {
        id: 'qt_priest', leadId: 'lead_6', vendorId: 'vnd_pune_shubh_purohit', category: 'priest',
        items: [{ label: 'विवाह विधी (संपूर्ण)', quantity: 1, unit: 'विधी', unitPricePaise: 2_100_000 }],
        discount: 0, status: 'accepted', created: -40,
      },
      {
        id: 'qt_dhol', leadId: 'lead_7', vendorId: 'vnd_mumbai_shree_dhol', category: 'bhangra',
        items: [{ label: 'मोठे पथक (१२ वादक + नृत्य)', quantity: 1, unit: 'संच', unitPricePaise: 2_800_000 }],
        discount: 0, status: 'sent', created: -1,
      },
      {
        id: 'qt_mehendi', leadId: 'lead_8', vendorId: 'vnd_pune_mehendi_art', category: 'mehendi',
        items: [
          { label: 'नवरी मेहंदी (पूर्ण हात)', quantity: 1, unit: 'व्यक्ती', unitPricePaise: 800_000 },
          { label: 'पाहुण्यांसाठी मेहंदी काउंटर', quantity: 1, unit: 'संच', unitPricePaise: 1_400_000 },
        ],
        discount: 100_000, status: 'accepted', created: -20,
      },
      {
        id: 'qt_dj', leadId: 'lead_9', vendorId: 'vnd_pune_swar_dj', category: 'dj',
        items: [{ label: 'प्रिमियम LED + DJ', quantity: 1, unit: 'संच', unitPricePaise: 4_500_000 }],
        discount: 0, status: 'rejected', created: -16,
      },
      {
        id: 'qt_cake', leadId: 'lead_11', vendorId: 'vnd_pune_aaiji_cakes', category: 'cake',
        items: [
          { label: 'थीम केक (जंगल) — ३ किलो', quantity: 3, unit: 'किलो', unitPricePaise: 95_000 },
          { label: 'डेझर्ट टेबल (६० पाहुणे)', quantity: 1, unit: 'व्यवस्था', unitPricePaise: 1_100_000 },
        ],
        discount: 50_000, status: 'accepted', created: -6,
      },
    ];

    for (const quote of quoteSeed) {
      const totals = computeBreakdownForSeed({ category: quote.category, items: quote.items, discountPaise: quote.discount });
      store.marketplace.createQuote({
        id: quote.id, leadId: quote.leadId, vendorId: quote.vendorId,
        eventId: quote.leadId === 'lead_11' ? 'evt_advait_birthday' : 'evt_patil_vivah',
        items: quote.items.map((item) => ({ ...item, optional: item.optional ?? false })),
        discountPaise: quote.discount, subtotalPaise: totals.subtotalPaise, gstPaise: totals.gstPaise,
        totalPaise: totals.customerTotalPaise, validTill: dayOffset(today, 14), status: quote.status,
        createdAt: atOffset(today, quote.created, 11, 0),
        ...(quote.status === 'accepted' ? { acceptedAt: atOffset(today, quote.created + 1, 9, 30) } : {}),
      });
      report.quotes += 1;
    }

    /* bookings with a full, balanced ledger */
    const acceptedQuotes = quoteSeed.filter((quote) => quote.status === 'accepted');
    const stateByQuote: Record<string, string> = {
      qt_photo: 'SERVICE_SCHEDULED', qt_decor: 'SERVICE_SCHEDULED', qt_print: 'SETTLEMENT',
      qt_priest: 'REVIEWED', qt_mehendi: 'SERVICE_SCHEDULED', qt_cake: 'BOOKING_CONFIRMED',
    };
    for (const quote of acceptedQuotes) {
      const totals = computeBreakdownForSeed({ category: quote.category, items: quote.items, discountPaise: quote.discount });
      const state = stateByQuote[quote.id] ?? 'BOOKING_CONFIRMED';
      const bookingId = `bk_${quote.id}`;
      const history: Array<{ at: string; actor: string; from: string; to: string }> = [];
      const journey: Array<[string, string, number]> = [
        ['ENQUIRY', 'customer', quote.created - 1],
        ['QUOTE_SENT', 'vendor', quote.created],
        ['QUOTE_ACCEPTED', 'customer', quote.created + 1],
        ['PAYMENT_PENDING', 'system', quote.created + 1],
        ['BOOKING_CONFIRMED', 'system', quote.created + 1],
      ];
      if (['SERVICE_SCHEDULED', 'SETTLEMENT', 'REVIEWED'].includes(state)) journey.push(['SERVICE_SCHEDULED', 'vendor', quote.created + 2]);
      if (['SETTLEMENT', 'REVIEWED'].includes(state)) journey.push(['SERVICE_COMPLETED', 'vendor', quote.created + 3]);
      if (state === 'SETTLEMENT' || state === 'REVIEWED') journey.push(['SETTLEMENT', 'system', quote.created + 4]);
      if (state === 'REVIEWED') journey.push(['REVIEWED', 'customer', quote.created + 6]);

      for (let i = 1; i < journey.length; i += 1) {
        const [to, actor, offset] = journey[i]!;
        history.push({ at: atOffset(today, offset, 12, 0), actor, from: journey[i - 1]![0], to });
      }

      store.bookings.create({
        id: bookingId, eventId: quote.leadId === 'lead_11' ? 'evt_advait_birthday' : 'evt_patil_vivah',
        vendorId: quote.vendorId, leadId: quote.leadId, quoteId: quote.id, state,
        eventDate: dayOffset(today, quote.leadId === 'lead_11' ? EVENT_OFFSETS.birthday : EVENT_OFFSETS.wedding),
        totalPaise: totals.customerTotalPaise, advancePaise: Math.round(totals.customerTotalPaise * 0.3),
        commissionPaise: totals.commissionPaise, history,
        createdAt: atOffset(today, quote.created, 11, 30),
        ...(journey.some(([to]) => to === 'BOOKING_CONFIRMED') ? { confirmedAt: atOffset(today, quote.created + 1, 12, 0) } : {}),
        ...(journey.some(([to]) => to === 'SERVICE_COMPLETED') ? { completedAt: atOffset(today, quote.created + 3, 12, 0) } : {}),
      });

      // Ledger: money in, gateway cost recognised, vendor payable, GST owed, revenue.
      const commission = totals.commissionPaise;
      const gatewayFee = totals.gatewayFeePaise;
      const gatewayGst = Math.round(gatewayFee * 0.18);
      const revenue = commission;
      const vendorPayout = totals.taxablePaise - commission;
      store.bookings.appendLedger([
        { bookingId, account: 'PLATFORM_CASH', amountPaise: totals.customerTotalPaise, memo: 'ग्राहकाकडून पेमेंट', idempotencyKey: `${bookingId}:cash`, createdAt: atOffset(today, quote.created + 1, 12, 5) },
        { bookingId, account: 'GATEWAY_FEES', amountPaise: gatewayFee + gatewayGst, memo: 'गेटवे शुल्क + GST', idempotencyKey: `${bookingId}:fee`, createdAt: atOffset(today, quote.created + 1, 12, 5) },
        { bookingId, account: 'PLATFORM_CASH', amountPaise: -(gatewayFee + gatewayGst), memo: 'गेटवे शुल्क वजा', idempotencyKey: `${bookingId}:fee-cash`, createdAt: atOffset(today, quote.created + 1, 12, 5) },
        { bookingId, account: 'VENDOR_PAYABLE', amountPaise: -vendorPayout, memo: 'विक्रेत्याची देय रक्कम', idempotencyKey: `${bookingId}:payable`, createdAt: atOffset(today, quote.created + 1, 12, 5) },
        { bookingId, account: 'GST_PAYABLE', amountPaise: -totals.gstPaise, memo: 'GST देय', idempotencyKey: `${bookingId}:gst`, createdAt: atOffset(today, quote.created + 1, 12, 5) },
        { bookingId, account: 'PLATFORM_REVENUE', amountPaise: -revenue, memo: 'कमिशन उत्पन्न', idempotencyKey: `${bookingId}:revenue`, createdAt: atOffset(today, quote.created + 1, 12, 5) },
      ]);

      store.bookings.recordPayment({
        bookingId, kind: 'advance', provider: 'simulated', amountPaise: Math.round(totals.customerTotalPaise * 0.3),
        status: 'captured', idempotencyKey: `${bookingId}:pay:advance`,
        raw: { method: 'upi', note: '३०% अॅडव्हान्स' }, createdAt: atOffset(today, quote.created + 1, 12, 5),
      });

      if (['SETTLEMENT', 'REVIEWED'].includes(state)) {
        store.bookings.appendLedger([
          { bookingId, account: 'VENDOR_PAYABLE', amountPaise: vendorPayout, memo: 'दायित्व बंद', idempotencyKey: `${bookingId}:settle`, createdAt: atOffset(today, quote.created + 4, 15, 0) },
          { bookingId, account: 'PLATFORM_CASH', amountPaise: -vendorPayout, memo: 'बँक ट्रान्सफर', idempotencyKey: `${bookingId}:settle-cash`, createdAt: atOffset(today, quote.created + 4, 15, 0) },
        ]);
        store.bookings.createSettlement({
          id: `stl_${quote.id}`, bookingId, vendorId: quote.vendorId, amountPaise: vendorPayout, status: 'pending',
        });
      }
      report.bookings += 1;
    }

    /* A real print-quality dispute — shows the trust & safety workflow end to end. */
    store.bookings.openDispute({
      id: 'disp_1', bookingId: 'bk_qt_print', raisedBy: 'customer',
      reason: 'पत्रिकांमध्ये ५० नगांवर शाईचे डाग आले आहेत आणि बॉर्डरचा रंग फिकट आहे.',
      evidence: ['डाग असलेल्या पत्रिकेचा फोटो', 'मूळ स्वीकृत प्रूफ PDF', 'डिलिव्हरी पावती'],
    });
    store.marketplace.addMessage({
      id: 'msg_disp_1', leadId: 'lead_4', sender: 'system',
      body: 'तक्रार नोंदली गेली (वाद #disp_1). टीम ४८ तासांत प्रतिसाद देईल. पुनर्मुद्रण अथवा ₹४,६०० परतावा यापैकी पर्याय उपलब्ध आहेत.',
      attachments: [], createdAt: atOffset(today, -2, 16, 40),
    });

    /* ---------------- designs ---------------- */
    const designSeed: Array<{ id: string; eventId: string; name: string; template: string; scheme: string; status: 'draft' | 'approved' | 'printing' }> = [
      { id: 'dsg_patil_main', eventId: 'evt_patil_vivah', name: 'पाटील विवाह — पैठणी पत्रिका', template: 'tpl-paithani-royal', scheme: 'paithani', status: 'printing' },
      { id: 'dsg_patil_haldi', eventId: 'evt_patil_vivah', name: 'हळदी पत्रिका — मरिगोल्ड', template: 'tpl-haldi-marigold', scheme: 'traditional', status: 'approved' },
      { id: 'dsg_gruha_main', eventId: 'evt_deshmukh_gruhapravesh', name: 'गृहप्रवेश पत्रिका — मंदिर कमान', template: 'tpl-gruhapravesh-bless', scheme: 'temple', status: 'draft' },
      { id: 'dsg_advait_main', eventId: 'evt_advait_birthday', name: 'आद्वैत वाढदिवस — रंगीत', template: 'tpl-birthday-kids', scheme: 'modern', status: 'approved' },
    ];
    for (const design of designSeed) {
      const event = store.events.byId(design.eventId)!;
      const doc = seedDesignDocument({
        id: design.id,
        name: design.name,
        templateId: design.template,
        event: {
          eventType: event.eventType, title: event.title, hostNames: event.hostNames,
          eventDate: event.eventDate ?? dayOffset(today, 30), city: event.city,
          ...(event.venueName ? { venueName: event.venueName } : {}),
          ...(typeof event.muhurat?.label === 'string' ? { muhurat: { label: event.muhurat.label } } : {}),
        },
        qrPayload: `https://mazipatrika.in/e/${event.slug}`,
        includeEnglish: design.id === 'dsg_patil_main',
      });
      store.designs.create({
        id: design.id, eventId: design.eventId, ownerUserId: 'usr_c_ramesh', name: design.name,
        templateId: design.template, preset: doc.preset, scheme: design.scheme,
        doc, status: design.status,
        createdAt: iso(new Date(today.getTime() - 20 * DAY)),
      });
      report.designs += 1;
    }

    /* wishes on the public pages — the wall a guest actually sees */
    const wishSeed: Array<[string, string, string]> = [
      ['evt_patil_vivah', 'काकू — सौ. वैशाली देशपांडे', 'अशीच मंगलमय सुरुवात होवो. आशीर्वाद सदैव सोबत आहे!'],
      ['evt_patil_vivah', 'मित्र — श्री. अमोल जोशी', 'पत्रिका खूपच सुंदर आहे — पैठणी बॉर्डर अप्रतिम. भेटूया मुहूर्तावर.'],
      ['evt_patil_vivah', 'मावशी — सौ. लता कुलकर्णी', 'नवरा-नवरीला खूप खूप शुभेच्छा. आनंदी संसार होवो.'],
      ['evt_kale_satyanarayan', 'शेजारी — सौ. सुनीता देवकर', 'पूजेची पत्रिका मिळाली. नक्की येणार, प्रसादाची वाट पाहतेय!'],
      ['evt_deshmukh_gruhapravesh', 'मामा — श्री. दिनकर देशपांडे', 'नव्या घरात रिद्धी-सिद्धी नांदो. गृहप्रवेशाच्या मुहूर्तावर भेटतो.'],
    ];
    for (const [eventId, guestName, body] of wishSeed) {
      store.events.addWish({
        id: `wish_${eventId}_${body.length}`.slice(0, 40),
        eventId, guestName, body,
        createdAt: atOffset(today, -1, 19, 30),
      });
      report.wishes += 1;
    }

    /* ---------------- ads & analytics ---------------- */
    const campaignSeed: Array<[string, string, 'sponsored-search' | 'featured-category' | 'banner' | 'offer' | 'lead-gen', number, number, number, number, number, number]> = [
      ['camp_dhol', 'vnd_mumbai_shree_dhol', 'sponsored-search', 2_000_000, 740_000, 18_400, 1_120, 34, 6],
      ['camp_printers', 'vnd_pune_shubhmangal_printers', 'featured-category', 3_000_000, 1_860_000, 42_000, 2_600, 96, 21],
      ['camp_dj', 'vnd_pune_swar_dj', 'offer', 1_000_000, 520_000, 12_800, 640, 19, 2],
    ];
    for (const [id, vendorId, placement, budget, spent, impressions, views, leads, bookings] of campaignSeed) {
      store.ads.createCampaign({
        id, vendorId, placement, budgetPaise: budget, spentPaise: spent, active: true,
        targeting: { city: 'पुणे', eventTypes: ['wedding'] },
        metrics: { impressions, profileViews: views, leads, quotes: Math.round(leads * 0.4), bookings, bookingValuePaise: bookings * 25_000_000 },
        createdAt: iso(new Date(today.getTime() - 45 * DAY)),
      });
      report.campaigns += 1;
    }

    for (let offset = -59; offset <= 0; offset += 1) {
      const weekday = new Date(today.getTime() + offset * DAY).getUTCDay();
      const weekendBoost = weekday === 0 || weekday === 6 ? 1.4 : 1;
      const base = 6 + ((offset + 60) % 7);
      store.analytics.upsertDay({
        date: dayOffset(today, offset),
        newEvents: Math.round(base * weekendBoost * 0.6),
        activeEvents: 180 + (offset + 60) * 3,
        publishedInvitations: Math.round(base * 0.8),
        leads: Math.round(base * 3.2 * weekendBoost),
        quotes: Math.round(base * 1.5 * weekendBoost),
        bookings: Math.round(base * 0.5 * weekendBoost),
        gmvPaise: Math.round(base * 2_400_000 * weekendBoost),
        commissionPaise: Math.round(base * 240_000 * weekendBoost),
        medianResponseMinutes: 60 - Math.round((offset + 60) / 10),
        bookingConversion: Number((0.31 + (offset + 60) * 0.001).toFixed(4)),
        sponsoredImpressions: Math.round(base * 420 * weekendBoost),
        organicImpressions: Math.round(base * 1_650 * weekendBoost),
      });
      report.metricsDays += 1;
    }

    /* conversations & audit trail */
    store.assistant.createConversation({ id: 'conv_seed_1', userId: 'usr_c_ramesh', eventId: 'evt_patil_vivah', title: 'विवाह नियोजन — मुहूर्त व विक्रेते' });
    store.assistant.addMessage({
      id: 'am_seed_1', conversationId: 'conv_seed_1', role: 'user',
      content: `पुण्यात ${formatMarathiDate(`${dayOffset(today, EVENT_OFFSETS.wedding)}T00:00:00Z`, 'long')} ला लग्न आहे, ६५० पाहुणे, बजेट १८ लाख. मुहूर्त आणि छायाचित्रकार शोधा.`,
      provider: 'deterministic', model: 'mazi-rules-v1', tokensIn: 92, tokensOut: 0, costUsd: 0, latencyMs: 4,
      createdAt: iso(new Date(today.getTime() - 30 * DAY)),
    });
    store.assistant.addMessage({
      id: 'am_seed_2', conversationId: 'conv_seed_1', role: 'assistant',
      content: `${weddingDateText} — हा दिवस उत्तम अनुकूलतेचा आहे. मुहूर्त अनुकूलता (पद्धत: पारंपारिक मुहूर्त शास्त्र):\n  • ${weddingDateText} — उत्तम (९८/१००)\n  • ${formatMarathiDate(`${dayOffset(today, EVENT_OFFSETS.wedding + 6)}T00:00:00Z`, 'long')} — चांगला (८४/१००)\n\nउपलब्ध विक्रेते:\n  • कुलकर्णी पिक्चर्स — पासून ₹६५,००० ✓ पडताळलेले`,
      toolCalls: [{ tool: 'FindMuhurat', ok: true }, { tool: 'SearchVendors', ok: true }],
      provider: 'deterministic', model: 'mazi-rules-v1', tokensIn: 0, tokensOut: 210, costUsd: 0, latencyMs: 6,
      createdAt: iso(new Date(today.getTime() - 30 * DAY)),
    });
    store.audit.record({ actor: 'usr_admin_seema', action: 'seed.loaded', entity: 'system', entityId: 'seed', after: report, at: iso(today) });
  });

  return report;
}

export { COMMISSION_RATES };
