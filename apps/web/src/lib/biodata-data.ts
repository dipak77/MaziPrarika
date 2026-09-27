/* ── Mazi Patrika — Matrimonial Biodata Catalog & Schemas ──────────────── */

export type BiodataTemplateId =
  | "royal-purple"
  | "burgundy-damask"
  | "temple-portal"
  | "midnight-navy"
  | "heritage-maroon"
  | "emerald-garden"
  | "sapphire-moon"
  | "ivory-royal";

export interface BiodataTemplateMeta {
  id: BiodataTemplateId;
  name: string;
  nameHi: string;
  nameEn: string;
  desc: string;
  descHi: string;
  descEn: string;
  accentColor: string;
  bgGradient: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  photoStyle: "circle" | "square";
  price: number;
}

export const BIODATA_TEMPLATES: BiodataTemplateMeta[] = [
  {
    id: "royal-purple",
    name: "शाही जांभळा",
    nameHi: "शाही बैंगनी",
    nameEn: "Royal Purple Elegance",
    desc: "भव्य जांभळी छटा, सुवर्ण पिल-बॅज, वर्तुळाकार फोटो व श्रीगणेश सुलेखन.",
    descHi: "भव्य बैंगनी आभा, स्वर्णिम पिल बैज, गोलाकार चित्र और सुलेखन.",
    descEn: "Regal plum canvas with metallic gold pills, circular frame & ornate Ganesh.",
    accentColor: "#d4af37",
    bgGradient: "linear-gradient(165deg, #320b4d 0%, #1f0631 55%, #12031d 100%)",
    badgeBg: "linear-gradient(135deg, #fce09c 0%, #d4af37 50%, #9e7215 100%)",
    badgeText: "#2d0813",
    borderColor: "#c7a24f",
    photoStyle: "circle",
    price: 199,
  },
  {
    id: "burgundy-damask",
    name: "शाही किरमिजी",
    nameHi: "शाही महरून",
    nameEn: "Burgundy Damask & Crest",
    desc: "दमास्क विणकाम पार्श्वभूमी, सोनेरी लेस-काठ आणि रुबाबदार चौकोनी फ्रेम.",
    descHi: "दमास्क ब्रोकेड पृष्ठभूमि, स्वर्णिम लेस बॉर्डर और चौकोर फ्रेम.",
    descEn: "Rich textured brocade damask, ornate gold lace fretwork & framed portrait.",
    accentColor: "#e6cf92",
    bgGradient: "linear-gradient(170deg, #430d15 0%, #2e070d 60%, #1c0307 100%)",
    badgeBg: "linear-gradient(135deg, #f7dca1 0%, #d4af37 55%, #a1771b 100%)",
    badgeText: "#2d070d",
    borderColor: "#d9b96c",
    photoStyle: "square",
    price: 249,
  },
  {
    id: "temple-portal",
    name: "राजमहाल कमान",
    nameHi: "राजमहल मेहराब",
    nameEn: "Temple Portal & Arch",
    desc: "३D सुवर्ण मंदिर कमान, कळसावर गणेशमुद्रा व राजेशाही पुष्प-रेषा.",
    descHi: "३D स्वर्णिम मंदिर मेहराब, शिखर पर गणेशमुद्रा और राजसी नक्काशी.",
    descEn: "Layered royal temple arch dome with Ganesha apex & floral dividers.",
    accentColor: "#f3e1a6",
    bgGradient: "linear-gradient(180deg, #420f18 0%, #29080e 55%, #170307 100%)",
    badgeBg: "linear-gradient(135deg, #fae7b6 0%, #d4af37 55%, #8c600b 100%)",
    badgeText: "#3b0912",
    borderColor: "#e8d189",
    photoStyle: "square",
    price: 249,
  },
  {
    id: "midnight-navy",
    name: "शाही नीलवर्ण",
    nameHi: "शाही गहरा नीला",
    nameEn: "Midnight Navy Regal",
    desc: "गडद निळी पार्श्वभूमी, बॅरोक कोना-नक्षीकाम, गणेश वॉटरमार्क व दुहेरी सुवर्ण चौकट.",
    descHi: "गहरा नीला राजसी बैकग्राउंड, बैरोक कोना नक्काशी और गणेश वॉटरमार्क.",
    descEn: "Deep indigo navy with Victorian gold corner filigree & Ganesh watermark.",
    accentColor: "#f0e2bb",
    bgGradient: "linear-gradient(170deg, #131a38 0%, #0c1126 55%, #060914 100%)",
    badgeBg: "linear-gradient(135deg, #fce5a8 0%, #d4af37 55%, #946911 100%)",
    badgeText: "#0c1126",
    borderColor: "#d4af37",
    photoStyle: "square",
    price: 219,
  },
  {
    id: "heritage-maroon",
    name: "हेरिटेज मारून",
    nameHi: "हेरिटेज महरून",
    nameEn: "Heritage Floral Maroon",
    desc: "हेरिटेज पुष्प दमास्क, भव्य सुवर्ण कॉर्नर, वर्तुळाकार फोटो व सविस्तर कुंडली.",
    descHi: "पारंपरिक पुष्प दमास्क, स्वर्णिम कोने, गोल फोटो और संपूर्ण कुंडली.",
    descEn: "Opulent velvet maroon damask, Victorian corners & circular portrait.",
    accentColor: "#f2dfa8",
    bgGradient: "linear-gradient(165deg, #3d0912 0%, #25040a 55%, #140205 100%)",
    badgeBg: "linear-gradient(135deg, #fae6b4 0%, #d4af37 50%, #9e7215 100%)",
    badgeText: "#25040a",
    borderColor: "#e0bf6c",
    photoStyle: "circle",
    price: 229,
  },
  {
    id: "emerald-garden",
    name: "मरकत हिरवा",
    nameHi: "पन्ना हरा",
    nameEn: "Emerald Garden",
    desc: "निसर्गरम्य पाचू हिरवा पट, सुवर्ण कमळ व राजेशाही नक्षी.",
    descHi: "पन्ना हरी आभा, स्वर्णिम कमल और राजसी नक्काशी.",
    descEn: "Rich emerald green palette with radiant golden lotus bloom and leaf corners.",
    accentColor: "#e6c45c",
    bgGradient: "linear-gradient(165deg, #0b4222 0%, #072a15 55%, #031709 100%)",
    badgeBg: "linear-gradient(135deg, #fcedb8 0%, #e6c45c 50%, #8a6a2b 100%)",
    badgeText: "#072a15",
    borderColor: "#e6c45c",
    photoStyle: "circle",
    price: 239,
  },
  {
    id: "sapphire-moon",
    name: "नीलम चंद्र",
    nameHi: "नीलम मून",
    nameEn: "Sapphire Moon",
    desc: "गहन आकाशीय नीलम, चंद्र कोर व चांदी-सोनेरी चमक.",
    descHi: "गहरा आकाशीय नीलम, अर्धचंद्र और रजत-स्वर्णिम चमक.",
    descEn: "Celestial sapphire midnight canvas with crescent motif and silver-gold filigree.",
    accentColor: "#c5d4f0",
    bgGradient: "linear-gradient(170deg, #0e2254 0%, #081538 55%, #040a22 100%)",
    badgeBg: "linear-gradient(135deg, #e6efff 0%, #c5d4f0 50%, #6882b5 100%)",
    badgeText: "#081538",
    borderColor: "#c5d4f0",
    photoStyle: "circle",
    price: 249,
  },
  {
    id: "ivory-royal",
    name: "राजेशाही हस्तिदंत",
    nameHi: "शाही आइवरी",
    nameEn: "Ivory Royal Gold",
    desc: "अभिजात हस्तिदंती पार्श्वभूमी, पैसले काठ व पारंपरिक गणेशमुद्रा.",
    descHi: "क्लासिक आइवरी पृष्ठभूमि, पैस्ले बॉर्डर और पारंपरिक गणेश मुद्रा.",
    descEn: "Aristocratic ivory cream paper with rich paisleys, gold seals & brown filigree.",
    accentColor: "#8a6a2b",
    bgGradient: "linear-gradient(180deg, #fdf8ec 0%, #f4e9cf 50%, #ebdcb5 100%)",
    badgeBg: "linear-gradient(135deg, #f5ebd3 0%, #d9b96c 50%, #8a6a2b 100%)",
    badgeText: "#3d2a0a",
    borderColor: "#8a6a2b",
    photoStyle: "circle",
    price: 219,
  },
];

