type SupportedLanguageCode = 'en-IN' | 'hi-IN' | 'ta-IN' | 'te-IN' | 'bn-IN' | 'kn-IN' | 'ml-IN';

type Intent = 'fertilizer' | 'pest' | 'weather' | 'market' | 'soil' | 'irrigation' | 'scheme' | 'general';

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  fertilizer: ['fertilizer', 'urea', 'dap', 'npk', 'manure', 'compost', 'खाद', 'उर्वरक', 'உரம்', 'ఎరువు', 'সার', 'ಗೊಬ್ಬರ', 'വളം'],
  pest: [
    'pest',
    'insect',
    'disease',
    'aphid',
    'borer',
    'stem borer',
    'bollworm',
    'armyworm',
    'whitefly',
    'thrips',
    'jassid',
    'dead heart',
    'white ear',
    'spray',
    'fungicide',
    'insecticide',
    'larva',
    'कीट',
    'रोग',
    'तना छेदक',
    'बोरर',
    'பூச்சி',
    'நோய்',
    'தண்டு துளைப்பான்',
    'పురుగు',
    'వ్యాధి',
    'కాండం తొలిచే పురుగు',
    'পোকা',
    'রোগ',
    'কীট',
    'ರೋಗ',
    'ಕೀಟ',
    'കീടം',
    'രോഗം',
  ],
  weather: ['weather', 'rain', 'forecast', 'humidity', 'temperature', 'heatwave', 'storm', 'frost', 'मौसम', 'बारिश', 'வானிலை', 'మౌస', 'వాతావరణం', 'আবহাওয়া', 'ಹವಾಮಾನ', 'കാലാവസ്ഥ'],
  market: [
    'market',
    'price',
    'mandi',
    'msp',
    'sell',
    'rate',
    'margin',
    'profit',
    'profitability',
    'roi',
    'returns',
    'income',
    'बाजार',
    'मंडी',
    'लाभ',
    'मुनाफा',
    'मार्जिन',
    'சந்தை',
    'மார்ஜின்',
    'லாபம்',
    'ధర',
    'మార్జిన్',
    'లాభం',
    'বাজার',
    'লাভ',
    'মুনাফা',
    'মার্জিন',
    'ಮಾರುಕಟ್ಟೆ',
    'ಲಾಭ',
    'ಮಾರ್ಜಿನ್',
    'വിപണി',
    'ലാഭം',
    'മാർജിൻ',
  ],
  soil: ['soil', 'ph', 'organic', 'zinc', 'sulphur', 'मिट्टी', 'மண்', 'నేల', 'মাটি', 'ಮಣ್ಣು', 'മണ്ണ്'],
  irrigation: ['irrigation', 'irrigate', 'water', 'drip', 'sprinkler', 'moisture', 'सिंचाई', 'पानी', 'பாசனம்', 'నీటి', 'সেচ', 'ನೀರಾವರಿ', 'ജലസേചനം'],
  scheme: ['scheme', 'subsidy', 'kisan', 'pmfby', 'loan', 'yojana', 'योजना', 'सब्सिडी', 'திட்டம்', 'పథకం', 'স্কিম', 'ಯೋಜನೆ', 'പദ്ധതി'],
  general: [],
};

const CROP_TOKENS: Array<{ crop: string; tokens: string[] }> = [
  { crop: 'Rice', tokens: ['rice', 'paddy', 'धान', 'நெல்', 'వరి', 'ধান'] },
  { crop: 'Wheat', tokens: ['wheat', 'गेहूं', 'கோதுமை', 'గోధుమ', 'গম'] },
  { crop: 'Cotton', tokens: ['cotton', 'कपास', 'பருத்தி', 'పత్తి', 'তুলা'] },
  { crop: 'Maize', tokens: ['maize', 'corn', 'मक्का', 'மக்காச்சோளம்', 'మొక్కజొన్న'] },
  { crop: 'Soybean', tokens: ['soybean', 'सोयाबीन', 'சோயா', 'సోయాబీన్'] },
  { crop: 'Sugarcane', tokens: ['sugarcane', 'गन्ना', 'கரும்பு', 'చెరకు'] },
];

const LANGUAGE_NORMALIZE: Record<string, SupportedLanguageCode> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
};

