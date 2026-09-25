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

export const uiCopy = {
  mr: {
    header: {
      mantra: '॥ श्री गणेशाय नमः ॥',
      tagline: 'महाराष्ट्र आवृत्ती • सूर्यसिद्धांत पंचांग • अचूक छपाई व सुरक्षित खातेवही',
      livePanchang: 'थेट पंचांग सक्रिय',
      studio: 'क्रिएट स्टुडिओ',
      create: 'AI सोहळा',
      vendors: 'व्हेंडर शोधा',
      events: 'इव्हेंट्स',
      vendorOs: 'व्हेंडर ओएस',
      console: 'कन्सोल',
      panchang: 'पंचांग',
      vendorLogin: 'विक्रेता प्रवेश',
      createCard: 'पत्रिका बनवा',
    },
    footer: {
      tagline: 'महाराष्ट्राचा डिजिटल उत्सव आणि पत्रिका मंच. पहिल्या अक्षरापासून शेवटच्या आशीर्वादापर्यंत.',
      proofBadge: 'WYSIWYP प्रूफिंग · ६० FPS एडिटर · दुहेरी-नोंदणी लेजर',
      rights: 'सर्व हक्क राखीव. सूर्यसिद्धांत पंचांग गणितावर आधारित.',
      col1Title: 'सोहळा मंच',
      col2Title: 'साधने',
      col3Title: 'विश्वसनीयता',
      col4Title: 'छपाई व संपर्क',
    },
    home: {
      heroBadge: 'पुणे · १२०+ सत्यापित व्हेंडर्ससह लाँच',
      heroPanchang: 'आजचे पंचांग व शुभ मुहूर्त →',
      heroTitle1: 'उत्सव ठरवला?',
      heroTitle2: 'उरलेलं सगळं',
      heroTitle3: 'आमच्यावर.',
      heroDesc: 'पत्रिका बनवा, इव्हेंट प्लॅन करा, व्हेंडर शोधा-बुक करा, छापून घ्या आणि साजरा करा — एकाच जोडलेल्या वर्कस्पेसमधून. AI म्हणतो: “१५० माणसं, पुणे, १ लाख बजेट” — आणि संपूर्ण इव्हेंट तयार.',
      ctaCreate: 'पत्रिका बनवा — मोफत',
      ctaVendors: 'व्हेंडर शोधा',
      ctaEvents: 'इव्हेंट ओएस',
      stat1Val: '४० से.',
      stat1Lbl: 'पत्रिका तयार — सरासरी वेळ',
      stat2Val: '२५',
      stat2Lbl: 'इव्हेंट कॅटेगरीज',
      stat3Val: '₹०',
      stat3Lbl: 'सुरुवातीची किंमत',
      readiness: 'तयारी',
      readinessVal: 'इव्हेंट ८२% तयार',
      bookingConfirmed: 'बुकिंग निश्चित — अक्षता पडायला सज्ज!',
      catererRate: 'कॅटरर · ₹४५०/ताट',
      guestWelcome: '॥ सहर्ष स्वागतम् ॥ — ३४ पाहुणे येणार ✓',
      marqueeItems: [
        'शुभ विवाह', 'साखरपुडा', 'वाढदिवस', 'नामकरण', 'गृहप्रवेश', 'सत्यनारायण पूजा',
        'बोडण', 'हळद', 'पागोटे', 'स्नेहसंमेलन', 'ग्रॅज्युएशन', 'उद्योग पूजा',
      ],
      pillarsEyebrow: 'एक प्लॅटफॉर्म · सहा स्तंभ',
      pillarsTitle1: 'तयारीपासून तो',
      pillarsTitle2: 'उत्सवापर्यंत',
      pillarsTitle3: '— सगळं एकाच छताखाली',
      pillars: [
        { icon: 'brush', title: 'क्रिएट स्टुडिओ', sub: 'Create Studio', desc: 'पैठणी, वारली, देवालय, मंडल — सांस्कृतिक पत्रिका. QR असलेले डिजिटल पान आणि छपाई-तयार निर्यात.', href: '/studio' },
        { icon: 'layers', title: 'इव्हेंट ओएस', sub: 'Event OS', desc: 'पाहुणे यादी, बजेट ट्रॅकर, चेकलिस्ट, मुहूर्त आणि तयारी-स्कोर. नातेवाईकांसह संपूर्ण इव्हेंट एका पानावर.', href: '/studio/patil-patil-vivah-2027' },
        { icon: 'search', title: 'डिस्कव्हरी', sub: 'Discovery', desc: 'सत्यपडताळलेले व्हेन्यू, डेकोरेटर, फोटोग्राफर, कॅटरर — किंमत, उपलब्धता आणि खऱ्या रिव्ह्यूंसह तुलना करा.', href: '/vendors' },
        { icon: 'wallet', title: 'कॉमर्स', sub: 'Commerce', desc: 'चौकशी → कोट → बुकिंग → पेमेंट. प्रत्येक पैशाचा स्पष्ट हिशोब, लपलेलं शुल्क नाही — मन पूर्ण शांत.', href: '/admin' },
        { icon: 'building', title: 'व्हेंडर ओएस', sub: 'Vendor OS', desc: 'लीड्स, कोट्स, कॅलेंडर, पेमेंट्स आणि रिव्ह्यू — व्हेंडरसाठी संपूर्ण बिझनेस डॅशबोर्ड.', href: '/vendor' },
        { icon: 'printer', title: 'प्रिंट व प्रसार', sub: 'Print & Share', desc: 'छपाईत शून्य चूक — स्क्रीनवर दिसतं तेच कागदावर येतं. २४–४८ तासांत घरपोच.', href: '/studio' },
      ],
      studioShowcase: {
        eyebrow: 'क्रिएट स्टुडिओ',
        title1: 'पत्रिका नव्हे —',
        titleHighlight: 'हस्तकलेचा ठसा',
        desc: 'सुंदर मराठी अक्षरं आणि मनासारखे नमुने. नावं बदला — कार्ड लगेच जुळवून घेतं. छपाईत अक्षरं कधीच कापली जात नाहीत — मन पूर्ण शांत.',
        features: [
          { icon: 'sparkle', t: 'नावं बदलली तरी चिंता नाही', d: 'मोठी नावं आली तरी अक्षरं आपोआप जुळतात — काहीच कापलं जात नाही' },
          { icon: 'shield', t: 'छपाईपूर्व तपासणी', d: 'डाउनलोडपूर्वी ५ तपासण्या — तारीख, नावं आणि माहिती अगदी अचूक' },
          { icon: 'printer', t: 'छपाईत शून्य चूक', d: 'स्क्रीनवर दिसतं तेच कागदावर — तणावमुक्त तयारी' },
          { icon: 'qr', t: 'QR + इव्हेंट वेबसाइट', d: 'प्रत्येक पत्रिकेसोबत पाहुण्यांसाठी लाइव्ह डिजिटल पान' },
        ],
        cta: 'स्टुडिओ उघडा',
      },
      eventOsShowcase: {
        eyebrow: 'इव्हेंट ओएस',
        title1: 'तुमचा उत्सव,',
        titleHighlight: 'एका कमांड सेंटरमधून',
        desc: 'तयारी-स्कोर सांगतो काय उरलंय. बजेट दाखवतं कुठे जास्त खर्च होतोय. पाहुण्यांचे RSVP, जेवणाची पसंती, मुहूर्त — सगळं रिअल-टाइम.',
        features: [
          { icon: 'guests', t: 'पाहुणे व्यवस्थापन — गट, बाजू, जेवण, निवास' },
          { icon: 'wallet', t: 'बजेट — अंदाज विरुद्ध प्रत्यक्ष, श्रेणीनुसार' },
          { icon: 'checklist', t: 'चेकलिस्ट — कार्य, मुदत, प्राधान्य' },
          { icon: 'calendar', t: 'पंचांग-आधारित मुहूर्त सूचना' },
        ],
        cta: 'डेमो इव्हेंट पाहा',
        workspaceTag: 'mazi-patrika · इव्हेंट वर्कस्पेस',
        scoreLabel: 'तयारी-स्कोर',
        statusItems: [
          { t: 'व्हेन्यू — शिवनेरी लॉन्स', s: 'बुक झालं ✓', ok: true },
          { t: 'फोटोग्राफी — अथर्व मोमेंट्स', s: 'बुक झालं ✓', ok: true },
          { t: 'डेकोरेशन — कोट येऊ घातलंय', s: 'प्रतिक्षेत', ok: false },
          { t: '३४ पाहुण्यांचे RSVP बाकी', s: 'स्मरणपत्र पाठवा', ok: false },
        ],
      },
      marketplace: {
        eyebrow: 'मार्केटप्लेस',
        title1: 'पडताळलेले व्हेंडर्स.',
        titleHighlight: 'पारदर्शक व्यवहार.',
        desc: '“बेस्ट फोटोग्राफर” असे बिरुद नाही — पुरावे आहेत: पूर्ण झालेली बुकिंग्स, प्रतिसाद-दर, ताजे कॅलेंडर आणि फक्त सत्यापित बुकिंगनंतरचे रिव्ह्यू.',
        verifiedBadge: 'सत्यापित',
        suffix: 'पुणे →',
        trust: [
          { icon: 'shield', h: '७-पदरी सत्यापन', d: 'ओळख, व्यवसाय, GST, फोन, ठिकाण, पोर्टफोलिओ, रिव्ह्यू' },
          { icon: 'wallet', h: 'पैशांचा स्पष्ट हिशोब', d: 'प्रत्येक पेमेंटची नोंद तुमच्यासमोर — मन पूर्ण शांत' },
          { icon: 'bell', h: 'बॅकअप व्हेंडर', d: 'फोटोग्राफर माघारला? बजेट-जुळणारे ३ पर्याय लगेच' },
        ],
      },
      journey: {
        title1: 'चार पावलं —',
        titleHighlight: 'आयुष्यभराची आठवण',
        stepPrefix: 'पाऊल ०',
        steps: [
          { icon: 'brush', t: 'तयार करा', d: '४० सेकंदात सुंदर पत्रिका — टेम्पलेट निवडा, तपशील भरा' },
          { icon: 'checklist', t: 'आराखडा करा', d: 'पाहुणे, बजेट, मुहूर्त आणि चेकलिस्ट एका वर्कस्पेसमध्ये' },
          { icon: 'search', t: 'शोधा व बुक करा', d: 'कोट्सची तुलना करा, ठेव भरा, बुकिंग निश्चित' },
          { icon: 'diya', t: 'साजरा करा', d: 'QR स्कॅन करून पाहुणे येतात — तुम्ही फक्त आनंद घ्या' },
        ],
      },
      pricing: {
        eyebrow: 'व्हेंडर ओएस — किंमत',
        title1: 'व्हेंडरची कमाई वाढली,',
        titleHighlight: 'तरच आमची कमाई',
        popularBadge: 'सर्वाधिक लोकप्रिय',
        cta: 'सुरुवात करा',
        tiers: [
          {
            name: 'फ्री', price: '₹०', per: 'कायमचं मोफत', hot: false,
            feats: ['प्रोफाइल + पोर्टफोलिओ', 'महिना ५ चौकशा', 'बेसिक अ‍ॅनालिटिक्स'],
          },
          {
            name: 'ग्रोथ', price: '₹१,४९९', per: '/महिना + ८% कमिशन', hot: true,
            feats: ['२५ पात्र लीड क्रेडिट्स', 'कॅलेंडर, कोट्स व सीआरएम', 'व्हॉट्सअ‍ॅप टूल्स', 'पहिली २ बुकिंग्स ०% कमिशन'],
          },
          {
            name: 'प्रो', price: '₹३,९९९', per: '/महिना + ३% कमिशन', hot: false,
            feats: ['जास्त लीड वाटप', 'प्रगत सीआरएम व पॅकेजेस', 'जाहिराती व प्राधान्य', 'टीम सदस्य'],
          },
        ],
      },
      testimonials: {
        eyebrow: 'यजमान आणि व्हेंडर्स बोलतात',
        title1: 'विश्वास हाच',
        titleHighlight: 'शृंगार',
        items: [
          { q: 'बाईच्या नावानं पत्रिका १० मिनिटात बनली. काका-मामींची नावं अचूक बसली — आई थक्क झाली!', a: 'स्नेहा कुलकर्णी', r: 'विवाह यजमान · पुणे' },
          { q: 'तीन कॅटररचे कोट एकाच स्क्रीनवर तुलनले. जो योग्य वाटला तोच बुक केला — फोनवर भटकायची गरजच नाही.', a: 'प्रभुलकर देशमुख', r: 'वडील · साखरपुडा' },
          { q: 'आधी दर आठवड्याला फोन करून चौकशी यायची. आता लीड्स आपोआप येतात आणि कॅलेंडरवर दिसतात. व्यवसाय दुप्पट.', a: 'संदीप जाधव', r: 'जाधव डेकोरेटर्स · ग्रोथ प्लॅन' },
        ],
      },
      ctaBand: {
        title1: 'पुढला शुभ मुहूर्त जवळ येतोय.',
        titleHighlight: 'तयारीला लागा!',
        desc: 'मोफत पत्रिकेपासून सुरुवात करा — ४० सेकंदांत. क्रेडिट कार्डची गरज नाही.',
        btn1: 'आत्ताच पत्रिका बनवा',
        btn2: 'डेमो इव्हेंट पाहा',
      },
    },
    studio: {
      heroEyebrow: 'क्रिएट स्टुडिओ · थेट संपादन',
      heroTitle: 'पत्रिका बनवा —',
      heroTitleHighlight: 'हस्तकलेचा ठसा',
      heroDesc: 'टेम्पलेट निवडा, तपशील भरा आणि लाइव्ह प्रिव्ह्यू पाहा. नाव कितीही मोठं असलं तरी स्मार्ट लेआउट इंजिन त्याला आपोआप सुंदर बसवतं — शून्य ओव्हरफ्लो, १००% प्रिंट रेडी.',
      stat1Val: '४ प्रीमियम',
      stat1Lbl: 'हस्तकला टेम्पलेट',
      stat2Val: '१००% प्रिंट रेडी',
      stat2Lbl: 'WYSIWYP · ब्लीड सहित',
      stat3Val: '६० FPS',
      stat3Lbl: 'थेट प्रिव्ह्यू',
      btnStart: 'संपादन सुरू करा',
      btnPreview: 'थेट प्रिव्ह्यू पाहा',
      langBannerTitle: 'पत्रिका भाषा प्राधान्य',
      langBannerBadge: 'डिफॉल्ट: मराठी',
      langBannerHint: 'डिफॉल्ट मराठी; आवश्यकतेनुसार इंग्रजी निवडा',
      templateTitle: 'टेम्पलेट निवडा',
      step1: '१ · कार्यक्रम',
      step2: '२ · व्यक्ती',
      step3: '३ · तारीख व वेळ',
      step4: '४ · स्थळ व यजमान',
      lblEvent: 'कार्यक्रम प्रकार',
      lblBlessing: 'मंगलाचरण / आशीर्वाद',
      lblDate: 'दिनांक',
      lblPersonA: 'वर / यजमान व्यक्ती',
      lblPersonB: 'वधू / दुसरी व्यक्ती',
      lblTime: 'वेळ',
      lblVenue: 'स्थळ',
      lblCity: 'शहर',
      lblHost: 'यजमान कुटुंब / निमंत्रक',
      btnSave: 'पत्रिका साठवा',
      btnSaving: 'साठवत आहे…',
      btnSaved: 'साठवले! ✓',
      btnPrint: 'छपाई ऑर्डर द्या',
      check1: 'पहिलं नाव भरलं',
      check2Couple: 'दुसरं नाव भरलं',
      check2Single: 'एकच नाव — बरोबर',
      check3: 'दिनांक निवडला',
      check4: 'स्थळ स्पष्ट आहे',
      check5: 'नावं स्मार्ट-लेआउट मर्यादेत',
      previewHeading: 'थेट पत्रिका प्रिव्ह्यू',
    },
    create: {
      kicker: 'Create Studio',
      title: 'एका वाक्यात कार्यक्रम उभा करा',
      desc: 'तुम्ही लिहा — प्लॅटफॉर्म पंचांग गणनेने मुहूर्त शोधते, पारंपरिक बजेट रचनेनुसार वाटप करते, कार्ये तयार करते आणि पडताळलेल्या विक्रेत्यांची यादी देते.',
      whatGenerates: 'काय आपोआप तयार होते',
      whatWeDontDo: 'आम्ही काय करत नाही',
      sampleWorkspaces: 'आधीच तयार कार्यक्रम',
      genItems: [
        'मुहूर्त अनुकूलता — सूर्योदय-आधारित तिथी, नक्षत्र व चौघडियांसह',
        'बजेटचे श्रेणीवार वाटप — महाराष्ट्रीयन खर्च रचनेनुसार',
        '२४+ टप्प्यांतील कार्यसूची — तारखांसह',
        'विक्रेते — उपलब्धता व प्रतिसाद वेळेसह',
      ],
      dontItems: [
        'विवाह-जुळवणी किंवा वधू-वर शोध',
        '“शुभ/अशुभ दिवस” असे ठोकळ निर्णय — फक्त अनुकूलता',
        'लगेच बुकिंग — विक्रेत्याची संमती आवश्यक',
        'वैद्यकीय, कायदेशीर किंवा आर्थिक सल्ला',
      ],
      privacyNote: 'आपली माहिती सुरक्षित आहे — आधार, PAN किंवा कार्ड क्रमांक कधीही मागितले जात नाहीत.',
      sampleSubtitle: 'नमुना वर्कस्पेस उघडून पाहा — थेट प्रीव्ह्यू व बजेटसह.',
    },
    panchang: {
      kicker: 'Surya Siddhanta',
      title: 'पंचांग व मुहूर्त — महाराष्ट्र',
      desc: 'तिथी, नक्षत्र, चौघडिया, राहुकाळ व मुहूर्त अनुकूलता — शहरानुसार अचूक खगोलशास्त्रीय गणना.',
      cityLabel: 'शहर',
      dateLabel: 'दिनांक',
      eventLabel: 'कार्यक्रम',
      btnView: 'पंचांग पहा',
    },
    vendors: {
      kicker: 'Verified Marketplace',
      title: 'पडताळलेले विक्रेते',
      desc: 'पुणे, मुंबई, नाशिकसह महाराष्ट्रातील पडताळलेले कार्यक्रम-विक्रेते — उपलब्धता, दर आणि प्रतिसाद वेळेसह.',
      cityLabel: 'शहर',
      categoryLabel: 'कॅटेगरी',
    },
    events: {
      kicker: 'Public Celebrations',
      title: 'सार्वजनिक पत्रिका',
      desc: 'काही कुटुंबे आपली पत्रिका सार्वजनिक करतात — मग नातेवाईक, मित्र व नवीन पाहुणे ती शोधू शकतात.',
      cityLabel: 'शहर',
      typeLabel: 'प्रकार',
    },
  },
  en: {
    header: {
      mantra: '॥ Shri Ganeshaya Namah ॥',
      tagline: 'Maharashtra Edition • Surya Siddhanta Panchang • Precision Print & Ledger',
      livePanchang: 'Live Panchang Active',
      studio: 'Create Studio',
      create: 'AI Event',
      vendors: 'Find Vendors',
      events: 'Events',
      vendorOs: 'Vendor OS',
      console: 'Console',
      panchang: 'Panchang',
      vendorLogin: 'Vendor Portal',
      createCard: 'Create Card',
    },
    footer: {
      tagline: 'Maharashtra’s premier digital celebration & invitation platform. From the first word to the final blessing.',
      proofBadge: 'WYSIWYP Proofing · 60 FPS Editor · Double-Entry Ledger',
      rights: 'All rights reserved. Powered by Surya Siddhanta astronomical calculations.',
      col1Title: 'Platform',
      col2Title: 'Features',
      col3Title: 'Trust & Security',
      col4Title: 'Print Hubs & Contact',
    },
    home: {
      heroBadge: 'Pune · Launched with 120+ Verified Vendors',
      heroPanchang: "Today's Panchang & Auspicious Muhurats →",
      heroTitle1: 'Celebration Planned?',
      heroTitle2: 'Leave the Rest',
      heroTitle3: 'To Us.',
      heroDesc: 'Design invitations, plan events, find & book vendors, print and celebrate — all in one connected workspace. Tell AI: "150 guests, Pune, 1 Lakh budget" — and your celebration is ready.',
      ctaCreate: 'Create Invitation — Free',
      ctaVendors: 'Find Vendors',
      ctaEvents: 'Event OS',
      stat1Val: '40s',
      stat1Lbl: 'Avg. Card Creation Time',
      stat2Val: '25',
      stat2Lbl: 'Event Categories',
      stat3Val: '₹0',
      stat3Lbl: 'Starting Cost',
      readiness: 'Readiness',
      readinessVal: 'Event 82% Ready',
      bookingConfirmed: 'Booking Confirmed — Ready for Celebrations!',
      catererRate: 'Caterer · ₹450/plate',
      guestWelcome: '॥ Hearty Welcome ॥ — 34 Guests Attending ✓',
      marqueeItems: [
        'Auspicious Wedding', 'Engagement Ceremony', 'Birthday Celebration', 'Naming Ceremony',
        'Housewarming (Vastu)', 'Satyanarayan Puja', 'Bodan Ritual', 'Haldi Ceremony',
        'Pagote Ceremony', 'Family Reunion', 'Graduation Party', 'Corporate Puja',
      ],
      pillarsEyebrow: 'One Platform · Six Pillars',
      pillarsTitle1: 'From Planning to',
      pillarsTitle2: 'Celebration',
      pillarsTitle3: '— All Under One Roof',
      pillars: [
        { icon: 'brush', title: 'Create Studio', sub: 'Create Studio', desc: 'Paithani, Warli, Temple & Mandala — authentic heritage templates. QR-enabled digital page and print-ready export.', href: '/studio' },
        { icon: 'layers', title: 'Event OS', sub: 'Event OS', desc: 'Guest lists, budget tracker, checklists, muhurats and readiness score. Manage the whole celebration on one single page.', href: '/studio/patil-patil-vivah-2027' },
        { icon: 'search', title: 'Discovery', sub: 'Discovery', desc: 'Verified venues, decorators, photographers, caterers — compare pricing, live availability and genuine customer reviews.', href: '/vendors' },
        { icon: 'wallet', title: 'Commerce', sub: 'Commerce', desc: 'Inquiry → Quote → Booking → Payment. Complete financial transparency with double-entry ledger — zero hidden charges.', href: '/admin' },
        { icon: 'building', title: 'Vendor OS', sub: 'Vendor OS', desc: 'Leads, instant quotes, booking calendar, payments and reviews — complete business dashboard for local vendors.', href: '/vendor' },
        { icon: 'printer', title: 'Print & Share', sub: 'Print & Share', desc: 'Zero print error guarantee — what you see on screen is what prints on paper. Doorstep delivery in 24–48 hours.', href: '/studio' },
      ],
      studioShowcase: {
        eyebrow: 'Create Studio',
        title1: 'Not Just an Invitation —',
        titleHighlight: 'Handcrafted Heritage',
        desc: 'Authentic Devanagari typography and modern aesthetics. Change names — layout auto-fits dynamically. Zero overflow, 100% print ready.',
        features: [
          { icon: 'sparkle', t: 'Smart Layout Engine', d: 'Long family names fit automatically with zero text truncation or distortion' },
          { icon: 'shield', t: 'Pre-Print Quality Guard', d: '5 automated quality checks before export — dates, names, bleed & typography' },
          { icon: 'printer', t: 'Zero Print Error Guarantee', d: 'WYSIWYP assurance — what you see on screen is what prints on paper' },
          { icon: 'qr', t: 'QR + Live Event Page', d: 'Interactive digital RSVP page and Google Maps navigation with every card' },
        ],
        cta: 'Open Studio',
      },
      eventOsShowcase: {
        eyebrow: 'Event OS',
        title1: 'Your Celebration,',
        titleHighlight: 'From One Command Center',
        desc: 'Readiness score highlights pending items. Budget tracker monitors allocations vs actuals. Real-time guest RSVPs, meal preferences, and muhurat reminders.',
        features: [
          { icon: 'guests', t: 'Guest Management — Groups, sides, meals & accommodations' },
          { icon: 'wallet', t: 'Budget Tracker — Projected vs actuals by category' },
          { icon: 'checklist', t: 'Interactive Checklist — Tasks, deadlines & priorities' },
          { icon: 'calendar', t: 'Surya Siddhanta panchang muhurat notifications' },
        ],
        cta: 'View Demo Event',
        workspaceTag: 'mazi-patrika · Event Workspace',
        scoreLabel: 'Readiness Score',
        statusItems: [
          { t: 'Venue — Shivneri Lawns', s: 'Booked ✓', ok: true },
          { t: 'Photography — Atharva Moments', s: 'Booked ✓', ok: true },
          { t: 'Decoration — Quote Pending', s: 'Awaiting', ok: false },
          { t: '34 Guest RSVPs Pending', s: 'Send Reminder', ok: false },
        ],
      },
      marketplace: {
        eyebrow: 'Marketplace',
        title1: 'Verified Vendors.',
        titleHighlight: 'Transparent Dealings.',
        desc: 'No arbitrary "best" rankings — real verifiable track records: completed bookings, response speeds, live calendar availability, and verified client reviews.',
        verifiedBadge: 'Verified',
        suffix: 'Pune →',
        trust: [
          { icon: 'shield', h: '7-Layer Verification', d: 'Identity, business registration, GST, phone, address, portfolio & reviews' },
          { icon: 'wallet', h: 'Full Financial Transparency', d: 'Every payment milestone tracked in your private ledger — zero hidden costs' },
          { icon: 'bell', h: 'Instant Backup Guarantee', d: 'Vendor unavailable? 3 budget-matched replacement options ready instantly' },
        ],
      },
      journey: {
        title1: 'Four Steps —',
        titleHighlight: 'Memories for a Lifetime',
        stepPrefix: 'Step 0',
        steps: [
          { icon: 'brush', t: 'Design', d: 'Stunning invitation in 40s — pick a template, fill details, preview live' },
          { icon: 'checklist', t: 'Plan', d: 'Guests, budgets, muhurats and checklists in a unified workspace' },
          { icon: 'search', t: 'Book Vendors', d: 'Compare transparent quotes, deposit securely, confirm bookings' },
          { icon: 'diya', t: 'Celebrate', d: 'Guests arrive via QR RSVP — enjoy your special day stress-free' },
        ],
      },
      pricing: {
        eyebrow: 'Vendor OS — Pricing',
        title1: 'When Our Vendors Grow,',
        titleHighlight: 'We Grow Together',
        popularBadge: 'Most Popular',
        cta: 'Get Started',
        tiers: [
          {
            name: 'Free', price: '₹0', per: 'Free Forever', hot: false,
            feats: ['Profile + Portfolio showcase', '5 monthly customer inquiries', 'Basic performance analytics'],
          },
          {
            name: 'Growth', price: '₹1,499', per: '/month + 8% commission', hot: true,
            feats: ['25 qualified lead credits', 'Booking calendar, quotes & CRM', 'Automated WhatsApp tools', 'First 2 bookings 0% commission'],
          },
          {
            name: 'Pro', price: '₹3,999', per: '/month + 3% commission', hot: false,
            feats: ['Highest priority lead matching', 'Advanced team CRM & packages', 'Featured search placement', 'Multiple team members'],
          },
        ],
      },
      testimonials: {
        eyebrow: 'Hosts & Vendors Speak',
        title1: 'Trust is Our True',
        titleHighlight: 'Ornament',
        items: [
          { q: 'Created our wedding invitation in 10 minutes. Even the longest elder names fit with zero overflow — my mother was delighted!', a: 'Sneha Kulkarni', r: 'Wedding Host · Pune' },
          { q: 'Compared 3 catering quotes side-by-side on one screen and booked immediately without endless phone calls.', a: 'Prabhulkar Deshmukh', r: 'Father · Engagement Host' },
          { q: 'Earlier I had to chase leads every week. Now verified inquiries flow directly to my calendar. My business doubled in 3 months.', a: 'Sandeep Jadhav', r: 'Jadhav Decorators · Growth Plan' },
        ],
      },
      ctaBand: {
        title1: 'The next auspicious muhurat is approaching.',
        titleHighlight: 'Start preparing today!',
        desc: 'Create your free digital invitation in 40 seconds. No credit card required.',
        btn1: 'Create Invitation Now',
        btn2: 'View Demo Event',
      },
    },
    studio: {
      heroEyebrow: 'Create Studio · Realtime Editing',
      heroTitle: 'Design Invitations —',
      heroTitleHighlight: 'Handcrafted Heritage',
      heroDesc: 'Pick a template, fill the details, and watch the live preview. Smart layout engine automatically fits long names — zero overflow, 100% print ready.',
      stat1Val: '4 Premium',
      stat1Lbl: 'Artisan Templates',
      stat2Val: '100% Print Ready',
      stat2Lbl: 'WYSIWYP · Full Bleed',
      stat3Val: '60 FPS',
      stat3Lbl: 'Live Preview',
      btnStart: 'Start Designing',
      btnPreview: 'View Live Preview',
      langBannerTitle: 'Card Language Preference',
      langBannerBadge: 'Selected: English',
      langBannerHint: 'Default is Marathi; switch to English anytime',
      templateTitle: 'Select Template',
      step1: '1 · Event Details',
      step2: '2 · Personal Details',
      step3: '3 · Date & Timing',
      step4: '4 · Venue & Host',
      lblEvent: 'Event Type',
      lblBlessing: 'Blessing / Invocation',
      lblDate: 'Date',
      lblPersonA: 'Groom / Host Name',
      lblPersonB: 'Bride / Second Person',
      lblTime: 'Time',
      lblVenue: 'Venue',
      lblCity: 'City',
      lblHost: 'Invited By / Family',
      btnSave: 'Save Invitation',
      btnSaving: 'Saving…',
      btnSaved: 'Saved! ✓',
      btnPrint: 'Place Print Order',
      check1: 'First Name Filled',
      check2Couple: 'Second Name Filled',
      check2Single: 'Single Name — Verified',
      check3: 'Date Selected',
      check4: 'Venue Details Complete',
      check5: 'Names within Smart Layout Limit',
      previewHeading: 'Live Invitation Preview',
    },
    create: {
      kicker: 'Create Studio',
      title: 'Plan your celebration in one sentence',
      desc: 'Describe your event — the platform calculates auspicious muhurats, allocates traditional budgets, assigns tasks, and recommends verified local vendors.',
      whatGenerates: 'What gets generated automatically',
      whatWeDontDo: 'What we never do',
      sampleWorkspaces: 'Sample Pre-built Events',
      genItems: [
        'Muhurat compatibility — Sunrise-based tithi, nakshatra & choghadiya',
        'Category-wise budget allocation based on Maharashtrian celebration structures',
        '24+ milestone checklist with dates and deadlines',
        'Verified vendors with live availability and response times',
      ],
      dontItems: [
        'Matchmaking or bride/groom search',
        'Crude "good/bad day" judgments — only compatibility scores',
        'Immediate unconfirmed bookings — vendor approval required',
        'Medical, legal or financial advice',
      ],
      privacyNote: 'Your information is safe — Aadhaar, PAN or bank card numbers are never requested.',
      sampleSubtitle: 'Explore sample workspaces with live previews and real-time budgets.',
    },
    panchang: {
      kicker: 'Surya Siddhanta',
      title: 'Panchang & Auspicious Muhurats — Maharashtra',
      desc: 'Tithi, Nakshatra, Choghadiya, Rahu Kaal & Muhurat Compatibility — accurate astronomical calculations per city.',
      cityLabel: 'City',
      dateLabel: 'Date',
      eventLabel: 'Event Type',
      btnView: 'View Panchang',
    },
    vendors: {
      kicker: 'Verified Marketplace',
      title: 'Verified Celebration Vendors',
      desc: 'Top verified wedding & event vendors across Maharashtra — availability, pricing and response times.',
      cityLabel: 'City',
      categoryLabel: 'Category',
    },
    events: {
      kicker: 'Public Celebrations',
      title: 'Public Invitations',
      desc: 'Browse celebration invitations shared publicly by families across Maharashtra.',
      cityLabel: 'City',
      typeLabel: 'Event Type',
    },
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