export interface BiodataData {
  template: BiodataTemplateId;
  lang: "mr" | "hi" | "en";
  blessing: string;
  title: string;
  photoUrl: string;
  photoShape?: "circle" | "square";

  /* Personal Details */
  fullName: string;
  gender: "groom" | "bride";
  dob: string; // YYYY-MM-DD
  tob: string; // e.g. "सकाळी ०८:४५ वा."
  pob: string; // e.g. "पुणे, महाराष्ट्र"
  height: string; // e.g. "५ फूट ७ इंच"
  weight: string; // e.g. "६२ किलो"
  complexion: string; // e.g. "गोरा / Fair"
  bloodGroup: string; // e.g. "O +ve"

  /* Horoscope / Astrological Details */
  rashi: string; // e.g. "मकर (कुंभ)"
  nakshatra: string; // e.g. "उत्तराषाढा"
  gotra: string; // e.g. "कश्यप / भारद्वाज"
  caste: string; // e.g. "हिंदू - मराठा ९६ कुळी"
  subCaste: string; // e.g. "देशस्थ"
  mangal: string; // e.g. "नाही (निर्दोष)" / "सौम्य"
  charan: string; // e.g. "२"
  gan: string; // e.g. "मनुष्य / देव"
  nadi: string; // e.g. "मध्य"