const ADVICE: Record<Intent, Partial<Record<SupportedLanguageCode, string>>> = {
  fertilizer: {
    'en-IN': 'For crop nutrition, split nitrogen into 2-3 doses, keep basal DAP at sowing/transplanting, and use ZnSO4 where leaf yellow striping appears.',
    'hi-IN': 'पोषण प्रबंधन में नाइट्रोजन 2-3 किस्तों में दें, बेसल DAP बुवाई/रोपाई में दें, और पत्तियों में पीली धारियां हों तो ZnSO4 का प्रयोग करें।',
    'ta-IN': 'உர மேலாண்மையில் நைட்ரஜனை 2-3 கட்டங்களாக வழங்கவும், DAP அடிப்படை உரமாக இடவும், இலை மஞ்சள் கோடு இருந்தால் ZnSO4 பயன்படுத்தவும்.',
    'te-IN': 'ఎరువు నిర్వహణలో నైట్రోజన్‌ను 2-3 విడతలుగా ఇవ్వండి, DAP ను బేసల్‌గా వేయండి, ఆకుల్లో పసుపు గీతలు ఉంటే ZnSO4 వాడండి.',
    'bn-IN': 'সার ব্যবস্থাপনায় নাইট্রোজেন ২-৩ কিস্তিতে দিন, রোপণের সময় বেসাল DAP দিন, পাতায় হলদে দাগ হলে ZnSO4 প্রয়োগ করুন।',
    'kn-IN': 'ಗೊಬ್ಬರ ನಿರ್ವಹಣೆಯಲ್ಲಿ ನೈಟ್ರೋಜನ್ ಅನ್ನು 2-3 ಹಂತಗಳಲ್ಲಿ ನೀಡಿ, ಬಿತ್ತನೆ/ನೆಡುವಾಗ DAP ಬೇಸಲ್ ಆಗಿ ನೀಡಿ, ಎಲೆಗಳಲ್ಲಿ ಹಳದಿ ಗೀರು ಕಂಡರೆ ZnSO4 ಬಳಸಿ.',
    'ml-IN': 'വളം മാനേജ്മെന്റിൽ നൈട്രജൻ 2-3 ഘട്ടങ്ങളായി നൽകുക, വിത്തെടുപ്പിൽ/നട്ട് വെക്കുമ്പോൾ DAP അടിസ്ഥാനംയായി നൽകുക, ഇലയിൽ മഞ്ഞ വരകൾ കണ്ടാൽ ZnSO4 ഉപയോഗിക്കുക.',
  },
  pest: {
    'en-IN': 'Use integrated pest management: field scouting every 5-7 days, sticky/pheromone traps, and spray only above ETL with chemical rotation.',
    'hi-IN': 'एकीकृत कीट प्रबंधन अपनाएं: 5-7 दिन पर निरीक्षण, स्टिकी/फेरोमोन ट्रैप, और ETL के ऊपर ही दवा छिड़काव करें।',
    'ta-IN': 'ஒருங்கிணைந்த பூச்சி மேலாண்மை செய்யவும்: 5-7 நாட்களுக்கு ஒருமுறை கண்காணிப்பு, ஸ்டிக்கி/பெரோமோன் வலைகள், ETL மீறினால் மட்டும் தெளிப்பு.',
    'te-IN': 'సమగ్ర పురుగు నిర్వహణ పాటించండి: 5-7 రోజులకు ఒకసారి పర్యవేక్షణ, స్టిక్కీ/ఫెరోమోన్ ట్రాప్స్, ETL దాటితేనే స్ప్రే చేయండి.',
    'bn-IN': 'সমন্বিত পোকা দমন করুন: ৫-৭ দিনে মাঠ পর্যবেক্ষণ, স্টিকি/ফেরোমন ট্র্যাপ, ETL ছাড়ালে তবেই স্প্রে করুন।',
    'kn-IN': 'ಸಮಗ್ರ ಕೀಟ ನಿರ್ವಹಣೆ ಅನುಸರಿಸಿ: 5-7 ದಿನಕ್ಕೊಮ್ಮೆ ಪರಿಶೀಲನೆ, ಸ್ಟಿಕ್ಕಿ/ಫೆರೋಮೋನ್ ಟ್ರ್ಯಾಪ್, ETL ಮೀರಿದಾಗ ಮಾತ್ರ ಸ್ಪ್ರೇ ಮಾಡಿ.',
    'ml-IN': 'ഇന്റഗ്രേറ്റഡ് കീടനിയന്ത്രണം പിന്തുടരുക: 5-7 ദിവസത്തിൽ ഒരിക്കൽ ഫീൽഡ് സ്കൗട്ടിംഗ്, സ്റ്റിക്കി/ഫെറോമോൺ ട്രാപ്സ്, ETL കഴിഞ്ഞാൽ മാത്രം സ്പ്രേ ചെയ്യുക.',
  },
  weather: {
    'en-IN': 'Spray only when wind is low and no rain is expected for 6 hours; in heat, irrigate early morning/evening and avoid midday spray.',
    'hi-IN': 'जब हवा कम हो और 6 घंटे बारिश न हो तभी स्प्रे करें; गर्मी में सुबह/शाम सिंचाई करें और दोपहर का स्प्रे टालें।',
    'ta-IN': 'காற்று குறைவாகவும் 6 மணி நேரம் மழை இல்லாதபோதும் மட்டும் தெளிக்கவும்; வெப்பத்தில் காலை/மாலை பாசனம் செய்யவும்.',
    'te-IN': 'గాలి తక్కువగా ఉండి 6 గంటల వర్షం లేనప్పుడు మాత్రమే స్ప్రే చేయండి; ఎండలో ఉదయం/సాయంత్రం నీరు పెట్టండి.',
    'bn-IN': 'হাওয়া কম থাকলে এবং ৬ ঘণ্টা বৃষ্টির সম্ভাবনা না থাকলে স্প্রে করুন; গরমে সকাল/সন্ধ্যায় সেচ দিন।',
    'kn-IN': 'ಗಾಳಿ ಕಡಿಮೆ ಇದ್ದು 6 ಗಂಟೆ ಮಳೆ ಸಾಧ್ಯತೆ ಇಲ್ಲದಾಗ ಮಾತ್ರ ಸ್ಪ್ರೇ ಮಾಡಿ; ಬೇಗೆಯಲ್ಲಿ ಬೆಳಗ್ಗೆ/ಸಂಜೆ ನೀರಾವರಿ ಮಾಡಿ.',
    'ml-IN': 'കാറ്റ് കുറവും 6 മണിക്കൂർ മഴ സാധ്യത ഇല്ലാത്തപ്പോഴും മാത്രം സ്പ്രേ ചെയ്യുക; ചൂടിൽ രാവിലെ/വൈകുന്നേരം ജലസേചനം ചെയ്യുക.',
  },
  market: {
    'en-IN': 'Compare mandi price with MSP, track 7-day trend, and sell in staggered lots when prices are rising to reduce risk.',
    'hi-IN': 'मंडी भाव की MSP से तुलना करें, 7-दिन का ट्रेंड देखें, और भाव बढ़ने पर किस्तों में बिक्री करें।',
    'ta-IN': 'மண்டி விலை மற்றும் MSP ஒப்பிட்டு 7 நாள் போக்கை பாருங்கள்; விலை உயர்ந்தால் கட்டங்களாக விற்பனை செய்யவும்.',
    'te-IN': 'మండీ ధరను MSPతో పోల్చి 7 రోజుల ట్రెండ్ చూడండి; ధరలు పెరుగుతున్నప్పుడు విడతలుగా అమ్మండి.',
    'bn-IN': 'মন্ডি দাম MSP-এর সাথে মিলিয়ে ৭ দিনের ট্রেন্ড দেখুন; দাম বাড়লে ধাপে ধাপে বিক্রি করুন।',
    'kn-IN': 'ಮಂಡಿ ದರವನ್ನು MSP ಜೊತೆ ಹೋಲಿಸಿ 7 ದಿನದ ಟ್ರೆಂಡ್ ನೋಡಿ; ದರ ಏರಿಕೆಯಲ್ಲಿ ಹಂತ ಹಂತವಾಗಿ ಮಾರಾಟ ಮಾಡಿ.',
    'ml-IN': 'മണ്ടി വില MSPയുമായി താരതമ്യം ചെയ്ത് 7 ദിവസത്തെ ട്രെൻഡ് നോക്കുക; വില ഉയരുമ്പോൾ ഘട്ടം ഘട്ടമായി വിൽക്കുക.',
  },
  soil: {
    'en-IN': 'Do soil testing for pH and micronutrients; add FYM/vermicompost and apply crop-specific zinc/sulphur correction where needed.',
    'hi-IN': 'मिट्टी की pH और सूक्ष्म पोषक जांच कराएं; FYM/वर्मी कम्पोस्ट डालें और जरूरत अनुसार जिंक/सल्फर सुधार करें।',
    'ta-IN': 'மண் pH மற்றும் நுண்ணூட்ட சோதனை செய்யவும்; FYM/வெர்மிகம்போஸ்ட் சேர்த்து தேவைக்கேற்ற ஜிங்க்/சல்பர் திருத்தம் செய்யவும்.',
    'te-IN': 'నేల pH మరియు సూక్ష్మపోషక పరీక్ష చేయండి; FYM/వెర్మికంపోస్ట్ వేయండి, అవసరమైతే జింక్/సల్ఫర్ సరిదిద్దండి.',
    'bn-IN': 'মাটির pH ও মাইক্রোনিউট্রিয়েন্ট পরীক্ষা করুন; FYM/ভার্মিকম্পোস্ট দিন এবং প্রয়োজনে জিংক/সালফার সংশোধন করুন।',
    'kn-IN': 'ಮಣ್ಣಿನ pH ಮತ್ತು ಸೂಕ್ಷ್ಮ ಪೋಷಕ ಪರೀಕ್ಷೆ ಮಾಡಿ; FYM/ವರ್ಮಿಕಂಪೋಸ್ಟ್ ಸೇರಿಸಿ, ಅಗತ್ಯವಿದ್ದರೆ ಜಿಂಕ್/ಸಲ್ಫರ್ ತಿದ್ದುಪಡಿ ಮಾಡಿ.',
    'ml-IN': 'മണ്ണിന്റെ pH, സൂക്ഷ്മപോഷക പരിശോധന നടത്തുക; FYM/വെർമികമ്പോസ്റ്റ് ചേർത്ത് ആവശ്യമായ ജിങ്ക്/സൾഫർ തിരുത്തൽ ചെയ്യുക.',
  },
  irrigation: {
    'en-IN': 'Irrigate based on soil type and crop stage; prefer morning irrigation, avoid waterlogging, and use mulching to reduce losses.',
    'hi-IN': 'मिट्टी और फसल अवस्था के अनुसार सिंचाई करें; सुबह सिंचाई बेहतर है, जलभराव से बचें और मल्चिंग अपनाएं।',
    'ta-IN': 'மண் வகை மற்றும் பயிர் கட்டத்தைப் பொறுத்து பாசனம் செய்யவும்; காலை பாசனம் சிறந்தது, நீர் தேக்கம் தவிர்க்கவும்.',
    'te-IN': 'నేల రకం, పంట దశ ఆధారంగా నీరు పెట్టండి; ఉదయం నీరు పెట్టడం మంచిది, నీరు నిల్వ కాకుండా చూడండి.',
    'bn-IN': 'মাটি ও ফসলের স্তর অনুযায়ী সেচ দিন; সকালে সেচ ভালো, জলাবদ্ধতা এড়িয়ে চলুন।',
    'kn-IN': 'ಮಣ್ಣು ಮತ್ತು ಬೆಳೆ ಹಂತಕ್ಕೆ ಅನುಗುಣವಾಗಿ ನೀರಾವರಿ ಮಾಡಿ; ಬೆಳಗಿನ ನೀರಾವರಿ ಉತ್ತಮ, ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿ.',
    'ml-IN': 'മണ്ണിന്റെ സ്വഭാവവും വിളവിന്റെ ഘട്ടവും അനുസരിച്ച് ജലസേചനം ചെയ്യുക; രാവിലെ ജലസേചനം മികച്ചത്, വെള്ളക്കെട്ട് ഒഴിവാക്കുക.',
  },
  scheme: {
    'en-IN': 'Check PM-KISAN, PMFBY, KCC, and micro-irrigation subsidy eligibility using your state agriculture portal and nearest CSC/KVK.',
    'hi-IN': 'PM-KISAN, PMFBY, KCC और माइक्रो-इरिगेशन सब्सिडी की पात्रता राज्य पोर्टल और नजदीकी CSC/KVK से जांचें।',
    'ta-IN': 'PM-KISAN, PMFBY, KCC மற்றும் மைக்ரோ பாசன மானியம் தகுதியை மாநில வேளாண் தளம் மற்றும் அருகிலுள்ள CSC/KVK மூலம் சரிபார்க்கவும்.',
    'te-IN': 'PM-KISAN, PMFBY, KCC మరియు మైక్రో ఇరిగేషన్ సబ్సిడీ అర్హతను రాష్ట్ర పోర్టల్ మరియు సమీప CSC/KVK ద్వారా చెక్ చేయండి.',
    'bn-IN': 'PM-KISAN, PMFBY, KCC ও মাইক্রো-সেচ ভর্তুকির যোগ্যতা রাজ্য পোর্টাল ও নিকটবর্তী CSC/KVK থেকে যাচাই করুন।',
    'kn-IN': 'PM-KISAN, PMFBY, KCC ಮತ್ತು ಮೈಕ್ರೋ-ಇರಿಗೇಶನ್ ಸಬ್ಸಿಡಿ ಅರ್ಹತೆಯನ್ನು ರಾಜ್ಯ ಪೋರ್ಟಲ್ ಮತ್ತು ಸಮೀಪದ CSC/KVK ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.',
    'ml-IN': 'PM-KISAN, PMFBY, KCC, മൈക്രോ-ഇറിഗേഷൻ സബ്സിഡി യോഗ്യത സംസ്ഥാന പോർട്ടലിലും സമീപ CSC/KVK-ലും പരിശോധിക്കുക.',
  },
  general: {
    'en-IN': 'Share crop, stage, location, and issue details for a precise advisory. I can answer any farming question in voice-supported format.',
    'hi-IN': 'सटीक सलाह के लिए फसल, अवस्था, स्थान और समस्या बताएं। मैं किसी भी कृषि प्रश्न का उत्तर दे सकता हूं।',
    'ta-IN': 'துல்லிய ஆலோசனைக்கு பயிர், கட்டம், இடம், பிரச்சனை விவரம் சொல்லுங்கள். எந்த விவசாய கேள்விக்கும் பதில் தருவேன்.',
    'te-IN': 'ఖచ్చితమైన సలహా కోసం పంట, దశ, ప్రాంతం, సమస్య వివరాలు చెప్పండి. ఏ వ్యవసాయ ప్రశ్నకైనా సమాధానం ఇస్తాను.',
    'bn-IN': 'নির্ভুল পরামর্শের জন্য ফসল, স্তর, স্থান ও সমস্যার তথ্য দিন। আমি যেকোনো কৃষি প্রশ্নের উত্তর দিতে পারি।',
    'kn-IN': 'ನಿಖರ ಸಲಹೆಗೆ ಬೆಳೆ, ಹಂತ, ಸ್ಥಳ ಮತ್ತು ಸಮಸ್ಯೆ ತಿಳಿಸಿ. ಯಾವುದೇ ಕೃಷಿ ಪ್ರಶ್ನೆಗೆ ನಾನು ಉತ್ತರಿಸಬಹುದು.',
    'ml-IN': 'കൃത്യമായ നിർദ്ദേശത്തിനായി വിള, ഘട്ടം, സ്ഥലം, പ്രശ്നം വിവരിക്കുക. ഏത് കാർഷിക ചോദ്യത്തിനും ഞാൻ മറുപടി നൽകാം.',
  },
};