  /* Education & Career Details */
  education: string; // e.g. "B.Tech (Computer Science), COEP Pune"
  college: string; // e.g. "पुणे विद्यापीठ"
  occupation: string; // e.g. "सीनिअर सॉफ्टवेअर इंजिनिअर"
  company: string; // e.g. "टाटा कन्सल्टन्सी सर्व्हिसेस, पुणे"
  annualIncome: string; // e.g. "₹ २२ लाख प्रतिवर्ष"

  /* Family Details */
  fatherName: string; // e.g. "श्री. प्रमोद विठ्ठलराव देशमुख"
  fatherOccupation: string; // e.g. "निवृत्त उपअभियंता (MSEB)"
  motherName: string; // e.g. "सौ. जयश्री प्रमोद देशमुख"
  motherOccupation: string; // e.g. "गृहिणी"
  brothers: string; // e.g. "१ भाऊ (विवाहित, बँक अधिकारी)"
  sisters: string; // e.g. "१ बहीण (विवाहित)"
  maternalUncle: string; // मामा: "श्री. विलासराव कदम (सातारा)"
  relativeSurnames: string; // e.g. "पाटील, कदम, जगताप, गायकवाड, भोसले"

  /* Contact & Residence Details */
  contactPerson: string; // e.g. "श्री. प्रमोद देशमुख (वडील)"
  phone: string; // e.g. "98765 43210"
  whatsapp: string; // e.g. "98765 43210"
  email: string; // e.g. "deshmukh.family@example.com"
  address: string; // e.g. "फ्लॅट क्र. ४०२, शिवनेरी हाइट्स, बाणेर"
  city: string; // e.g. "पुणे, महाराष्ट्र - ४११०४५"

  /* Personal Note / About */
  aboutMe: string; // brief statement
}

/* ── Sample Portraits ─────────────────────────────────────────────────── */
export const SAMPLE_PORTRAITS = {
  groom1:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  groom2:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  groom3:
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  bride1:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  bride2:
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  bride3:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
};

/* ── Default Presets ──────────────────────────────────────────────────── */

export const DEFAULT_BIODATA_MR: BiodataData = {
  template: "royal-purple",
  lang: "mr",
  blessing: "॥ श्री गणेशाय नमः ॥",
  title: "विवाह बायोडाटा",
  photoUrl: SAMPLE_PORTRAITS.groom1,
  photoShape: "circle",

  fullName: "चि. संकेत प्रमोदराव देशमुख",
  gender: "groom",
  dob: "1997-05-18",
  tob: "सकाळी ०९:२५ वा.",
  pob: "पुणे, महाराष्ट्र",
  height: "५ फूट ९ इंच",
  weight: "६८ किलो",
  complexion: "गोरा",
  bloodGroup: "B +ve",

  rashi: "कन्या (Virgo)",
  nakshatra: "हस्त",
  gotra: "कश्यप",
  caste: "हिंदू - मराठा (९६ कुळी)",
  subCaste: "देशमुख",
  mangal: "नाही (निर्दोष पत्रिका)",
  charan: "३",
  gan: "देव गण",
  nadi: "आद्य",

  education: "B.Tech (Computer Science), COEP Pune",
  college: "सीओईपी टेक्नॉलॉजिकल युनिव्हर्सिटी",
  occupation: "सीनिअर सॉफ्टवेअर इंजिनिअर",
  company: "मायक्रोसॉफ्ट इंडिया प्रा. लि., पुणे",
  annualIncome: "₹ २४.५ लाख प्रतिवर्ष",

  fatherName: "श्री. प्रमोद विठ्ठलराव देशमुख",
  fatherOccupation: "निवृत्त उपअभियंता (जलसंपदा विभाग, महाराष्ट्र शासन)",
  motherName: "सौ. जयश्री प्रमोद देशमुख",
  motherOccupation: "गृहिणी",
  brothers: "१ भाऊ (लहान, B.E. शिकत आहे)",
  sisters: "१ बहीण (विवाहित, M.Sc, शिक्षिका - मुंबई)",
  maternalUncle: "श्री. विलासराव गणपत कदम (सातारा)",
  relativeSurnames: "पाटील, कदम, जगताप, शिंदे, सावंत, घोरपडे",

  contactPerson: "श्री. प्रमोद देशमुख (वडील)",
  phone: "98220 14567",
  whatsapp: "98220 14567",
  email: "deshmukh.family.pune@gmail.com",
  address: "फ्लॅट क्र. ४०२, शिवनेरी हाइट्स, बाणेर",
  city: "पुणे, महाराष्ट्र - ४११०४५",

  aboutMe:
    "शांत व सुसंस्कृत स्वभाव, पारंपरिक मूल्यांवर दृढ निष्ठा आणि आधुनिक विचारसरणी. कौटुंबिक जिव्हाळा, वाचन आणि पर्यटनाची आवड.",
};

export const DEFAULT_BIODATA_HI: BiodataData = {
  template: "burgundy-damask",
  lang: "hi",
  blessing: "॥ श्री गणेशाय नमः ॥",
  title: "विवाह बायोडाटा",
  photoUrl: SAMPLE_PORTRAITS.groom2,
  photoShape: "square",

  fullName: "संजय कुमार यादव",
  gender: "groom",
  dob: "1998-08-22",
  tob: "प्रातः ०८:३० बजे",
  pob: "नई दिल्ली",
  height: "५ फीट ११ इंच",
  weight: "७२ किग्रा",
  complexion: "गौर वर्ण",
  bloodGroup: "O +ve",

  rashi: "मिथुन (Gemini)",
  nakshatra: "आर्द्रा",
  gotra: "कश्यप",
  caste: "हिंदू - यादव",
  subCaste: "अहीर",
  mangal: "नहीं (निर्दोष)",
  charan: "२",
  gan: "मनुष्य गण",
  nadi: "मध्य",

  education: "B.Tech + MBA (Finance)",
  college: "आईआईटी दिल्ली / आईआईएम लखनऊ",
  occupation: "प्रोडक्ट मैनेजर",
  company: "टाटा डिजिटल, नई दिल्ली",
  annualIncome: "₹ २८ लाख प्रतिवर्ष",

  fatherName: "श्री प्रमोद सिंह यादव",
  fatherOccupation: "सहायक महाप्रबंधक (AGM), स्टेट बैंक ऑफ इंडिया",
  motherName: "श्रीमती मीना सिंह",
  motherOccupation: "गृहणी",
  brothers: "१ छोटा भाई (एमबीबीएस अध्ययनरत)",
  sisters: "१ बहन (विवाहित, प्राध्यापिका)",
  maternalUncle: "श्री रवींद्रनाथ यादव (वाराणसी)",
  relativeSurnames: "यादव, वर्मा, सिंह, चौधरी",

  contactPerson: "श्री प्रमोद सिंह यादव (पिताजी)",
  phone: "98110 56789",
  whatsapp: "98110 56789",
  email: "pramod.yadav.sbi@gmail.com",
  address: "बी-४२, गुलमोहर एन्क्लेव, साकेत",
  city: "नई दिल्ली - ११००१७",

  aboutMe:
    "संस्कारवान, शांत एवं प्रगतिशील विचार. पारिवारिक मूल्यों के प्रति समर्पित. संगीत, यात्रा एवं फिटनेस में रुचि.",
};

export const DEFAULT_BIODATA_EN: BiodataData = {
  template: "royal-purple",
  lang: "en",
  blessing: "॥ Shri Ganeshaya Namah ॥",
  title: "Marriage Biodata",
  photoUrl: SAMPLE_PORTRAITS.bride1,
  photoShape: "circle",

  fullName: "Aarohi Rajesh Sharma",
  gender: "bride",
  dob: "1999-02-14",
  tob: "10:30 AM",
  pob: "Jaipur, Rajasthan",
  height: "5 feet 5 inches",
  weight: "54 kg",
  complexion: "Fair",
  bloodGroup: "A +ve",

  rashi: "Tula (Libra)",
  nakshatra: "Swati",
  gotra: "Bhardwaj",
  caste: "Hindu - Brahmin",
  subCaste: "Gour",
  mangal: "No (Non-Manglik)",
  charan: "1",
  gan: "Dev Gan",
  nadi: "Antya",

  education: "M.Des, National Institute of Design (NID)",
  college: "NID Ahmedabad",
  occupation: "Senior Product Designer",
  company: "Adobe Systems, Bangalore",
  annualIncome: "₹ 24 Lakhs per annum",

  fatherName: "Mr. Rajesh Sharma",
  fatherOccupation: "Executive Engineer (Retd. PWD)",
  motherName: "Mrs. Sunita Sharma",
  motherOccupation: "Homemaker",
  brothers: "1 younger brother (B.Tech, IIT Bombay)",
  sisters: "None",
  maternalUncle: "Mr. Kailash Nath Tiwari (Jaipur)",
  relativeSurnames: "Sharma, Tiwari, Joshi, Mishra, Shukla",

  contactPerson: "Mr. Rajesh Sharma (Father)",
  phone: "98765 12340",
  whatsapp: "98765 12340",
  email: "rajesh.sharma.jpr@gmail.com",
  address: "Plot 18, Royal Enclave, C-Scheme",
  city: "Jaipur, Rajasthan - 302001",

  aboutMe:
    "Artistic, positive-minded and grounded in traditional cultural roots while embracing modern aspirations. Fond of fine art, reading, classical music and travel.",
};

/* ── Instant Preset Profiles ─────────────────────────────────────────── */

export interface PresetProfile {
  id: string;
  labelMr: string;
  labelHi: string;
  labelEn: string;
  data: BiodataData;
}