const HEADING: Partial<Record<SupportedLanguageCode, { answer: string; actions: string; note: string }>> = {
  'en-IN': { answer: 'Advisory', actions: 'Immediate Actions', note: 'Share your location and crop details for a more precise answer.' },
  'hi-IN': { answer: 'सलाह', actions: 'तुरंत करने योग्य कार्य', note: 'और सटीक सलाह के लिए अपना स्थान और फसल का विवरण बताएं।' },
  'ta-IN': { answer: 'ஆலோசனை', actions: 'உடனடி நடவடிக்கைகள்', note: 'மேலும் துல்லியமாக கூற உங்கள் இடம் மற்றும் பயிர் விவரங்களை பகிரவும்.' },
  'te-IN': { answer: 'సలహా', actions: 'తక్షణ చర్యలు', note: 'ఇంకా ఖచ్చితంగా చెప్పడానికి మీ ప్రాంతం మరియు పంట వివరాలు చెప్పండి.' },
  'bn-IN': { answer: 'পরামর্শ', actions: 'তাৎক্ষণিক করণীয়', note: 'আরও নির্ভুল পরামর্শের জন্য আপনার স্থান ও ফসলের বিস্তারিত জানান।' },
  'kn-IN': { answer: 'ಸಲಹೆ', actions: 'ತಕ್ಷಣದ ಕ್ರಮಗಳು', note: 'ಹೆಚ್ಚು ನಿಖರ ಸಲಹೆಗೆ ನಿಮ್ಮ ಸ್ಥಳ ಮತ್ತು ಬೆಳೆ ವಿವರಗಳನ್ನು ತಿಳಿಸಿ.' },
  'ml-IN': { answer: 'ഉപദേശം', actions: 'ഉടൻ ചെയ്യേണ്ടത്', note: 'കൂടുതൽ കൃത്യതയ്ക്ക് നിങ്ങളുടെ സ്ഥലംയും വിളയുടെ വിവരങ്ങളും പങ്കിടുക.' },
};