export const BIODATA_PRESETS: PresetProfile[] = [
  {
    id: "groom-tech-lead",
    labelMr: "वर · सॉफ्टवेअर आर्किटेक्ट (पुणे)",
    labelHi: "वर · सॉफ्टवेयर आर्किटेक्ट (पुणे)",
    labelEn: "Groom · Software Architect (Pune)",
    data: {
      ...DEFAULT_BIODATA_MR,
      template: "royal-purple",
    },
  },
  {
    id: "bride-product-designer",
    labelMr: "वधू · प्रॉडक्ट डिझायनर (NID / Adobe)",
    labelHi: "वधू · प्रोडक्ट डिजाइनर (NID / Adobe)",
    labelEn: "Bride · Product Designer (NID / Adobe)",
    data: {
      ...DEFAULT_BIODATA_EN,
      lang: "mr",
      blessing: "॥ श्री गणेशाय नमः ॥",
      title: "विवाह बायोडाटा",
      fullName: "चि. सौ. कां. आरोही राजेश शर्मा",
      gender: "bride",
      dob: "1999-02-14",
      tob: "सकाळी १०:३० वा.",
      pob: "जयपूर / पुणे",
      height: "५ फूट ५ इंच",
      weight: "५४ किलो",
      complexion: "गोरा",
      bloodGroup: "A +ve",
      rashi: "तुळ (Libra)",
      nakshatra: "स्वाती",
      gotra: "भारद्वाज",
      caste: "हिंदू - ब्राह्मण",
      subCaste: "गौड",
      mangal: "नाही (निर्दोष)",
      charan: "१",
      gan: "देव गण",
      nadi: "अंत्य",
      education: "M.Des, National Institute of Design (NID)",
      college: "एनआयडी अहमदाबाद",
      occupation: "सीनिअर प्रॉडक्ट डिझायनर",
      company: "अडोबी सिस्टीम्स प्रा. लि.",
      annualIncome: "₹ २४ लाख प्रतिवर्ष",
      fatherName: "श्री. राजेश शर्मा",
      fatherOccupation: "कार्यकारी अभियंता (निवृत्त सार्वजनिक बांधकाम विभाग)",
      motherName: "सौ. सुनिता शर्मा",
      motherOccupation: "गृहिणी",
      brothers: "१ लहान भाऊ (B.Tech, IIT Bombay)",
      sisters: "नाही",
      maternalUncle: "श्री. कैलासनाथ तिवारी (जयपूर)",
      relativeSurnames: "शर्मा, तिवारी, जोशी, मिश्रा, शुक्ला",
      contactPerson: "श्री. राजेश शर्मा (वडील)",
      phone: "98765 12340",
      whatsapp: "98765 12340",
      email: "rajesh.sharma@example.com",
      address: "प्लॉट १८, रॉयल एन्क्लेव्ह",
      city: "पुणे / जयपूर",
      aboutMe:
        "कलाप्रिय, सुसंस्कृत आणि स्वतंत्र विचारांची. पारंपरिक कौटुंबिक मूल्यांचा आदर ठेवून आधुनिक वाटचाल. वाचन, शास्त्रीय संगीत आणि पर्यटनाची आवड.",
      template: "royal-purple",
    },
  },
  {
    id: "groom-bank-manager",
    labelMr: "वर · बँक व्यवस्थापक व सीए (मुंबई)",
    labelHi: "वर · बैंक प्रबंधक व सीए (मुंबई)",
    labelEn: "Groom · Bank Manager & CA (Mumbai)",
    data: {
      ...DEFAULT_BIODATA_MR,
      template: "burgundy-damask",
      fullName: "चि. अमित कुमार निषाद (सीए)",
      dob: "1996-08-15",
      tob: "सकाळी १०:३० वा.",
      pob: "पुणे, महाराष्ट्र",
      height: "५ फूट ८ इंच",
      weight: "७४ किलो",
      complexion: "गोरा",
      bloodGroup: "B +ve",
      rashi: "कुंभ (Aquarius)",
      nakshatra: "शतभिषा",
      gotra: "कश्यप",
      caste: "हिंदू - निषाद",
      education: "B.Tech (COEP) + CA (Chartered Accountant)",
      college: "आयसीएआय, मुंबई",
      occupation: "डेप्युटी मॅनेजर, स्टेट बँक ऑफ इंडिया",
      company: "स्टेट बँक ऑफ इंडिया कॉर्पोरेट सेंटर, मुंबई",
      annualIncome: "₹ २२ लाख प्रतिवर्ष",
      fatherName: "श्री. प्रमोद सिंह निषाद",
      fatherOccupation: "निवृत्त उपविभागीय अधिकारी",
      motherName: "सौ. मीना निषाद",
      motherOccupation: "गृहिणी",
      brothers: "२ भाऊ (दोघे विवाहित व नोकरीत)",
      sisters: "नाही",
      aboutMe:
        "शांत व संयमी स्वभाव, ज्येष्ठांचा आदर आणि कामात चिकाटी. सामाजिक उपक्रमांत सहभाग आणि निरोगी जीवनशैली.",
    },
  },
  {
    id: "bride-doctor-md",
    labelMr: "वधू · डॉक्टर (M.D. मेडिसिन, पुणे)",
    labelHi: "वधू · डॉक्टर (M.D. मेडिसिन, पुणे)",
    labelEn: "Bride · Doctor (M.D. Medicine, Pune)",
    data: {
      ...DEFAULT_BIODATA_MR,
      template: "temple-portal",
      photoUrl: SAMPLE_PORTRAITS.bride2,
      fullName: "डॉ. चि. सौ. कां. पूजा श्रीकांत कुलकर्णी (M.D.)",
      gender: "bride",
      dob: "1998-11-20",
      tob: "दुपारी १२:१५ वा.",
      pob: "सातारा, महाराष्ट्र",
      height: "५ फूट ४ इंच",
      weight: "५३ किलो",
      complexion: "अतिगोरा",
      bloodGroup: "O +ve",
      rashi: "वृश्चिक (Scorpio)",
      nakshatra: "अनुराधा",
      gotra: "कौशिक",
      caste: "हिंदू - ब्राह्मण",
      subCaste: "देशस्थ ऋग्वेदी",
      mangal: "नाही (निर्दोष)",
      charan: "२",
      gan: "देव गण",
      nadi: "मध्य",
      education: "MBBS, M.D. (General Medicine)",
      college: "बी. जे. मेडिकल कॉलेज, पुणे",
      occupation: "कन्सल्टंट फिजिशियन",
      company: "दीनानाथ मंगेशकर रुग्णालय, पुणे",
      annualIncome: "₹ २६ लाख प्रतिवर्ष",
      fatherName: "डॉ. श्रीकांत विष्णू कुलकर्णी (सर्जन)",
      fatherOccupation: "स्वतःचे हॉस्पिटल, सातारा",
      motherName: "डॉ. सौ. स्मिता श्रीकांत कुलकर्णी (बालरोगतज्ज्ञ)",
      motherOccupation: "स्वतःचे हॉस्पिटल, सातारा",
      brothers: "१ लहान भाऊ (एमबीबीएस अंतिम वर्ष)",
      sisters: "नाही",
      maternalUncle: "श्री. डॉ. अविनाश जोशी (पुणे)",
      relativeSurnames: "कुलकर्णी, जोशी, पटवर्धन, बापट, केतकर",
      contactPerson: "डॉ. श्रीकांत कुलकर्णी (वडील)",
      phone: "98230 45678",
      whatsapp: "98230 45678",
      email: "dr.kulkarni.satara@gmail.com",
      address: "कुलकर्णी हॉस्पिटल कॅम्पस, सदर बझार",
      city: "सातारा / पुणे, महाराष्ट्र",
      aboutMe:
        "सेवाभावी वृत्ती, अभ्यासू स्वभाव व उत्कृष्ट संवाद कौशल्य. कौटुंबिक सौख्याला सर्वोच्च प्राधान्य. वाचन व शास्त्रीय नृत्याची आवड.",
    },
  },
  {
    id: "groom-entrepreneur",
    labelMr: "वर · उद्योजक / बिझनेस ओनर (नाशिक/पुणे)",
    labelHi: "वर · उद्योजक / बिज़नेस ओनर (नाशिक/पुणे)",
    labelEn: "Groom · Business Owner / Entrepreneur",
    data: {
      ...DEFAULT_BIODATA_MR,
      template: "midnight-navy",
      photoUrl: SAMPLE_PORTRAITS.groom3,
      fullName: "चि. आदित्य रमेशराव पाटील",
      gender: "groom",
      dob: "1996-03-24",
      tob: "सकाळी ०७:४० वा.",
      pob: "नाशिक, महाराष्ट्र",
      height: "६ फूट ० इंच",
      weight: "७५ किलो",
      complexion: "गव्हाळ निमगोरा",
      bloodGroup: "B +ve",
      rashi: "मेष (Aries)",
      nakshatra: "अश्विनी",
      gotra: "गौतम",
      caste: "हिंदू - मराठा (९६ कुळी)",
      education: "B.E. (Mechanical) + MBA (Operations)",
      college: "व्हीआयटी पुणे",
      occupation: "व्यवस्थापकीय संचालक (MD)",
      company: "पाटील ॲग्रो फूड्स व एक्सपोर्ट्स",
      annualIncome: "₹ ४५+ लाख प्रतिवर्ष (वार्षिक नफा)",
      fatherName: "श्री. रमेशराव बाबुराव पाटील",
      fatherOccupation: "प्रगतिशील शेतकरी व उद्योजक",
      motherName: "सौ. सरला रमेशराव पाटील",
      motherOccupation: "गृहिणी",
      brothers: "१ भाऊ (विवाहित, व्यवसायात भागीदार)",
      sisters: "१ बहीण (विवाहित, नाशिक)",
      aboutMe:
        "कष्टाळू, सकारात्मक आणि दूरदृष्टी असलेला. परंपरा आणि आधुनिक व्यवसायाचा समतोल साधणारा. निसर्गभ्रमण आणि खेळांची आवड.",
    },
  },
];

/* ── Localized UI Labels for Biodata Fields ───────────────────────────── */

export const BIODATA_LABELS = {
  mr: {
    sectionPersonal: "वैयक्तिक माहिती",
    sectionHoroscope: "कुंडली व जन्म तपशील",
    sectionCareer: "शिक्षण व नोकरी",
    sectionFamily: "कौटुंबिक माहिती",
    sectionContact: "संपर्क व पत्ता",
    sectionAbout: "स्वतःबद्दल माहिती",

    fullName: "पूर्ण नाव",
    gender: "लिंग",
    genderGroom: "वर",
    genderBride: "वधू",
    dob: "जन्मतारीख",
    tob: "जन्मवेळ",
    pob: "जन्मस्थळ",
    height: "उंची",
    weight: "वजन",
    complexion: "वर्ण / रंग",
    bloodGroup: "रक्तगट",

    rashi: "रास",
    nakshatra: "नक्षत्र",
    gotra: "गोत्र",
    caste: "जात / संप्रदाय",
    subCaste: "पोटजात",
    mangal: "मंगळ / दोष",
    charan: "चरण",
    gan: "गण",
    nadi: "नाडी",

    education: "उच्च शिक्षण",
    college: "कॉलेज / युनिव्हर्सिटी",
    occupation: "व्यवसाय / नोकरी",
    company: "कंपनी / फर्म",
    annualIncome: "वार्षिक उत्पन्न",

    fatherName: "वडिलांचे नाव",
    fatherOccupation: "वडिलांचा व्यवसाय",
    motherName: "आईचे नाव",
    motherOccupation: "आईचा व्यवसाय",
    brothers: "भाऊ",
    sisters: "बहिणी",
    maternalUncle: "मामा (मामाचे गाव)",
    relativeSurnames: "नातेसंबंधी आडनावे",

    contactPerson: "संपर्क व्यक्ती",
    phone: "मोबाईल नंबर",
    whatsapp: "व्हॉट्सअॅप नंबर",
    email: "ईमेल पत्ता",
    address: "राहण्याचा पत्ता",
    city: "शहर व पिनकोड",
    aboutMe: "स्वतःबद्दल थोडक्यात",

    btnCopyWa: "व्हॉट्सअॅप मजकूर प्रत करा",
    btnPrint: "बायोडाटा प्रिंट / PDF",
    presetSelect: "पूर्व-डिझाइन प्रोफाईल निवडा",
    templateSelect: "बायोडाटा टेम्पलेट निवडा",
  },
  hi: {
    sectionPersonal: "व्यक्तिगत विवरण",
    sectionHoroscope: "कुंडली व जन्म विवरण",
    sectionCareer: "शिक्षा व व्यवसाय",
    sectionFamily: "पारिवारिक विवरण",
    sectionContact: "संपर्क व पता",
    sectionAbout: "आत्मपरिचय",

    fullName: "पूरा नाम",
    gender: "लिंग",
    genderGroom: "वर",
    genderBride: "वधू",
    dob: "जन्म तिथि",
    tob: "जन्म समय",
    pob: "जन्म स्थान",
    height: "ऊँचाई",
    weight: "वजन",
    complexion: "वर्ण",
    bloodGroup: "रक्त समूह",

    rashi: "राशि",
    nakshatra: "नक्षत्र",
    gotra: "गोत्र",
    caste: "जाति / समुदाय",
    subCaste: "उपजाति",
    mangal: "मांगलिक स्थिति",
    charan: "चरण",
    gan: "गण",
    nadi: "नाड़ी",

    education: "उच्च शिक्षा",
    college: "कॉलेज / विश्वविद्यालय",
    occupation: "व्यवसाय / पद",
    company: "कंपनी / संस्था",
    annualIncome: "वार्षिक आय",

    fatherName: "पिता का नाम",
    fatherOccupation: "पिता का व्यवसाय",
    motherName: "माता का नाम",
    motherOccupation: "माता का व्यवसाय",
    brothers: "भाई",
    sisters: "बहनें",
    maternalUncle: "मामा (ननिहाल)",
    relativeSurnames: "रिश्तेदार उपनाम",

    contactPerson: "संपर्क सूत्र",
    phone: "मोबाइल नंबर",
    whatsapp: "व्हाट्सएप नंबर",
    email: "ईमेल आईडी",
    address: "स्थायी पता",
    city: "शहर व पिन कोड",
    aboutMe: "संक्षिप्त परिचय",

    btnCopyWa: "व्हाट्सएप संदेश कॉपी करें",
    btnPrint: "बायोडाटा प्रिंट / PDF",
    presetSelect: "पूर्व-निर्मित प्रोफाइल चुनें",
    templateSelect: "बायोडाटा टेम्पलेट चुनें",
  },
  en: {
    sectionPersonal: "Personal Details",
    sectionHoroscope: "Horoscope & Astrological Details",
    sectionCareer: "Education & Career",
    sectionFamily: "Family Background",
    sectionContact: "Contact & Residence",
    sectionAbout: "About Candidate",

    fullName: "Full Name",
    gender: "Gender",
    genderGroom: "Groom",
    genderBride: "Bride",
    dob: "Date of Birth",
    tob: "Time of Birth",
    pob: "Place of Birth",
    height: "Height",
    weight: "Weight",
    complexion: "Complexion",
    bloodGroup: "Blood Group",

    rashi: "Rashi (Moon Sign)",
    nakshatra: "Nakshatra",
    gotra: "Gotra",
    caste: "Caste / Community",
    subCaste: "Sub-caste",
    mangal: "Manglik Status",
    charan: "Charan",
    gan: "Gan",
    nadi: "Nadi",

    education: "Highest Education",
    college: "College / University",
    occupation: "Occupation / Designation",
    company: "Company / Organization",
    annualIncome: "Annual Income",

    fatherName: "Father's Name",
    fatherOccupation: "Father's Occupation",
    motherName: "Mother's Name",
    motherOccupation: "Mother's Occupation",
    brothers: "Brothers",
    sisters: "Sisters",
    maternalUncle: "Maternal Uncle (Mosal)",
    relativeSurnames: "Relative Surnames",

    contactPerson: "Contact Person",
    phone: "Phone Number",
    whatsapp: "WhatsApp Number",
    email: "Email Address",
    address: "Residential Address",
    city: "City & PIN Code",
    aboutMe: "About Candidate",

    btnCopyWa: "Copy WhatsApp Text",
    btnPrint: "Print / Save PDF",
    presetSelect: "Select Preset Profile",
    templateSelect: "Select Biodata Template",
  },
} as const;