function normalizeLanguage(language: string): SupportedLanguageCode {
  const code = (language || 'en-IN').toLowerCase();
  if (code in LANGUAGE_NORMALIZE) {
    return LANGUAGE_NORMALIZE[code];
  }
  const short = code.split('-')[0];
  return LANGUAGE_NORMALIZE[short] ?? 'en-IN';
}

function detectTopIntents(question: string): Intent[] {
  const q = question.toLowerCase();
  const scores: Array<{ intent: Intent; score: number }> = [];

  (Object.keys(INTENT_KEYWORDS) as Intent[]).forEach((intent) => {
    const keywords = INTENT_KEYWORDS[intent];
    const score = keywords.reduce((acc, word) => (q.includes(word) ? acc + 1 : acc), 0);
    scores.push({ intent, score });
  });

  const ranked = scores
    .filter((entry) => entry.score > 0 && entry.intent !== 'general')
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((entry) => entry.intent);

  return ranked.length ? ranked : ['general'];
}

function detectCrop(question: string): string | null {
  const q = question.toLowerCase();
  for (const cropEntry of CROP_TOKENS) {
    if (cropEntry.tokens.some((token) => q.includes(token))) {
      return cropEntry.crop;
    }
  }
  return null;
}

export function generateLocalAgronomyAnswer(question: string, language: string): string {
  const lang = normalizeLanguage(language);
  const intents = detectTopIntents(question);
  const primaryIntent = intents[0] ?? 'general';
  const crop = detectCrop(question);
  const advice = intents
    .map((intent) => ADVICE[intent][lang] ?? ADVICE[intent]['en-IN'] ?? ADVICE.general['en-IN']!)
    .join(' ');
  const heading = HEADING[lang] ?? HEADING['en-IN']!;

  const cropLine = crop
    ? lang === 'hi-IN'
      ? `फसल संदर्भ: ${crop}`
      : lang === 'ta-IN'
        ? `பயிர்: ${crop}`
        : lang === 'te-IN'
          ? `పంట: ${crop}`
          : lang === 'bn-IN'
            ? `ফসল: ${crop}`
            : lang === 'kn-IN'
              ? `ಬೆಳೆ: ${crop}`
              : lang === 'ml-IN'
                ? `വിള: ${crop}`
                : `Crop Context: ${crop}`
    : '';

  const actionsByIntent: Record<Intent, ReadonlyArray<string>> = {
    fertilizer:
      lang === 'hi-IN'
        ? ['फसल अवस्था के अनुसार खाद की किस्तें तय करें।', 'यूरिया/डीएपी/पोटाश की मात्रा नमी वाली मिट्टी में दें।', 'खाद देने के बाद हल्की सिंचाई/पानी प्रबंधन करें।']
        : lang === 'ta-IN'
          ? ['பயிர் கட்டத்திற்கு ஏற்ப உர அட்டவணையை நிர்ணயிக்கவும்.', 'ஈரமான மண்ணில் மட்டுமே உரம் இடவும்.', 'உரம் இடப்பட்ட பின் நீர்மட்டம்/பாசனத்தை சரி பார்க்கவும்.']
          : lang === 'te-IN'
            ? ['పంట దశకు అనుగుణంగా ఎరువు షెడ్యూల్ నిర్ణయించండి.', 'తడిగా ఉన్న నేలలోనే ఎరువులు వేయండి.', 'ఎరువు తర్వాత నీటి నిర్వహణను సరిచూడండి.']
            : ['Plan split doses based on crop stage.', 'Apply fertilizers on moist soil and avoid over-dosing.', 'Follow with proper irrigation/water management.'],
    pest:
      lang === 'hi-IN'
        ? ['5-7 दिन पर खेत निरीक्षण कर प्रभावित प्रतिशत नोट करें।', 'ETL पार होने पर ही दवा/स्प्रे करें और दवा बदल-बदलकर दें।', 'स्प्रे शाम को करें और सुरक्षा उपाय अपनाएं।']
        : lang === 'ta-IN'
          ? ['5-7 நாட்களுக்கு ஒருமுறை வயல் கண்காணித்து பாதிப்பு சதவீதம் பதிவு செய்யவும்.', 'ETL மீறினால் மட்டும் தெளிக்கவும்; மருந்து மாற்றி மாற்றி பயன்படுத்தவும்.', 'மாலை நேரத்தில் தெளித்து பாதுகாப்பு விதிகளை பின்பற்றவும்.']
          : lang === 'te-IN'
            ? ['5-7 రోజులకు ఒకసారి పొలాన్ని పరిశీలించి ప్రభావిత శాతం నమోదు చేయండి.', 'ETL దాటితేనే స్ప్రే చేయండి; రసాయనాలను రొటేట్ చేయండి.', 'సాయంత్రం స్ప్రే చేసి భద్రతా జాగ్రత్తలు పాటించండి.']
            : ['Scout the field and note infestation level.', 'Spray only above ETL and rotate chemistry.', 'Prefer evening spray and follow safety precautions.'],
    weather:
      lang === 'hi-IN'
        ? ['अगले 3-5 दिन का मौसम पूर्वानुमान देखें।', 'बारिश/हवा के अनुसार स्प्रे टाइमिंग तय करें।', 'लू/ठंड में सिंचाई और फसल सुरक्षा कदम लें।']
        : lang === 'ta-IN'
          ? ['அடுத்த 3-5 நாள் வானிலை முன்னறிவிப்பை பார்க்கவும்.', 'மழை/காற்றை வைத்து தெளிப்பு நேரத்தை நிர்ணயிக்கவும்.', 'வெப்ப/குளிர் காலங்களில் பாதுகாப்பு நடவடிக்கைகள் எடுக்கவும்.']
          : lang === 'te-IN'
            ? ['వచ్చే 3-5 రోజుల వాతావరణ సూచన చూడండి.', 'వర్షం/గాలి ఆధారంగా స్ప్రే సమయం నిర్ణయించండి.', 'ఉష్ణత/చలి సమయంలో పంట రక్షణ చర్యలు తీసుకోండి.']
            : ['Check the next 3-5 day forecast.', 'Plan spraying only in suitable wind/rain windows.', 'Adjust irrigation and protection for heat/cold events.'],
    market:
      lang === 'hi-IN'
        ? ['अपनी नजदीकी मंडी के पिछले 7 दिन के भाव देखें।', 'फसल की लागत/एकड़ और अनुमानित उपज से मार्जिन निकालें।', 'बिक्री का समय, ग्रेडिंग और भंडारण विकल्प तय करें।']
        : lang === 'ta-IN'
          ? ['அருகிலுள்ள மண்டி கடந்த 7 நாள் விலைகளை பார்க்கவும்.', 'செலவு/ஏக்கர் + எதிர்பார்க்கும் விளைச்சல் வைத்து மார்ஜின் கணக்கிடவும்.', 'விற்பனை நேரம், தரமிடல், சேமிப்பு திட்டம் அமைக்கவும்.']
          : lang === 'te-IN'
            ? ['మీ సమీప మండీ గత 7 రోజుల ధరలు చూడండి.', 'ఖర్చు/ఎకరం + అంచనా దిగుబడి ఆధారంగా మార్జిన్ లెక్కించండి.', 'అమ్మకం సమయం, గ్రేడింగ్, నిల్వ ప్లాన్ నిర్ణయించండి.']
            : ['Check last 7-day local mandi rates.', 'Estimate cost/acre and expected yield to compute margin.', 'Decide selling time, grading, and storage plan.'],
    soil:
      lang === 'hi-IN'
        ? ['मिट्टी परीक्षण (pH/OC/NPK/माइक्रो) कराएं।', 'FYM/कम्पोस्ट जोड़कर नमी और जैविकता बढ़ाएं।', 'आवश्यकतानुसार जिंक/सल्फर सुधार करें।']
        : lang === 'ta-IN'
          ? ['மண் பரிசோதனை (pH/OC/NPK/நுண்ணூட்ட) செய்யவும்.', 'FYM/கம்போஸ்ட் சேர்த்து ஈரப்பதம் மேம்படுத்தவும்.', 'தேவைக்கேற்ப ஜிங்க்/சல்பர் திருத்தம் செய்யவும்.']
          : lang === 'te-IN'
            ? ['నేల పరీక్ష (pH/OC/NPK/మైక్రో) చేయించండి.', 'FYM/కంపోస్ట్ వేసి తేమ, జీవక్రియ పెంచండి.', 'అవసరమైతే జింక్/సల్ఫర్ సరిదిద్దండి.']
            : ['Do a soil test (pH/OC/NPK/micros).', 'Add FYM/compost to improve moisture and biology.', 'Correct zinc/sulphur based on deficiency.'],
    irrigation:
      lang === 'hi-IN'
        ? ['मिट्टी प्रकार के अनुसार सिंचाई अंतराल तय करें।', 'जलभराव से बचें और ड्रेनेज साफ रखें।', 'मल्चिंग/ड्रिप से पानी की बचत करें।']
        : lang === 'ta-IN'
          ? ['மண் வகைப்படி பாசன இடைவெளியை நிர்ணயிக்கவும்.', 'நீர் தேக்கம் தவிர்த்து வடிகாலை சீர்படுத்தவும்.', 'மல்ச்சிங்/டிரிப் மூலம் நீர் சேமிக்கவும்.']
          : lang === 'te-IN'
            ? ['నేల రకం ప్రకారం నీటి విరామం నిర్ణయించండి.', 'నీరు నిల్వ కాకుండా డ్రైనేజ్ సరిచూడండి.', 'మల్చింగ్/డ్రిప్‌తో నీరు ఆదా చేయండి.']
            : ['Set irrigation interval based on soil type.', 'Avoid waterlogging and keep drainage clear.', 'Use mulching/drip to reduce water loss.'],
    scheme:
      lang === 'hi-IN'
        ? ['योजना/सब्सिडी की कैटेगरी तय करें (बीमा/ऋण/ड्रिप)।', 'दस्तावेज़ तैयार रखें (आधार/खसरा/बैंक)।', 'CSC/KVK या राज्य पोर्टल पर आवेदन/स्थिति देखें।']
        : lang === 'ta-IN'
          ? ['திட்ட வகையை தேர்வு செய்யவும் (காப்பீடு/கடன்/டிரிப்).', 'ஆவணங்களை தயாராக வைத்துக்கொள்ளவும் (ஆதார்/நில பதிவு/வங்கி).', 'CSC/KVK அல்லது மாநில தளத்தில் விண்ணப்ப நிலை பார்க்கவும்.']
          : lang === 'te-IN'
            ? ['పథకం వర్గాన్ని నిర్ణయించండి (బీమా/రుణం/డ్రిప్).', 'డాక్యుమెంట్లు సిద్ధంగా ఉంచండి (ఆధార్/భూమి/బ్యాంక్).', 'CSC/KVK లేదా రాష్ట్ర పోర్టల్‌లో అప్లై/స్టేటస్ చూడండి.']
            : ['Decide scheme category (insurance/loan/subsidy).', 'Keep documents ready (ID/land/bank).', 'Apply/check status via CSC/KVK or state portal.'],
    general:
      lang === 'hi-IN'
        ? ['फसल, अवस्था, स्थान और समस्या बताएं।', 'फोटो/लक्षण/दिनों की जानकारी जोड़ें।', 'तभी मैं डोज और शेड्यूल सटीक दे पाऊंगा।']
        : lang === 'ta-IN'
          ? ['பயிர், கட்டம், இடம், பிரச்சனை கூறுங்கள்.', 'படம்/அறிகுறி/நாட்கள் தகவல் சேர்க்கவும்.', 'அப்போதுதான் துல்லிய அளவு, அட்டவணை சொல்ல முடியும்.']
          : lang === 'te-IN'
            ? ['పంట, దశ, ప్రాంతం, సమస్య వివరాలు చెప్పండి.', 'ఫోటో/లక్షణాలు/రోజులు సమాచారం ఇవ్వండి.', 'అప్పుడే ఖచ్చితమైన మోతాదు, షెడ్యూల్ చెప్పగలను.']
            : ['Share crop, stage, location, and the issue.', 'Add symptoms/photos and number of days.', 'Then I can give exact dosage and schedule.'],
  };

  const actions = actionsByIntent[primaryIntent] ?? actionsByIntent.general;

  return [
    `${heading.answer}: ${advice}`,
    cropLine,
    '',
    `${heading.actions}:`,
    `1. ${actions[0]}`,
    `2. ${actions[1]}`,
    `3. ${actions[2]}`,
    '',
    heading.note,
  ]
    .filter(Boolean)
    .join('\n');
}