/**
 * Generates ready-to-share WhatsApp text from BiodataData
 */
export function formatBiodataAsWhatsAppText(data: BiodataData): string {
  const isEn = data.lang === "en";
  const isHi = data.lang === "hi";

  const t = BIODATA_LABELS[data.lang] || BIODATA_LABELS.mr;

  const lines = [
    `*${data.blessing || "॥ श्री गणेशाय नमः ॥"}*`,
    `*${data.title || (isEn ? "MARRIAGE BIODATA" : isHi ? "विवाह बायोडाटा" : "विवाह बायोडाटा")}*`,
    `──────────────────────────`,
    `*${t.sectionPersonal.toUpperCase()}*`,
    `• *${t.fullName}:* ${data.fullName}`,
    `• *${t.dob}:* ${data.dob}`,
    data.tob ? `• *${t.tob}:* ${data.tob}` : null,
    data.pob ? `• *${t.pob}:* ${data.pob}` : null,
    data.height ? `• *${t.height}:* ${data.height}` : null,
    data.complexion ? `• *${t.complexion}:* ${data.complexion}` : null,
    data.caste ? `• *${t.caste}:* ${data.caste}` : null,
    data.gotra ? `• *${t.gotra}:* ${data.gotra}` : null,
    data.rashi ? `• *${t.rashi}:* ${data.rashi}` : null,
    data.nakshatra ? `• *${t.nakshatra}:* ${data.nakshatra}` : null,
    data.mangal ? `• *${t.mangal}:* ${data.mangal}` : null,
    ``,
    `*${t.sectionCareer.toUpperCase()}*`,
    `• *${t.education}:* ${data.education}`,
    data.occupation ? `• *${t.occupation}:* ${data.occupation}` : null,
    data.company ? `• *${t.company}:* ${data.company}` : null,
    data.annualIncome ? `• *${t.annualIncome}:* ${data.annualIncome}` : null,
    ``,
    `*${t.sectionFamily.toUpperCase()}*`,
    `• *${t.fatherName}:* ${data.fatherName} (${data.fatherOccupation})`,
    `• *${t.motherName}:* ${data.motherName} (${data.motherOccupation})`,
    data.brothers ? `• *${t.brothers}:* ${data.brothers}` : null,
    data.sisters ? `• *${t.sisters}:* ${data.sisters}` : null,
    data.maternalUncle ? `• *${t.maternalUncle}:* ${data.maternalUncle}` : null,
    data.relativeSurnames ? `• *${t.relativeSurnames}:* ${data.relativeSurnames}` : null,
    ``,
    `*${t.sectionContact.toUpperCase()}*`,
    `• *${t.contactPerson}:* ${data.contactPerson}`,
    `• *${t.phone}:* ${data.phone}`,
    data.whatsapp ? `• *${t.whatsapp}:* ${data.whatsapp}` : null,
    data.address ? `• *${t.address}:* ${data.address}, ${data.city}` : null,
    ``,
    data.aboutMe ? `*${t.sectionAbout}:*\n_${data.aboutMe}_` : null,
  ].filter((line) => line !== null);

  return lines.join("\n");
}
