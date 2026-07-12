export type AdvisoryLanguageCode = 'en' | 'hi' | 'ta' | 'te';

export interface AdviceRecord {
    id: number;
    crop: string;
    soilType: string;
    stage: string;
    issue: string;
    language?: AdvisoryLanguageCode;
    advice: AdviceResult;
    timestamp: string;
}

export interface AdviceResult {
    summary: string;
    actions: { icon: string; title: string; description: string; urgency: 'high' | 'medium' | 'low' }[];
    fertilizer: string;
    irrigation: string;
    pestAlert: string;
    weatherTip: string;
    soilTip: string;
}

export const CROP_PROFILES: Record<string, { seasons: string[]; stages: string[]; commonPests: string[]; npk: string }> = {
    'Wheat': { seasons: ['Rabi (Oct-Mar)'], stages: ['Sowing', 'CRI', 'Tillering', 'Jointing', 'Flowering', 'Grain Filling', 'Harvesting'], commonPests: ['Aphids', 'Yellow Rust', 'Powdery Mildew'], npk: '120:60:40 kg/ha' },
    'Rice': { seasons: ['Kharif (Jun-Nov)'], stages: ['Nursery', 'Transplanting', 'Tillering', 'Panicle Initiation', 'Flowering', 'Grain Filling', 'Harvesting'], commonPests: ['Brown Plant Hopper', 'Blast', 'Stem Borer'], npk: '120:60:60 kg/ha' },
    'Cotton': { seasons: ['Kharif (May-Dec)'], stages: ['Sowing', 'Squaring', 'Flowering', 'Boll Formation', 'Boll Opening', 'Picking'], commonPests: ['Pink Bollworm', 'Whitefly', 'Leaf Curl Virus'], npk: '120:60:60 kg/ha' },
    'Soybean': { seasons: ['Kharif (Jun-Oct)'], stages: ['Sowing', 'Seedling', 'Vegetative', 'Flowering', 'Pod Filling', 'Maturity', 'Harvesting'], commonPests: ['Girdle Beetle', 'Pod Borer', 'Stem Fly'], npk: '30:80:40 kg/ha' },
    'Sugarcane': { seasons: ['Annual (Feb-Dec)'], stages: ['Planting', 'Germination', 'Tillering', 'Grand Growth', 'Ripening', 'Harvesting'], commonPests: ['Early Shoot Borer', 'Top Borer', 'Pyrilla'], npk: '250:115:115 kg/ha' },
    'Maize': { seasons: ['Kharif (Jun-Oct)', 'Rabi (Nov-Mar)'], stages: ['Sowing', 'Emergence', 'Knee-High', 'Tasseling', 'Silking', 'Grain Filling', 'Harvesting'], commonPests: ['Fall Armyworm', 'Stem Borer', 'Earworm'], npk: '150:75:60 kg/ha' },
    'Mustard': { seasons: ['Rabi (Oct-Feb)'], stages: ['Sowing', 'Seedling', 'Rosette', 'Flowering', 'Pod Formation', 'Maturity', 'Harvesting'], commonPests: ['Aphids', 'Painted Bug', 'Sawfly'], npk: '80:40:40 kg/ha' },
    'Tomato': { seasons: ['Year Round'], stages: ['Nursery', 'Transplanting', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting'], commonPests: ['Fruit Borer', 'Leaf Curl Virus', 'Early Blight'], npk: '120:80:80 kg/ha' },
    'Onion': { seasons: ['Rabi (Oct-May)'], stages: ['Nursery', 'Transplanting', 'Vegetative', 'Bulb Formation', 'Maturity', 'Harvesting'], commonPests: ['Thrips', 'Purple Blotch', 'Stemphylium Blight'], npk: '100:50:50 kg/ha' },
    'Groundnut': { seasons: ['Kharif (Jun-Oct)'], stages: ['Sowing', 'Germination', 'Flowering', 'Pegging', 'Pod Development', 'Maturity', 'Harvesting'], commonPests: ['Leaf Miner', 'Bud Necrosis', 'Late Leaf Spot'], npk: '25:50:75 kg/ha' },
    'Bajra': { seasons: ['Kharif (Jun-Oct)'], stages: ['Sowing', 'Seedling', 'Tillering', 'Flowering', 'Grain Filling', 'Harvesting'], commonPests: ['Shoot Fly', 'Downy Mildew', 'Ergot'], npk: '80:40:40 kg/ha' },
    'Barley': { seasons: ['Rabi (Oct-Mar)'], stages: ['Sowing', 'CRI', 'Tillering', 'Jointing', 'Flowering', 'Grain Filling', 'Harvesting'], commonPests: ['Aphids', 'Stripe Rust', 'Powdery Mildew'], npk: '60:30:30 kg/ha' },
    'Jowar (Sorghum)': { seasons: ['Kharif (Jun-Oct)', 'Rabi (Oct-Mar)'], stages: ['Sowing', 'Seedling', 'Vegetative', 'Flowering', 'Grain Filling', 'Harvesting'], commonPests: ['Stem Borer', 'Shoot Fly', 'Grain Mold'], npk: '80:40:40 kg/ha' },
    'Chana (Chickpea)': { seasons: ['Rabi (Oct-Mar)'], stages: ['Sowing', 'Seedling', 'Vegetative', 'Flowering', 'Pod Filling', 'Maturity', 'Harvesting'], commonPests: ['Pod Borer', 'Wilt', 'Ascochyta Blight'], npk: '20:60:40 kg/ha' },
    'Potato': { seasons: ['Rabi (Oct-Mar)', 'Kharif (Jun-Sep)'], stages: ['Land Preparation', 'Planting', 'Vegetative', 'Tuber Initiation', 'Bulking', 'Maturity', 'Harvesting'], commonPests: ['Late Blight', 'Early Blight', 'Potato Tuber Moth'], npk: '180:80:100 kg/ha' },
};

export const SOIL_TIPS: Record<string, string> = {
    'Black Soil': 'Black (Vertisol) soil retains moisture well — reduce irrigation frequency by 20-25%. Apply Gypsum (250 kg/ha) every 3 years to prevent surface cracking. Often deficient in Zinc & Manganese; apply ZnSO₄ 25 kg/ha as basal dose.',
    'Red Soil': 'Red soil is highly leachable — use 3-4 split fertilizer applications. Often lacks Iron, Zinc, and Boron. Apply FeSO₄ (25 kg/ha) if yellowing is observed. Low water-holding capacity; prefer drip/sprinkler irrigation.',
    'Alluvial Soil': 'Alluvial soil has good nutrient-holding capacity. Tends to be deficient in Zinc and Sulphur. Apply ZnSO₄ 25 kg/ha + Elemental Sulphur 20 kg/ha in basal dose for optimal crop performance.',
    'Clay Loam': 'Clay loam soil risks waterlogging — ensure proper drainage. High P-fixation tendency; apply 15-20% extra phosphate. Good K retention — follow standard K application. Avoid tillage when wet.',
    'Sandy Soil': 'Sandy soil has poor nutrient and water retention. Apply fertilizers in 4-5 split doses. Add organic matter (FYM 5 t/acre) to improve water holding. Drip irrigation is highly recommended.',
    'Loamy Soil': 'Loamy soil is ideal for most crops. Follow standard NPK recommendations. Maintain organic carbon above 0.75% by adding FYM or incorporating crop residues back into the soil.',
    'Sandy Loam': 'Sandy loam has moderate retention. Practice split fertilization (2-3 doses of N). Apply 4-5 t FYM/acre for organic matter improvement. Good drainage characteristics minimize waterlogging risk.',
    'Laterite Soil': 'Laterite soil is acidic and low in organic matter, P, K, and Ca. Apply lime (2-4 q/ha) to correct pH. Use Rock Phosphate or SSP for better P availability. Add FYM (5 t/acre) and green manure to improve organic carbon. Drip irrigation is preferred due to low water-holding capacity.',
};

export const ADVISORY_LANGUAGES: Array<{ code: AdvisoryLanguageCode; label: string }> = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
];

export const UI_COPY: Record<AdvisoryLanguageCode, {
    pageTitle: string;
    pageSubtitle: string;
    history: string;
    advisoryHistory: string;
    noHistory: string;
    load: string;
    farmQuery: string;
    language: string;
    languageNote: string;
    selectCrop: string;
    cropInfo: string;
    season: string;
    npkRequirement: string;
    keyPests: string;
    soilType: string;
    cropStage: string;
    issue: string;
    optional: string;
    issuePlaceholder: string;
    analyzing: string;
    getDetailedAdvisory: string;
    emptyTitle: string;
    emptySubtitle: string;
    loadingTitle: string;
    loadingSubtitle: string;
    generatedFor: string;
    saveToHistory: string;
    saved: string;
    shareWhatsApp: string;
    recommendedActions: string;
    fertilizerSchedule: string;
    irrigationGuide: string;
    pestAlerts: string;
    weatherAdvisory: string;
    soilManagement: string;
}> = {
    en: {
        pageTitle: 'Crop Advisory',
        pageSubtitle: 'Get detailed AI-powered recommendations tailored to your exact farm conditions.',
        history: 'History',
        advisoryHistory: 'Advisory History',
        noHistory: 'No history yet. Generate an advisory and save it.',
        load: 'Load',
        farmQuery: 'Farm Query',
        language: 'Advisory Language',
        languageNote: 'Tip: You will get a localized summary with full agronomic details.',
        selectCrop: 'Select Crop',
        cropInfo: 'Crop Info',
        season: 'Season',
        npkRequirement: 'NPK Requirement',
        keyPests: 'Key Pests',
        soilType: 'Soil Type',
        cropStage: 'Crop Stage',
        issue: 'Describe Issue',
        optional: '(Optional)',
        issuePlaceholder: 'e.g., Leaves turning yellow, white spots, pest attack...',
        analyzing: 'Analyzing...',
        getDetailedAdvisory: 'Get Detailed Advisory',
        emptyTitle: 'Expert Farm Advisory',
        emptySubtitle: 'Select your crop details to get a comprehensive, stage-specific advisory with fertilizer schedules, pest alerts, and more.',
        loadingTitle: 'Analyzing Farm Data...',
        loadingSubtitle: 'Cross-referencing soil profiles, pest databases & crop stage data',
        generatedFor: 'Advisory Generated for',
        saveToHistory: 'Save to History',
        saved: 'Saved!',
        shareWhatsApp: 'Share on WhatsApp',
        recommendedActions: 'Recommended Actions',
        fertilizerSchedule: 'Fertilizer Schedule',
        irrigationGuide: 'Irrigation Guide',
        pestAlerts: 'Pest & Disease Alerts',
        weatherAdvisory: 'Weather Advisory',
        soilManagement: 'Soil Management',
    },
    hi: {
        pageTitle: 'फसल सलाह',
        pageSubtitle: 'आपकी खेती की स्थिति के अनुसार विस्तृत AI सलाह प्राप्त करें।',
        history: 'इतिहास',
        advisoryHistory: 'सलाह इतिहास',
        noHistory: 'अभी कोई इतिहास नहीं है। सलाह बनाएं और सहेजें।',
        load: 'लोड करें',
        farmQuery: 'फार्म विवरण',
        language: 'सलाह भाषा',
        languageNote: 'नोट: सारांश आपकी भाषा में और तकनीकी विवरण विस्तृत रूप में मिलेंगे।',
        selectCrop: 'फसल चुनें',
        cropInfo: 'फसल जानकारी',
        season: 'मौसम',
        npkRequirement: 'NPK आवश्यकता',
        keyPests: 'मुख्य कीट',
        soilType: 'मिट्टी का प्रकार',
        cropStage: 'फसल अवस्था',
        issue: 'समस्या लिखें',
        optional: '(वैकल्पिक)',
        issuePlaceholder: 'जैसे: पत्ते पीले हो रहे हैं, सफेद धब्बे, कीट हमला...',
        analyzing: 'विश्लेषण हो रहा है...',
        getDetailedAdvisory: 'विस्तृत सलाह प्राप्त करें',
        emptyTitle: 'विशेषज्ञ कृषि सलाह',
        emptySubtitle: 'फसल विवरण भरें और चरण-विशिष्ट सलाह, उर्वरक योजना, कीट अलर्ट आदि प्राप्त करें।',
        loadingTitle: 'फार्म डेटा का विश्लेषण...',
        loadingSubtitle: 'मिट्टी प्रोफाइल, कीट डेटाबेस और फसल अवस्था का मिलान किया जा रहा है',
        generatedFor: 'सलाह तैयार हुई:',
        saveToHistory: 'इतिहास में सहेजें',
        saved: 'सहेजा गया!',
        shareWhatsApp: 'WhatsApp पर साझा करें',
        recommendedActions: 'सुझाए गए कार्य',
        fertilizerSchedule: 'उर्वरक अनुसूची',
        irrigationGuide: 'सिंचाई मार्गदर्शिका',
        pestAlerts: 'कीट व रोग अलर्ट',
        weatherAdvisory: 'मौसम सलाह',
        soilManagement: 'मिट्टी प्रबंधन',
    },
    ta: {
        pageTitle: 'பயிர் ஆலோசனை',
        pageSubtitle: 'உங்கள் பண்ணை நிலைக்கு ஏற்ப விரிவான AI பரிந்துரைகளை பெறுங்கள்.',
        history: 'வரலாறு',
        advisoryHistory: 'ஆலோசனை வரலாறு',
        noHistory: 'வரலாறு இல்லை. முதலில் ஆலோசனை உருவாக்கி சேமிக்கவும்.',
        load: 'ஏற்றுக',
        farmQuery: 'பண்ணை தகவல்',
        language: 'ஆலோசனை மொழி',
        languageNote: 'குறிப்பு: சுருக்கம் உங்கள் மொழியில், தொழில்நுட்ப விவரங்கள் விரிவாக வழங்கப்படும்.',
        selectCrop: 'பயிரை தேர்வு செய்க',
        cropInfo: 'பயிர் தகவல்',
        season: 'சீசன்',
        npkRequirement: 'NPK தேவைகள்',
        keyPests: 'முக்கிய பூச்சிகள்',
        soilType: 'மண் வகை',
        cropStage: 'பயிர் நிலை',
        issue: 'பிரச்சனையை எழுதவும்',
        optional: '(விருப்பம்)',
        issuePlaceholder: 'உதா: இலை மஞ்சள், வெள்ளை புள்ளி, பூச்சி தாக்கம்...',
        analyzing: 'ஆய்வு நடக்கிறது...',
        getDetailedAdvisory: 'விரிவான ஆலோசனை பெற',
        emptyTitle: 'நிபுணர் பண்ணை ஆலோசனை',
        emptySubtitle: 'பயிர் விவரங்களை தேர்வு செய்து நிலைபடி உரம், பூச்சி எச்சரிக்கை உள்ளிட்ட ஆலோசனையை பெறுங்கள்.',
        loadingTitle: 'பண்ணை தரவு ஆய்வு செய்யப்படுகிறது...',
        loadingSubtitle: 'மண், பூச்சி மற்றும் பயிர் நிலை தரவுகள் ஒப்பிடப்படுகின்றன',
        generatedFor: 'இந்த பயிருக்கான ஆலோசனை:',
        saveToHistory: 'வரலாற்றில் சேமிக்க',
        saved: 'சேமிக்கப்பட்டது!',
        shareWhatsApp: 'WhatsApp-ல் பகிரவும்',
        recommendedActions: 'பரிந்துரைக்கப்பட்ட செயல்கள்',
        fertilizerSchedule: 'உர அட்டவணை',
        irrigationGuide: 'பாசன வழிகாட்டி',
        pestAlerts: 'பூச்சி மற்றும் நோய் எச்சரிக்கை',
        weatherAdvisory: 'வானிலை ஆலோசனை',
        soilManagement: 'மண் மேலாண்மை',
    },
    te: {
        pageTitle: 'పంట సలహా',
        pageSubtitle: 'మీ వ్యవసాయ పరిస్థితులకు సరిపోయే విపులమైన AI సలహాలను పొందండి.',
        history: 'చరిత్ర',
        advisoryHistory: 'సలహా చరిత్ర',
        noHistory: 'ఇప్పటివరకు చరిత్ర లేదు. ముందుగా సలహా రూపొందించి సేవ్ చేయండి.',
        load: 'లోడ్',
        farmQuery: 'పంట వివరాలు',
        language: 'సలహా భాష',
        languageNote: 'గమనిక: సారాంశం మీ భాషలో, పూర్తి సాంకేతిక వివరాలు విపులంగా అందుతాయి.',
        selectCrop: 'పంటను ఎంచుకోండి',
        cropInfo: 'పంట సమాచారం',
        season: 'సీజన్',
        npkRequirement: 'NPK అవసరం',
        keyPests: 'ముఖ్య పురుగులు',
        soilType: 'నేల రకం',
        cropStage: 'పంట దశ',
        issue: 'సమస్యను వివరించండి',
        optional: '(ఐచ్ఛికం)',
        issuePlaceholder: 'ఉదా: ఆకు పసుపు, తెల్ల మచ్చలు, పురుగు దాడి...',
        analyzing: 'విశ్లేషణ జరుగుతోంది...',
        getDetailedAdvisory: 'వివరమైన సలహా పొందండి',
        emptyTitle: 'నిపుణుల వ్యవసాయ సలహా',
        emptySubtitle: 'పంట వివరాలు ఎంచుకుని దశలవారీగా ఎరువు, పురుగు హెచ్చరికలు వంటి సలహాలను పొందండి.',
        loadingTitle: 'పంట డేటా విశ్లేషణ...',
        loadingSubtitle: 'నేల, పురుగు డేటాబేస్ మరియు పంట దశ వివరాలు పోల్చబడుతున్నాయి',
        generatedFor: 'ఈ పంటకు సలహా సిద్ధమైంది:',
        saveToHistory: 'చరిత్రలో సేవ్ చేయి',
        saved: 'సేవ్ అయింది!',
        shareWhatsApp: 'WhatsApp లో పంచుకోండి',
        recommendedActions: 'సిఫారసు చేసిన చర్యలు',
        fertilizerSchedule: 'ఎరువు షెడ్యూల్',
        irrigationGuide: 'నీటి పారుదల గైడ్',
        pestAlerts: 'పురుగు & వ్యాధి హెచ్చరికలు',
        weatherAdvisory: 'వాతావరణ సలహా',
        soilManagement: 'నేల నిర్వహణ',
    },
};

export function normalizeLanguagePreference(value: string | null | undefined): AdvisoryLanguageCode {
    const normalized = (value || '').trim().toLowerCase();

    if (normalized.startsWith('hi') || normalized.includes('हिं')) {
        return 'hi';
    }

    if (normalized.startsWith('ta') || normalized.includes('தமிழ')) {
        return 'ta';
    }

    if (normalized.startsWith('te') || normalized.includes('తెల')) {
        return 'te';
    }

    return 'en';
}

export function isAdvisoryLanguageCode(value: string): value is AdvisoryLanguageCode {
    return value === 'en' || value === 'hi' || value === 'ta' || value === 'te';
}

export type NativeIssueCategory = 'none' | 'yellow' | 'wilt' | 'spot' | 'pest' | 'stunted' | 'general';

export const NATIVE_SOIL_TIPS: Record<'hi' | 'ta' | 'te', Record<string, string>> = {
    hi: {
        'Black Soil': 'काली मिट्टी में नमी अधिक समय तक रहती है, इसलिए सिंचाई अंतराल बढ़ाएं। हर 3 साल में जिप्सम दें और जिंक की कमी पर ZnSO4 का बेसल प्रयोग करें।',
        'Red Soil': 'लाल मिट्टी में पोषक तत्व जल्दी लीच होते हैं, इसलिए खाद 3-4 किस्तों में दें। सूक्ष्म पोषक तत्व और जैविक खाद जोड़ना लाभकारी रहेगा।',
        'Alluvial Soil': 'जलोढ़ मिट्टी सामान्यतः उपजाऊ होती है, लेकिन जिंक और सल्फर की कमी दिख सकती है। बेसल में संतुलित सूक्ष्म पोषक प्रबंधन रखें।',
        'Clay Loam': 'चिकनी दोमट मिट्टी में जलभराव का खतरा रहता है। उचित जलनिकास बनाएं और फास्फोरस प्रबंधन थोड़ा बढ़ाकर करें।',
        'Sandy Soil': 'रेतीली मिट्टी में पानी और पोषक तत्व जल्दी निकलते हैं। बार-बार हल्की सिंचाई और स्प्लिट फर्टिलाइजर डोज अपनाएं।',
        'Loamy Soil': 'दोमट मिट्टी अधिकांश फसलों के लिए अच्छी है। मानक NPK के साथ जैविक कार्बन बढ़ाने हेतु FYM/कम्पोस्ट का नियमित उपयोग करें।',
        'Sandy Loam': 'रेतीली दोमट मिट्टी में मध्यम जलधारण होता है। नाइट्रोजन को 2-3 भागों में दें और जैविक पदार्थ बढ़ाने पर ध्यान दें।',
        'Laterite Soil': 'लैटेराइट मिट्टी अम्लीय और जैविक पदार्थ, P, K, Ca में कम होती है। pH सुधार के लिए चूना (2-4 क्विंटल/हेक्टेयर) दें। रॉक फॉस्फेट या SSP से P उपलब्धता बढ़ाएं। FYM (5 टन/एकड़) और हरी खाद से जैविक कार्बन सुधारें।',
    },
    ta: {
        'Black Soil': 'கருமண் நீரை நீண்ட நேரம் தக்கவைக்கிறது. ஆகவே பாசன இடைவெளியை அதிகரிக்கவும். 3 ஆண்டுகளுக்கு ஒருமுறை ஜிப்சம் மற்றும் ஜிங்க் குறைபாட்டுக்கு ZnSO4 பயன்படுத்தவும்.',
        'Red Soil': 'சிவப்பு மண்ணில் ஊட்டச்சத்து விரைவாக கழியும். உரத்தை 3-4 பிரிவாக வழங்கவும். நுண்ணூட்டச்சத்து மற்றும் கரிமப் பொருள் சேர்த்தால் நல்ல பலன் கிடைக்கும்.',
        'Alluvial Soil': 'அல்லுவியல் மண் பொதுவாக வளமானது, ஆனால் ஜிங்க் மற்றும் சல்பர் குறைபாடு இருக்கலாம். அடிப்படை உரத்தில் சமநிலை நுண்ணூட்ட மேலாண்மை செய்யவும்.',
        'Clay Loam': 'களிமண் கலந்த மண்ணில் நீர் தேக்கம் அபாயம் உள்ளது. வடிகால் வசதி உறுதி செய்து பாஸ்பரஸ் மேலாண்மையை சிறிது அதிகரிக்கவும்.',
        'Sandy Soil': 'மணல்வகை மண்ணில் நீரும் ஊட்டச்சத்தும் விரைவாக வெளியேறுகின்றன. அடிக்கடி குறைந்த அளவு பாசனம் மற்றும் பிரித்து உரம் வழங்கவும்.',
        'Loamy Soil': 'லோமி மண் பல பயிர்களுக்கு ஏற்றது. வழக்கமான NPK உடன் FYM/கம்போஸ்ட் மூலம் கரிம கார்பனை நிலையாக உயர்த்தவும்.',
        'Sandy Loam': 'மணல் கலந்த லோமி மண்ணில் நடுத்தர ஈரப்பத தாங்கும் திறன் உள்ளது. நைட்ரஜனை 2-3 கட்டமாக வழங்கி கரிமப் பொருளை உயர்த்தவும்.',
        'Laterite Soil': 'லேட்டரைட் மண் அமிலத்தன்மை கொண்டது, கரிமப் பொருள், P, K, Ca குறைவாக இருக்கும். pH சரிசெய்ய சுண்ணாம்பு (2-4 குவிண்டால்/ஹெக்டேர்) இடவும். ராக் பாஸ்பேட் அல்லது SSP மூலம் P கிடைக்கும்படி செய்யவும். FYM (5 டன்/ஏக்கர்) மற்றும் பசுந்தாள் உரத்தால் கரிம கார்பனை உயர்த்தவும்.',
    },
    te: {
        'Black Soil': 'బ్లాక్ సాయిల్ తేమను ఎక్కువసేపు నిల్వ ఉంచుతుంది కాబట్టి నీటి విరామాన్ని పెంచండి. మూడు సంవత్సరాలకు ఒకసారి జిప్సం ఇవ్వండి, జింక్ లోపం ఉంటే ZnSO4 వాడండి.',
        'Red Soil': 'ఎర్ర నేలలో పోషకాలు త్వరగా లీచింగ్ అవుతాయి. కాబట్టి ఎరువులను 3-4 విడతలుగా ఇవ్వండి. సూక్ష్మపోషకాలు, సేంద్రియ ఎరువులు కలపడం మంచిది.',
        'Alluvial Soil': 'అల్యూవియల్ నేల సాధారణంగా ఉత్పాదకత కలిగి ఉంటుంది, అయితే జింక్ మరియు సల్ఫర్ లోపం ఉండొచ్చు. బేసల్ దశలో సమతుల్య పోషక నిర్వహణ చేయండి.',
        'Clay Loam': 'క్లే లోమ్ నేలలో నీరు నిల్వ అవ్వడం ప్రమాదం ఉంటుంది. సరైన డ్రైనేజ్ ఏర్పాటు చేసి ఫాస్ఫరస్ నిర్వహణను కొద్దిగా పెంచండి.',
        'Sandy Soil': 'ఇసుక నేలలో నీరు మరియు పోషకాలు త్వరగా తగ్గుతాయి. తరచుగా తక్కువ మోతాదులో నీరు, విడతలుగా ఎరువులు ఇవ్వండి.',
        'Loamy Soil': 'లోమీ నేల చాలా పంటలకు అనుకూలం. సాధారణ NPKతో పాటు FYM/కాంపోస్ట్ ద్వారా సేంద్రియ కార్బన్ మెరుగుపరచండి.',
        'Sandy Loam': 'సాండీ లోమ్ నేలలో మధ్యస్థ తేమ నిల్వ ఉంటుంది. నైట్రోజన్‌ను 2-3 విడతలుగా ఇచ్చి సేంద్రియ పదార్థం పెంచండి.',
        'Laterite Soil': 'లాటరైట్ నేల ఆమ్లమైనది, సేంద్రియ పదార్థం, P, K, Ca తక్కువగా ఉంటాయి. pH సరిదిద్దడానికి సున్నం (2-4 క్వింటాల్/హెక్టేర్) వేయండి. రాక్ ఫాస్ఫేట్ లేదా SSP ద్వారా P లభ్యత పెంచండి. FYM (5 టన్/ఎకరం) మరియు పచ్చి ఎరువుతో సేంద్రియ కార్బన్ మెరుగుపరచండి.',
    },
};

export function detectIssueCategory(issue: string): NativeIssueCategory {
    const lowerIssue = issue.trim().toLowerCase();
    const originalIssue = issue.trim();

    if (!lowerIssue) {
        return 'none';
    }

    if (lowerIssue.includes('yellow') || lowerIssue.includes('pale') || originalIssue.includes('पीला') || originalIssue.includes('पीलापन') || originalIssue.includes('மஞ்சள்') || originalIssue.includes('పసుపు')) {
        return 'yellow';
    }

    if (lowerIssue.includes('wilt') || lowerIssue.includes('droop') || originalIssue.includes('मुरझा') || originalIssue.includes('सूखना') || originalIssue.includes('வாடுதல்') || originalIssue.includes('వాడిపోవడం')) {
        return 'wilt';
    }

    if (lowerIssue.includes('spot') || lowerIssue.includes('lesion') || lowerIssue.includes('blight') || originalIssue.includes('धब्बा') || originalIssue.includes('புள்ளி') || originalIssue.includes('మచ్చ')) {
        return 'spot';
    }

    if (lowerIssue.includes('insect') || lowerIssue.includes('pest') || lowerIssue.includes('bug') || lowerIssue.includes('aphid') || originalIssue.includes('कीट') || originalIssue.includes('कीड़ा') || originalIssue.includes('పురుగు') || originalIssue.includes('புழு') || originalIssue.includes('பூச்சி')) {
        return 'pest';
    }

    if (lowerIssue.includes('slow') || lowerIssue.includes('stunted') || originalIssue.includes('बौना') || originalIssue.includes('धीमा') || originalIssue.includes('குட்டை') || originalIssue.includes('మరగుజ్జు')) {
        return 'stunted';
    }

    return 'general';
}

export function getIssueAdviceNative(language: 'hi' | 'ta' | 'te', issue: string, category: NativeIssueCategory, crop: string): string {
    if (language === 'hi') {
        if (category === 'none') return 'अभी कोई विशेष समस्या दर्ज नहीं हुई है। नियमित निगरानी और चरण-आधारित प्रबंधन जारी रखें।';
        if (category === 'yellow') return `${crop} में पीलापन आमतौर पर नाइट्रोजन/सूक्ष्म पोषक कमी या जड़ तनाव का संकेत है। पहले नमी जांचें, फिर 2% यूरिया या आवश्यक सूक्ष्म पोषक का फोलियर स्प्रे करें।`;
        if (category === 'wilt') return `${crop} में मुरझाव की स्थिति में पहले सिंचाई स्थिति जांचें। पानी देने के बाद भी समस्या रहे तो जड़ रोग की जांच करें और ट्राइकोडर्मा आधारित ड्रेंचिंग करें।`;
        if (category === 'spot') return `${crop} में धब्बे/ब्लाइट के लिए प्रभावित पत्तियां हटाएं और अनुशंसित फफूंदनाशी का 7-10 दिन अंतराल पर छिड़काव करें।`; 
        if (category === 'pest') return `${crop} में कीट दबाव दिख रहा है। ETL के आधार पर चयनात्मक कीटनाशी चुनें, शाम के समय स्प्रे करें और फेरोमोन/स्टिकी ट्रैप लगाएं।`;
        if (category === 'stunted') return `${crop} में धीमी वृद्धि के लिए मिट्टी परीक्षण, pH सुधार और सूक्ष्म पोषक स्प्रे करें। जड़ क्षेत्र की सघनता और जलनिकास भी जांचें।`;
        return `रिपोर्ट की गई समस्या "${issue}" के लिए खेत निरीक्षण, पौध नमूना और स्थानीय KVK पुष्टि के बाद लक्षित उपचार अपनाएं।`;
    }

    if (language === 'ta') {
        if (category === 'none') return 'தற்போது தனிப்பட்ட பிரச்சனை பதிவு செய்யப்படவில்லை. கட்டம்-அடிப்படையிலான மேலாண்மை மற்றும் வழக்கமான கண்காணிப்பை தொடருங்கள்.';
        if (category === 'yellow') return `${crop} இல் இலை மஞ்சளாகுதல் பொதுவாக நைட்ரஜன்/நுண்ணூட்ட குறைபாடு அல்லது வேர் அழுத்தத்தை குறிக்கும். முதலில் மண் ஈரப்பதத்தை சரிபார்த்து, பின்னர் 2% யூரியா அல்லது தேவையான நுண்ணூட்ட தெளிப்பை செய்யவும்.`;
        if (category === 'wilt') return `${crop} இல் வாடுதல் இருந்தால் முதலில் பாசன நிலை சரிபார்க்கவும். நீர் அளித்தும் பிரச்சனை நீங்கவில்லை என்றால் வேர் நோய் சாத்தியம் உள்ளது; டிரைக்கோடெர்மா டிரெஞ்சிங் செய்யவும்.`;
        if (category === 'spot') return `${crop} இல் இலை புள்ளி/பிளைட் அறிகுறி இருந்தால் பாதிக்கப்பட்ட இலைகளை அகற்றி, பரிந்துரைக்கப்பட்ட பூஞ்சைநாசினியை 7-10 நாள் இடைவெளியில் தெளிக்கவும்.`;
        if (category === 'pest') return `${crop} இல் பூச்சி அழுத்தம் உள்ளது. ETL அடிப்படையில் தேர்ந்தெடுத்த மருந்தை மாலை நேரத்தில் தெளித்து, பெரோமோன்/ஸ்டிக்கி வலைகள் அமைக்கவும்.`;
        if (category === 'stunted') return `${crop} இல் வளர்ச்சி தாமதம் இருந்தால் மண் பரிசோதனை, pH சீரமைப்பு மற்றும் நுண்ணூட்ட தெளிப்பு செய்யவும். வேர் பகுதி நெருக்கம் மற்றும் வடிகால் நிலையும் பார்க்கவும்.`;
        return `"${issue}" என்ற பிரச்சனைக்கு வயல் ஆய்வு மற்றும் உள்ளூர் வேளாண் நிபுணர் உறுதிப்படுத்தலுடன் குறிக்கோள் சிகிச்சை செய்யவும்.`;
    }

    if (category === 'none') return 'ప్రస్తుతం ప్రత్యేక సమస్య నమోదు కాలేదు. దశల వారీ నిర్వహణ మరియు క్రమమైన పర్యవేక్షణ కొనసాగించండి.';
    if (category === 'yellow') return `${crop} లో ఆకులు పసుపు రావడం సాధారణంగా నైట్రోజన్/సూక్ష్మపోషక లోపం లేదా వేర్ల ఒత్తిడిని సూచిస్తుంది. ముందుగా తేమను చూసి, తర్వాత 2% యూరియా లేదా అవసరమైన మైక్రోన్యూట్రియెంట్ స్ప్రే చేయండి.`;
    if (category === 'wilt') return `${crop} లో వాడిపోవడం కనిపిస్తే ముందుగా నీటి పరిస్థితి చూడండి. నీరు ఇచ్చినా సమస్య ఉంటే వేర్ల వ్యాధి అవకాశం ఉంది; ట్రైకోడెర్మా డ్రెంచింగ్ చేయండి.`;
    if (category === 'spot') return `${crop} లో మచ్చలు/బ్లైట్ లక్షణాలు ఉంటే ప్రభావిత ఆకులను తొలగించి, సిఫారసు చేసిన ఫంగిసైడ్‌ను 7-10 రోజుల వ్యవధిలో స్ప్రే చేయండి.`;
    if (category === 'pest') return `${crop} లో పురుగు ఒత్తిడి ఉంది. ETL ఆధారంగా సెలెక్టివ్ ఇన్సెక్టిసైడ్ వాడండి, సాయంత్రం స్ప్రే చేయండి, ఫెరోమోన్/స్టిక్కీ ట్రాప్స్ ఉపయోగించండి.`;
    if (category === 'stunted') return `${crop} లో ఎదుగుదల మందగిస్తే నేల పరీక్ష, pH సరిదిద్దడం, సూక్ష్మపోషక స్ప్రే చేయండి. వేరు మండల సాంద్రత మరియు డ్రైనేజ్ కూడా పరిశీలించండి.`;
    return `"${issue}" సమస్యకు ఖచ్చితమైన పరిష్కారం కోసం పొలం పరిశీలన చేసి స్థానిక వ్యవసాయ నిపుణుడి నిర్ధారణతో చర్యలు తీసుకోండి.`;
}

export function buildNativeActions(language: 'hi' | 'ta' | 'te', crop: string, stage: string, soilType: string, npk: string): AdviceResult['actions'] {
    if (language === 'hi') {
        return [
            { icon: '🧪', title: 'चरण-आधारित पोषण योजना', description: `${crop} की ${stage} अवस्था के लिए ${npk} लक्ष्य रखें। नाइट्रोजन को विभाजित खुराक में दें और फॉस्फोरस/पोटाश को समय पर बेसल या अनुशंसित चरण में दें।`, urgency: 'high' },
            { icon: '💧', title: 'मिट्टी-आधारित सिंचाई', description: `${soilType} मिट्टी को ध्यान में रखते हुए सिंचाई अंतराल तय करें। जलभराव से बचें, पर नमी तनाव भी न आने दें।`, urgency: 'high' },
            { icon: '🔍', title: 'साप्ताहिक फसल निगरानी', description: 'हर 5-7 दिन पर खेत निरीक्षण करें: पत्ती रंग, कीट संख्या, रोग लक्षण और पौध वृद्धि दर्ज करें। ETL पार होने पर ही रसायन उपयोग करें।', urgency: 'medium' },
        ];
    }

    if (language === 'ta') {
        return [
            { icon: '🧪', title: 'கட்டம்-அடிப்படையிலான உர மேலாண்மை', description: `${crop} பயிரின் ${stage} கட்டத்திற்கு ${npk} இலக்கை பின்பற்றவும். நைட்ரஜனை பிரித்து வழங்கி, பாஸ்பரஸ்/பொட்டாசியம் சரியான கட்டத்தில் கொடுக்கவும்.`, urgency: 'high' },
            { icon: '💧', title: 'மண் வகை அடிப்படையிலான பாசனம்', description: `${soilType} மண்ணை கருத்தில் கொண்டு பாசன இடைவெளி நிர்ணயிக்கவும். நீர் தேக்கம் தவிர்த்து, ஈரப்பத குறைவும் வராதபடி பார்க்கவும்.`, urgency: 'high' },
            { icon: '🔍', title: 'வாராந்திர பயிர் கண்காணிப்பு', description: 'ஒவ்வொரு 5-7 நாளும் இலை நிறம், பூச்சி அழுத்தம், நோய் அறிகுறிகள், வளர்ச்சி நிலையை பதிவு செய்யவும். ETL மீறினால் மட்டுமே மருந்து பயன்படுத்தவும்.', urgency: 'medium' },
        ];
    }

    return [
        { icon: '🧪', title: 'దశల వారీ పోషక నిర్వహణ', description: `${crop} పంట ${stage} దశకు ${npk} లక్ష్యాన్ని అనుసరించండి. నైట్రోజన్‌ను విడతలుగా ఇచ్చి, ఫాస్ఫరస్/పొటాష్‌ను సరైన దశలో ఇవ్వండి.`, urgency: 'high' },
        { icon: '💧', title: 'నేల రకం ఆధారంగా నీటి ప్రణాళిక', description: `${soilType} నేల లక్షణాలను బట్టి నీటి విరామాన్ని నిర్ణయించండి. నీరు నిల్వ కాకుండా, తేమ లోపం రాకుండా సమతుల్యం పాటించండి.`, urgency: 'high' },
        { icon: '🔍', title: 'వారానికి ఒకసారి పంట పరిశీలన', description: 'ప్రతి 5-7 రోజులకు ఆకుల రంగు, పురుగు ఒత్తిడి, వ్యాధి లక్షణాలు, పెరుగుదల స్థితిని నమోదు చేయండి. ETL దాటితేనే రసాయన చర్య తీసుకోండి.', urgency: 'medium' },
    ];
}

export function generateNativeLanguageAdvice(language: 'hi' | 'ta' | 'te', crop: string, soilType: string, stage: string, issue: string): AdviceResult {
    const profile = CROP_PROFILES[crop] || CROP_PROFILES['Wheat'];
    const issueCategory = detectIssueCategory(issue);
    const issueAdvice = getIssueAdviceNative(language, issue, issueCategory, crop);
    const actions = buildNativeActions(language, crop, stage, soilType, profile.npk);

    if (language === 'hi') {
        return {
            summary: `${crop} के लिए ${stage} अवस्था पर विस्तृत AI सलाह तैयार है। मिट्टी प्रकार: ${soilType}। अनुशंसित NPK लक्ष्य ${profile.npk} है। ${issueAdvice}`,
            actions,
            fertilizer: `${crop} के लिए पोषण प्रबंधन में कुल लक्ष्य ${profile.npk} रखें। ${soilType} में पोषक तत्व उपलब्धता के अनुसार नाइट्रोजन को 2-3 किस्तों में दें। ${stage} अवस्था में पौधे के रंग और वृद्धि के आधार पर टॉप ड्रेसिंग समय तय करें, और आवश्यक सूक्ष्म पोषक स्प्रे करें।`,
            irrigation: `${stage} अवस्था में सिंचाई का लक्ष्य जड़ क्षेत्र में स्थिर नमी बनाए रखना है। ${soilType} में जलधारण क्षमता के अनुसार अंतराल बदलें। हल्की नमी कमी दिखते ही सिंचाई करें, लेकिन जलभराव से बचें ताकि जड़ रोग न बढ़े।`,
            pestAlert: `मुख्य जोखिम कीट/रोग: ${profile.commonPests.join(', ')}। खेत का साप्ताहिक सर्वे करें, ETL स्तर के बाद ही स्प्रे करें और कीटनाशी रोटेशन अपनाएं। ${issueAdvice}`,
            weatherTip: `${crop} के लिए मौसम-आधारित प्रबंधन अपनाएं: तेज हवा और आसन्न बारिश में स्प्रे टालें, गर्म दिनों में सुबह/शाम सिंचाई करें, और 3-5 दिन पूर्वानुमान के आधार पर कृषि कार्य तय करें।`,
            soilTip: NATIVE_SOIL_TIPS.hi[soilType] || NATIVE_SOIL_TIPS.hi['Loamy Soil'],
        };
    }

    if (language === 'ta') {
        return {
            summary: `${crop} பயிருக்கான ${stage} நிலைக்கு விரிவான AI ஆலோசனை தயாராக உள்ளது. மண் வகை: ${soilType}. பரிந்துரைக்கப்பட்ட NPK இலக்கு ${profile.npk}. ${issueAdvice}`,
            actions,
            fertilizer: `${crop} பயிருக்கு ${profile.npk} என்ற ஊட்டச்சத்து இலக்கை பின்பற்றவும். ${soilType} மண்ணில் கிடைக்கும் ஊட்டச்சத்து நிலைக்கு ஏற்ப நைட்ரஜனை 2-3 கட்டங்களாக வழங்கவும். ${stage} கட்டத்தில் இலை நிறம் மற்றும் வளர்ச்சி அடிப்படையில் மேல் உரம் நேரத்தை சரிசெய்யவும்.`,
            irrigation: `${stage} கட்டத்தில் வேர் மண்டலத்தில் சீரான ஈரப்பதம் பராமரிக்க வேண்டும். ${soilType} மண்ணின் நீர் தாங்கும் திறனைப் பார்த்து பாசன இடைவெளியை மாற்றவும். நீர் தேக்கம் ஏற்படாதபடி கவனிக்கவும்.`,
            pestAlert: `முக்கிய பூச்சி/நோய் அபாயங்கள்: ${profile.commonPests.join(', ')}. வாரந்தோறும் கண்காணித்து ETL அளவை மீறினால் மட்டுமே மருந்து தெளிக்கவும்; மருந்து வகைகளை மாற்றி மாற்றி பயன்படுத்தவும். ${issueAdvice}`,
            weatherTip: `${crop} பயிருக்கு வானிலை அடிப்படையிலான மேலாண்மை அவசியம்: அதிக காற்று அல்லது மழை வாய்ப்பு நேரங்களில் தெளிப்பை தவிர்க்கவும், வெப்ப நாட்களில் காலை/மாலை பாசனம் செய்யவும், 3-5 நாள் கணிப்பின் அடிப்படையில் வேலையை திட்டமிடவும்.`,
            soilTip: NATIVE_SOIL_TIPS.ta[soilType] || NATIVE_SOIL_TIPS.ta['Loamy Soil'],
        };
    }

    return {
        summary: `${crop} పంటకు ${stage} దశలో విపులమైన AI సలహా సిద్ధంగా ఉంది. నేల రకం: ${soilType}. సూచించిన NPK లక్ష్యం ${profile.npk}. ${issueAdvice}`,
        actions,
        fertilizer: `${crop} పంటకు ${profile.npk} పోషక లక్ష్యాన్ని అనుసరించండి. ${soilType} నేలలో పోషకాల లభ్యతను బట్టి నైట్రోజన్‌ను 2-3 విడతలుగా ఇవ్వండి. ${stage} దశలో ఆకు రంగు, పెరుగుదల ఆధారంగా టాప్‌డ్రెసింగ్ సమయాన్ని సరిచేయండి.`,
        irrigation: `${stage} దశలో వేరు మండలంలో సమతుల్య తేమను నిలబెట్టడం ప్రధాన లక్ష్యం. ${soilType} నేల నీటి నిల్వ సామర్థ్యాన్ని బట్టి నీటి విరామాన్ని సర్దుబాటు చేయండి. నీరు నిల్వ కాకుండా జాగ్రత్తపడండి.`,
        pestAlert: `ప్రధాన పురుగు/వ్యాధి ప్రమాదాలు: ${profile.commonPests.join(', ')}. ప్రతి వారం పరిశీలన చేసి ETL దాటినప్పుడు మాత్రమే స్ప్రే చేయండి; ఒకే రకం రసాయనాన్ని వరుసగా వాడకండి. ${issueAdvice}`,
        weatherTip: `${crop} పంటకు వాతావరణ ఆధారిత నిర్వహణ పాటించండి: గాలి వేగం ఎక్కువగా ఉన్నప్పుడు లేదా వర్ష సూచన ఉన్నప్పుడు స్ప్రే వాయిదా వేయండి; ఎండ రోజులలో ఉదయం/సాయంత్రం నీరు పెట్టండి; 3-5 రోజుల అంచనాతో పనులను ప్లాన్ చేయండి.`,
        soilTip: NATIVE_SOIL_TIPS.te[soilType] || NATIVE_SOIL_TIPS.te['Loamy Soil'],
    };
}

export function generateAdvice(crop: string, soilType: string, stage: string, issue: string): AdviceResult {
    const profile = CROP_PROFILES[crop] || CROP_PROFILES['Wheat'];

    const stageActions: Record<string, { icon: string; title: string; description: string; urgency: 'high' | 'medium' | 'low' }[]> = {
        'Sowing': [
            { icon: '🌱', title: 'Seed Treatment', description: `Treat seeds with Thiram (2.5 g/kg) + Carbendazim (1 g/kg) to prevent soil-borne diseases. Inoculate legumes with Rhizobium culture. Use certified and treated seeds from registered dealers only.`, urgency: 'high' },
            { icon: '💊', title: 'Basal Fertilizer', description: `Apply full P & K and 1/3rd N at sowing time. Recommended basal NPK for ${crop}: ${profile.npk}. Mix DAP + MOP in the furrow before planting. Do NOT apply urea as basal — it volatilizes rapidly.`, urgency: 'high' },
            { icon: '🌿', title: 'Weed Management', description: 'Apply pre-emergence herbicide (Pendimethalin 1L/acre) immediately after sowing but before crop emergence. This critical window prevents early-season weed competition that can reduce yield by 20-40%.', urgency: 'medium' },
        ],
        'Vegetative': [
            { icon: '🧪', title: 'Nitrogen Top Dressing', description: `Apply 2nd dose of Nitrogen: Urea @ ${crop === 'Rice' ? '35' : '30'} kg/acre. Ensure soil is moist before application to prevent volatilization. For Sandy Soil, split into 2 smaller applications.`, urgency: 'high' },
            { icon: '🔍', title: 'Pest Scouting', description: `Monitor weekly for ${profile.commonPests.join(', ')}. Use yellow sticky traps at 1 trap/40 sq.m to detect early sucking pest populations. Record counts for informed spray decisions.`, urgency: 'medium' },
            { icon: '💧', title: 'Irrigation Scheduling', description: 'Maintain soil moisture at 60-80% field capacity. For drip/sprinkler: schedule 2-3 irrigations per week based on ET rate of your region. Avoid both waterlogging and drought stress.', urgency: 'medium' },
        ],
        'Tillering': [
            { icon: '🧪', title: 'Second Dose N Application', description: `Apply 2nd nitrogen top dressing (Urea @ 25-30 kg/acre) during active tillering. This is the most responsive stage to nitrogen in cereals. Apply to moist soil.`, urgency: 'high' },
            { icon: '🌿', title: 'Weed & Tiller Management', description: 'Remove excess tillers after 30-35 DAS. Apply post-emergence narrowleaf herbicide (Isoproturon 75 WP @ 1 kg/acre) for wild oat and grass weed control.', urgency: 'medium' },
        ],
        'Jointing': [
            { icon: '🧪', title: 'Nitrogen & Potassium Application', description: 'Apply second split of nitrogen (remaining 50%). Potassium application helps stem strength. Foliar zinc spray if deficiency shows.', urgency: 'high' },
            { icon: '💧', title: 'Irrigation for Rapid Growth', description: 'Maintain adequate moisture during this rapid growth phase. Deficit now reduces tiller count and grain sites.', urgency: 'high' },
            { icon: '🐛', title: 'Pest & Disease Scouting', description: 'Scout for stem borers, armyworm, and aphids. Fungicide spray for rust or powdery mildew if weather is humid.', urgency: 'medium' },
            { icon: '🌿', title: 'General Jointing Stage Management', description: 'This is a critical stage for determining final yield potential. Avoid any mechanical damage to stems. Weed management should be completed before canopy closure.', urgency: 'medium' },
        ],
        'Flowering': [
            { icon: '⚠️', title: 'Critical Irrigation', description: `Flowering is the MOST water-sensitive stage for ${crop}. Even 24-48 hours of water stress can reduce yield by 15-30%. Irrigate every 4-5 days or when soil moisture drops below 50% field capacity. Do NOT miss this irrigation.`, urgency: 'high' },
            { icon: '🐛', title: 'Pest Alert', description: `${crop === 'Cotton' ? 'Install 10 pheromone traps/acre for Pink Bollworm. Spray Spinosad 45 SC @ 75 ml/acre if egg-laying detected.' : crop === 'Tomato' ? 'Scout for Helicoverpa (fruit borer). Apply Spinosad 45 SC @ 75 ml/acre at petal fall.' : 'Scout for pod/boll borers daily. Apply Chlorpyriphos 20 EC @ 300 ml/acre if infestation exceeds 5%.'}`, urgency: 'high' },
            { icon: '🚫', title: 'Pollinator Protection', description: 'Do NOT apply broad-spectrum insecticide during 6 AM–10 AM (peak flowering/pollinator hours). Spray only in the evening. Use selective bio-insecticides where possible.', urgency: 'medium' },
            { icon: '🌿', title: 'Micronutrient Foliar Spray', description: `Spray 0.5% Zinc Sulphate + 0.1% Boric Acid to enhance pollen viability and fruit set. This single spray can boost ${crop} yield by 8-12% at minimal cost.`, urgency: 'low' },
        ],
        'Fruiting': [
            { icon: '🧪', title: 'Potassium Application', description: `Apply Potassium Sulphate (SOP) @ 2 kg/acre foliar or 50 kg/acre soil application. Potassium directly enhances fruit size, quality (sugar content, colour), and shelf life.`, urgency: 'high' },
            { icon: '🌱', title: 'Calcium-Boron Spray', description: 'Spray Calcium Boron @ 1 ml/L every 10 days during fruiting to prevent fruit cracking, blossom end rot, and hollow stem — common disorders of Ca/B deficiency.', urgency: 'medium' },
            { icon: '💧', title: 'Controlled Irrigation', description: 'Reduce irrigation slightly to improve dry matter and sugar accumulation in fruits. Target 50-60% field capacity. Avoid both stress and overwatering at this stage.', urgency: 'low' },
        ],
        'Harvesting': [
            { icon: '✂️', title: 'Optimum Harvest Timing', description: `Harvest ${crop} when: ${crop === 'Wheat' ? 'grain moisture is 15-18% and leaves have turned golden yellow (avoid over-drying)' : crop === 'Cotton' ? 'bolls are fully open; avoid early morning harvest during dew' : crop === 'Rice' ? '90% panicles have turned golden; drain water 15 days before harvest' : 'crop reaches physiological maturity indicators for your variety'}. Early/late harvest both reduce quality and marketable yield.`, urgency: 'high' },
            { icon: '🛑', title: 'Pre-Harvest Interval (PHI)', description: 'Verify that the PHI for any pesticide applied has fully elapsed (typically 7-21 days). Check the product label. Failure to follow PHI can result in rejection at mandis and food safety violations.', urgency: 'high' },
            { icon: '📦', title: 'Post-Harvest Storage', description: `Store ${crop} in clean, dry bags/silos at moisture below ${['Rice', 'Wheat', 'Maize'].includes(crop) ? '14%' : '10%'}. Use Aluminium Phosphide @ 1 tablet/tonne for stored grain pest control. Line bags on pallets to avoid floor moisture uptake.`, urgency: 'medium' },
        ],
        'CRI': [
            { icon: '💧', title: 'CRI Irrigation — Do Not Skip', description: 'Crown Root Initiation (21-25 DAS) is the MOST critical Wheat irrigation. Applying 4-5 cm water now directly determines the number of productive tillers and final yield. Never skip this irrigation.', urgency: 'high' },
            { icon: '🌿', title: 'First Nitrogen Top Dress', description: 'Apply 1st split of N (Urea @ 30 kg/acre) at CRI stage. Apply to moist soil immediately after irrigation. This feeds the expanding root system and promotes vigorous tillering.', urgency: 'high' },
        ],
        'Nursery': [
            { icon: '🌱', title: 'Nursery Bed Preparation', description: 'Prepare raised nursery beds (1m wide × 10m long) with well-pulverized soil. Apply FYM (1 kg/m²) + DAP (50g/m²) before sowing. Ensure good drainage to prevent damping-off disease.', urgency: 'high' },
            { icon: '💊', title: 'Seed Treatment & Sowing', description: 'Treat seeds with Thiram 2.5g + Carbendazim 1g per kg seed. Sow in lines 5–7 cm apart. Cover lightly with soil and mulch with dry grass/straw to retain moisture and prevent crust formation.', urgency: 'high' },
            { icon: '💧', title: 'Nursery Watering', description: 'Water twice daily (morning + evening) using a fine rose can for the first 7–10 days. Avoid waterlogging. As seedlings emerge, reduce to once daily. Expose to full sunlight after emergence.', urgency: 'medium' },
        ],
        'Transplanting': [
            { icon: '🌿', title: 'Transplanting Readiness Check', description: 'Seedlings are ready to transplant when 25–35 days old (rice: 15–25 days for short-duration varieties). Select healthy seedlings free from yellowing or disease. Harden seedlings by withholding water 2 days before pulling.', urgency: 'high' },
            { icon: '💧', title: 'Field Preparation & Transplanting', description: 'Ensure field has adequate soil moisture. Transplant in the evening or on cloudy days to reduce transplant shock. Maintain proper spacing as per crop requirements. Apply basal dose fertilizers before transplanting.', urgency: 'high' },
            { icon: '🔍', title: 'Post-Transplant Care', description: 'Keep field moist for 5–7 days after transplanting. Check for wilting daily — wilted plants indicate root damage or water stress. Apply starter dose of N (Urea @ 10 kg/acre) 7–10 days post-transplant to encourage early establishment.', urgency: 'medium' },
        ],
        'Germination': [
            { icon: '💧', title: 'Soil Moisture Management', description: 'Maintain consistent soil moisture at 60–70% field capacity during germination. Avoid surface crust formation — light irrigation with sprinkler preferred. Crusting prevents seedling emergence and should be broken by light harrowing.', urgency: 'high' },
            { icon: '🌡️', title: 'Temperature & Thinning', description: 'Optimal germination temperature: 25–32°C for most crops. If germination is patchy after 10–14 days, check seed viability. Plan for gap-filling within 5 days of sowing. Gap-fill using pre-soaked seeds or maintain nursery for replanting.', urgency: 'medium' },
        ],
        'Seedling': [
            { icon: '🧪', title: 'Starter Fertilizer Application', description: 'Apply phosphatic starter fertilizer (DAP diluted @ 2g/L water as foliar) to support rapid root development. Alternatively use water-soluble 12-61-0 (MAP) to boost early root and shoot growth.', urgency: 'high' },
            { icon: '🔍', title: 'Watch for Damping-Off & Cutworms', description: 'Damping-off disease causes seedling collapse at soil surface. Apply Carbendazim 0.1% drenching around the base. Cutworm damage appears as cut stems near the soil — apply Chlorpyriphos granules in soil if detected.', urgency: 'medium' },
            { icon: '🌿', title: 'Thinning to Optimal Stand', description: 'Thin seedlings to recommended crop spacing 10–15 DAS. Overcrowded seedlings compete for light and nutrients, weakening the entire stand. Remove weaker plants preferentially. Optimal plant population determines yield ceiling.', urgency: 'medium' },
        ],
        'Emergence': [
            { icon: '🌱', title: 'Stand Count & Gap Filling', description: 'Count emerged plants to calculate plant population. If stand is less than 75% of recommended, do gap-filling within 7–10 DAS using pre-soaked seeds. Low plant populations significantly reduce yield potential.', urgency: 'high' },
            { icon: '🌿', title: 'Pre-Emergence Weed Control', description: 'If pre-emergence herbicide was not applied at sowing, apply Pendimethalin 1L/acre within 3 days of crop emergence (before first weeds emerge). A clean field in the first 30 days is critical for establishing yield potential.', urgency: 'medium' },
        ],
        'Planting': [
            { icon: '🌱', title: 'Seed/Sett Selection & Treatment', description: 'Select disease-free, well-matured seed material. For vegetatively propagated crops (sugarcane, potato), treat setts with fungicide (Carbendazim 0.1%) before planting. Ensure optimum sett/seed size for rapid emergence.', urgency: 'high' },
            { icon: '💊', title: 'Basal Fertilizer Placement', description: 'Apply full P & K and 1/3 N as basals in furrows before planting. Proper basal placement near the root zone improves nutrient use efficiency. Use appropriate spacing as per variety recommendations.', urgency: 'high' },
            { icon: '💧', title: 'Post-Planting Irrigation', description: 'Apply first irrigation immediately after planting to ensure soil-seed/sett contact. This is critical for uniform germination. In hot dry conditions, irrigate every 3–4 days until 60–70% emergence is achieved.', urgency: 'medium' },
        ],
        'Tasseling': [
            { icon: '💧', title: 'Critical Moisture for Tasseling', description: 'Maize tasseling is extremely sensitive to water stress. Water deficit at this stage reduces pollen viability and causes "silk delay" leading to poor kernel set. Irrigate every 4–5 days. Never allow wilting.', urgency: 'high' },
            { icon: '🐛', title: 'Fall Armyworm Monitoring', description: 'Inspect whorl leaves for fall armyworm feeding. "Window-pane" damage and frass in the whorl are early signs. Apply Chlorantraniliprole 18.5 SC @ 30 ml/acre or Spinosad 45 SC @ 75 ml/acre. Early action is critical.', urgency: 'high' },
            { icon: '🧪', title: 'Top Dressing of Nitrogen', description: 'Apply final N top dressing (Urea @ 30 kg/acre) at knee-high to tasseling. This directly feeds grain filling. Apply to moist soil and cover lightly to avoid volatilization.', urgency: 'medium' },
        ],
        'Silking': [
            { icon: '⚠️', title: 'Silk Receptivity Window', description: 'Maize silks remain receptive for 5–8 days. Water stress during silking delays silk emergence relative to tasseling, causing missed pollination and blank cobs. Irrigate every 3–4 days strictly during this window.', urgency: 'high' },
            { icon: '🚫', title: 'Insecticide-Free Window', description: 'Do NOT apply any insecticide during peak silking (especially during 6 AM–10 AM when pollen sheds). Insecticides kill natural pollinators and reduce pollination efficiency. Scout for pests in the evening only.', urgency: 'high' },
        ],
        'Squaring': [
            { icon: '🔍', title: 'Square Retention Monitoring', description: 'Cotton squares (flower buds) begin forming 35–45 DAS. Monitor square retention rate — normal is 70–80%. If squares are dropping excessively, investigate mite damage (stippling on leaves), moisture stress, or Thrips infestation.', urgency: 'high' },
            { icon: '🧪', title: 'Potassium & Micronutrient Boost', description: 'Apply Potassium Sulphate @ 25 kg/acre as foliar (2 kg/100L water) to improve square retention and boll set. Also spray Zinc Sulphate 0.5% + Boric Acid 0.1% to enhance pollen viability and fertilization.', urgency: 'medium' },
        ],
        'Boll Formation': [
            { icon: '🧪', title: 'Boll Retention Nutrient Support', description: 'Apply Magnesium Sulphate (Epsom Salt) @ 2kg/100L as foliar spray to prevent boll shedding. Potassium is critical for boll development — apply K₂SO₄ 50 kg/acre as soil application if not done earlier.', urgency: 'high' },
            { icon: '🐛', title: 'Pink Bollworm & Spotted Bollworm Alert', description: 'Install pheromone traps for Pink Bollworm. Spray Spinosad 45 SC @ 75 ml/acre or Indoxacarb 14.5 SC @ 200 ml/acre if boll damage exceeds 5%. Check bolls for pinhole entry points weekly.', urgency: 'high' },
            { icon: '💧', title: 'Irrigation for Boll Filling', description: 'Maintain soil moisture during boll filling period. Water stress at this stage directly reduces boll weight and lint quality. Irrigate every 7–10 days. Reduce irrigation 3 weeks before expected boll opening.', urgency: 'medium' },
        ],
        'Boll Opening': [
            { icon: '☀️', title: 'Harvest Readiness Assessment', description: 'Bolls are ready to pick when 60–70% have opened. Evaluate lint quality — mature lint should be fluffy and white. Avoid harvest when dew is heavy (early morning) to prevent lint discoloration. Aim for 2–3 picking cycles.', urgency: 'high' },
            { icon: '🔍', title: 'Staining & Quality Monitoring', description: 'Watch for staining caused by pink bollworm exit damage or fungal infection in open bolls during wet weather. Delay picking by 1–2 days after heavy rain. Stained lint commands lower market price.', urgency: 'medium' },
        ],
        'Picking': [
            { icon: '✂️', title: 'Cotton Picking Best Practices', description: 'Pick only fully opened, dry bolls. Avoid picking partially open or wet bolls — they reduce market grade. Use clean picking bags (no jute sacks that contaminate with jute fibres). Grade and sort lint before sale.', urgency: 'high' },
            { icon: '📦', title: 'Post-Harvest Stalk Management', description: 'After final picking, uproot and destroy cotton stalks within 2 weeks. This breaks the Pink Bollworm life cycle and reduces inoculum for next season. Do NOT burn — shred and incorporate for organic matter.', urgency: 'medium' },
        ],
        'Panicle Initiation': [
            { icon: '💧', title: 'Critical Water Window (PI Stage)', description: 'Panicle Initiation is the most water-sensitive stage in rice. Maintain a standing water depth of 5 cm throughout this stage. Insufficient water at PI causes panicle sterility and dramatically reduces grain count per panicle.', urgency: 'high' },
            { icon: '🧪', title: 'Panicle Initiation Fertilizer Dose', description: 'Apply the 3rd dose of nitrogen (Urea @ 20–25 kg/acre) at PI stage to increase the number of grains per panicle. Combine with Potassium Chloride @ 25 kg/acre if not applied earlier. This is the yield-determining stage.', urgency: 'high' },
            { icon: '🔍', title: 'Blast Management at PI', description: 'Blast (Pyricularia oryzae) is most damaging at PI — it causes "neck rot" and empty panicles. Apply Tricyclazole 75 WP @ 300g/acre or Isoprothiolane 40 EC @ 400 ml/acre preventatively at PI initiation.', urgency: 'high' },
        ],
        'Rosette': [
            { icon: '🌿', title: 'Rosette Stage Management (Mustard)', description: 'Mustard is in vegetative rosette stage (20–35 DAS). Apply 2nd dose of Nitrogen (Urea @ 20 kg/acre) at rosette. Ensure soil moisture is adequate for absorption. Thin plants to 10–15 cm spacing if sown by broadcast method.', urgency: 'medium' },
            { icon: '🔍', title: 'Aphid Early Detection', description: 'Rosette stage is when aphid colonies begin establishing on tender growth points. Scout weekly. If >25 aphids/plant on 10% of plants, apply Imidacloprid 17.8 SL @ 60 ml/acre. Natural predators (ladybird beetles) provide 50–60% control naturally.', urgency: 'medium' },
        ],
        'Grand Growth': [
            { icon: '🧪', title: 'Sugarcane Grand Growth Nutrition', description: 'Grand Growth phase (4–8 months) is when 70% of sugarcane biomass is accumulated. Apply 3rd and 4th N splits (Urea @ 50 kg/acre each) during this phase. Adequate K during grand growth improves stalk girth and sucrose accumulation.', urgency: 'high' },
            { icon: '🐛', title: 'Top Borer Monitoring', description: 'Top Borer (Scirpophaga excerptalis) causes "dead heart" in young shoots and "dead top" in mature stalks. Apply Chlorpyriphos 20 EC @ 400 ml in the crop whorl or use Trichogramma egg parasitoid cards (50,000 eggs/acre/week).', urgency: 'high' },
            { icon: '💧', title: 'Irrigation Scheduling', description: 'Irrigate every 7–10 days during grand growth. Sugarcane requires 150–200 cm of total water during the crop season. Wrapping leaves indicate stress — irrigate within 48 hours. Earthing-up at this stage supports stalk anchorage and prevents lodging.', urgency: 'medium' },
        ],
        'Ripening': [
            { icon: '🚫', title: 'Stop Nitrogen, Reduce Irrigation', description: 'Do NOT apply any nitrogen fertilizer during ripening — it delays sucrose accumulation and harvest maturity. Reduce irrigation to once every 20–25 days. Dry conditions during ripening increase sucrose content and improve CCS (Commercial Cane Sugar) percentage.', urgency: 'high' },
            { icon: '🔍', title: 'Harvest Maturity Assessment', description: 'Test stalk juice Brix (>18°) and check Purity Coefficient (>85%) to confirm harvest readiness. The top-most internode should begin to contract. Harvest within 15 days of reaching ripening peak to prevent juice quality deterioration.', urgency: 'high' },
        ],
        'Grain Filling': [
            { icon: '💧', title: 'Critical Irrigation at Grain Filling', description: 'Grain filling requires consistent soil moisture. Water stress during this stage reduces grain weight (test weight) by 10–25%. For cereals, maintain 60–70% soil moisture. Do NOT waterlog — anaerobic soil conditions damage roots at this stage.', urgency: 'high' },
            { icon: '🧪', title: 'Potassium & Sulphur for Grain Quality', description: 'Apply K₂SO₄ @ 25 kg/acre as foliar (2 kg/100L water) to improve grain plumpness and protein content. In sulphur-deficient soils, apply Elemental Sulphur @ 10 kg/acre to improve amino acid composition in grain.', urgency: 'medium' },
            { icon: '🔍', title: 'Monitor for Ear Head Insects', description: 'Scout ear-heads for grain borers, aphids (on ears), and head smut. Apply Malathion 50 EC @ 300 ml/acre if insects exceed threshold. For smut, no spray works — roug-out affected tillers and plan resistant variety for next season.', urgency: 'medium' },
        ],
        'Pod Filling': [
            { icon: '💧', title: 'Adequate Moisture for Pod Filling', description: 'Pod filling is highly sensitive to water deficit. Water stress during this stage directly reduces seed size and number of seeds per pod. Irrigate every 8–10 days. Moisture finger-test at 4–6 inch depth — soil should feel moist.', urgency: 'high' },
            { icon: '🔍', title: 'Pod Borer Scouting', description: 'Scout for Pod Borer (Helicoverpa) and Blue Butterfly larvae — small green caterpillars inside pods. Apply Chlorantraniliprole 18.5 SC @ 30 ml/acre or Indoxacarb 14.5 SC @ 200 ml/acre if 2–3 larvae/m row observed.', urgency: 'high' },
            { icon: '🧪', title: 'Foliar Micronutrient Spray', description: 'Spray 0.5% Zinc Sulphate + 0.1% Boric Acid during pod filling to improve seed weight, oil content (in oilseeds), and protein content (in pulses). This single spray can improve yield by 8–12%.', urgency: 'low' },
        ],
        'Pod Development': [
            { icon: '💧', title: 'Pod Development Irrigation', description: 'Critical water management at pod development. Groundnut pegs must penetrate the soil to form pods — waterlogging blocks this. Maintain 50–60% field capacity. Excess water causes pod rot; deficit causes unfilled pods.', urgency: 'high' },
            { icon: '🧪', title: 'Calcium Application (Groundnut Specific)', description: 'Apply Gypsum @ 250–300 kg/acre as top dressing to the pod zone during pod development. This is critical for shelling percentage and prevents empty pods (unfilled pods caused by Ca-deficiency in the soil around pegs).', urgency: 'high' },
        ],
        'Pod Formation': [
            { icon: '🌿', title: 'Pod Formation Stage Management', description: 'At pod formation (45–60 DAS), apply 2nd irrigation if not done. Maintain soil moisture to support pod set. Apply Sulphur @ 10 kg/acre if not done at sowing — sulphur is critical for oil quality in mustard.', urgency: 'high' },
            { icon: '🔍', title: 'Aphid & Painted Bug Control', description: 'Aphid colonies can explode at pod formation in mustard. Threshold: >25 aphids/plant. Apply Dimethoate 30 EC @ 200 ml/acre immediately upon crossing threshold. For Painted Bug (Bagrada), apply Malathion 50 EC @ 300 ml/acre.', urgency: 'high' },
        ],
        'Maturity': [
            { icon: '✂️', title: 'Maturity Indicators', description: 'Crop maturity: leaves turn yellow and shed, stems dry/change colour, seed hard and difficult to dent, grain moisture 14–18% depending on crop. Over-delaying harvest — especially after rain — increases shattering, mould risk, and post-harvest losses.', urgency: 'high' },
            { icon: '🚫', title: 'Withdraw All Inputs', description: 'Do NOT apply any irrigation, fertilizer, or pesticide at maturity stage. Final irrigations and nutrient applications should have ceased 2–3 weeks earlier. Plan harvest logistics: machinery booking, labour, transportation, drying yard.', urgency: 'medium' },
            { icon: '📦', title: 'Pre-Harvest Loss Prevention', description: 'Inspect fields for lodging (fallen crop), bird damage, and vertebrate pest damage. Timely harvest within the 7–14 day maturity window is critical to minimise field losses. Test moisture content with a moisture meter before mechanical harvest.', urgency: 'medium' },
        ],
        'Bulb Formation': [
            { icon: '🧪', title: 'Potassium for Bulb Development', description: 'Bulb formation in onion is driven by K availability. Apply Potassium Sulphate (SOP) @ 25 kg/acre as topdressing or 2 kg/100L as foliar spray. Adequate K improves bulb size, pungency, and shelf life. Avoid high N at this stage — it delays maturity.', urgency: 'high' },
            { icon: '🚫', title: 'Reduce Irrigation for Drying', description: 'Gradually reduce irrigation as 50% of necks start to fall over. Reduce to once every 10–12 days during bulbing. Waterlogging at bulbing causes basal rot (Fusarium) and purple blotch. Avoid overhead irrigation after neck-fall.', urgency: 'high' },
            { icon: '🔍', title: 'Thrips Management', description: 'Thrips (Thrips tabaci) cause silvery streaks on leaves and reduce bulb size by 20–40% if uncontrolled. Action threshold: 5 thrips/leaf. Apply Spinosad 45 SC @ 75 ml/acre or Fipronil 5 SC @ 400 ml/acre. Rotate insecticide classes each spray.', urgency: 'medium' },
        ],
        'Pegging': [
            { icon: '🌱', title: 'Pegging (Pod Initiation) Critical Stage', description: 'Groundnut pegs grow downward from the plant to penetrate the soil and form pods. Soil must be loose, moist, and free of surface crust for peg penetration. Break any soil crust by light harrowing. Mulching with crop residue helps.', urgency: 'high' },
            { icon: '🧪', title: 'Gypsum Application at Pegging', description: 'Apply Gypsum (Calcium Sulphate) @ 250 kg/acre distributed in the pod zone ONLY (not broadcast) at pegging initiation. Calcium directly feeds developing pods and prevents empty pods. This is the single most yield-responsive input in groundnut.', urgency: 'high' },
            { icon: '💧', title: 'Irrigation at Pegging', description: 'Soil moisture at pegging must be optimal — neither waterlogged nor dry. Use light sprinkler irrigation to moisten the top 10–15 cm. Do NOT use flood irrigation which compacts the soil surface and blocks peg entry.', urgency: 'high' },
        ],
        'Knee-High': [
            { icon: '🧪', title: 'Nitrogen Top Dressing at Knee-High', description: 'Apply 2nd N dose (Urea @ 30 kg/acre) when Maize reaches the knee-high stage (6-leaf stage, 25–30 DAS). This is the most important N application timing for Maize — it feeds tasseling and silking. Band application or fertigation preferred.', urgency: 'high' },
            { icon: '🌿', title: 'Post-Emergence Weed Control', description: 'Apply post-emergence herbicide Atrazine 50 WP @ 500g/acre or Topramezone @ 60 ml/acre for broadleaf and grass weeds by 4-leaf stage. Beyond this, manual weeding or hand hoe is the only option without crop damage.', urgency: 'medium' },
            { icon: '🔍', title: 'Fall Armyworm Early Detection', description: 'Inspect youngest (innermost) leaves daily for tiny Fall Armyworm eggs or first-instar larvae. Early detection is the key — once a large caterpillar is inside the whorl or ear, it is very difficult to control. Apply Emamectin Benzoate 5 SG @ 100 g/acre at first sighting.', urgency: 'high' },
        ],
    };

    const actions = stageActions[stage] || stageActions['Vegetative'];

    let issueAdvice = '';
    if (issue.trim()) {
        const lowerIssue = issue.toLowerCase();
        if (lowerIssue.includes('yellow') || lowerIssue.includes('pale')) {
            issueAdvice = `Yellow/Pale Leaves on ${crop}: (1) Nitrogen deficiency — most common cause; apply Urea foliar spray @2% immediately. (2) Iron chlorosis (interveinal yellowing on young leaves) — apply FeSO₄ @0.5% foliar spray. (3) Root health issue — check for Root Rot by pulling up plants and examining roots. Brown/mushy roots indicate fungal infection; apply Carbendazim 0.1% soil drench around the base.`;
        } else if (lowerIssue.includes('wilt') || lowerIssue.includes('droop')) {
            issueAdvice = `Wilting in ${crop}: (1) Check soil moisture first — if dry, irrigate immediately. (2) If wilting persists after irrigation, roots may be infected with Fusarium Wilt. Apply Trichoderma viride (5 g/L) as soil drench + Propiconazole 0.1% foliar spray. (3) Nematode damage — if roots show galls/knots, apply Carbofuran 3G @25 kg/ha and incorporate organic matter.`;
        } else if (lowerIssue.includes('spot') || lowerIssue.includes('lesion') || lowerIssue.includes('blight')) {
            issueAdvice = `Leaf Spots/Blight on ${crop}: Identify pattern: (1) Brown spots with yellow halo = Bacterial Leaf Spot → apply Copper Hydroxide 53.8% WG @2g/L. (2) Concentric 'bullseye' rings = Early Blight (Alternaria) → apply Mancozeb 75% WP @2.5g/L. (3) Water-soaked spots turning black = Late Blight → apply Metalaxyl+Mancozeb 72% WP @2.5g/L. Repeat spray every 7-10 days.`;
        } else if (lowerIssue.includes('insect') || lowerIssue.includes('pest') || lowerIssue.includes('bug') || lowerIssue.includes('aphid')) {
            issueAdvice = `Pest Management on ${crop}: For sucking pests (aphids, whiteflies, thrips) — apply Imidacloprid 17.8 SL @60 ml/acre. For chewing pests (borers, armyworms) — apply Chlorpyriphos 20 EC @400 ml/acre or Spinosad 45 SC @75 ml/acre. Spray in evenings to protect natural enemies during the day. Use pheromone traps for monitoring.`;
        } else if (lowerIssue.includes('slow') || lowerIssue.includes('stunted')) {
            issueAdvice = `Slow/Stunted Growth on ${crop}: (1) Soil test for nutrient deficiencies — apply micronutrient mixture foliar spray as immediate fix. (2) Check soil pH — ${crop} grows best at pH ${['Rice', 'Potato'].includes(crop) ? '5.5-6.5' : '6.0-7.5'}; apply lime if acidic. (3) Root-knot nematodes (galls on roots) — apply Trichoderma harzianum 2 kg/acre as soil treatment. (4) Soil compaction — perform deep ploughing (subsoiler) and add organic matter in next cycle.`;
        } else {
            issueAdvice = `Regarding "${issue}": This symptom may indicate nutrient imbalance, early pest/disease, or environmental stress. Recommended: (1) Collect 5-10 affected plant samples and send to local plant clinic or use the Plant Doctor AI scanner. (2) Apply broad-spectrum foliar nutrition (Multiplex/Rustler @2 ml/L) as immediate response. (3) Ensure no irrigation or spray schedule disruption. (4) Consult your nearest KVK (Krishi Vigyan Kendra) for laboratory confirmation before applying any pesticide.`;
        }
    }

    return {
        summary: `AI Advisory for ${crop} (${profile.npk}) on ${soilType} at ${stage} stage. ${issueAdvice ? 'Specific issue identified — see Pest & Disease section.' : 'No critical issues detected. Follow stage-wise management below for maximum yield.'}`,
        actions,
        fertilizer: `${crop} on ${soilType} — Required NPK: ${profile.npk}. ${soilType === 'Sandy Soil' ? 'Apply in 4-5 split doses to prevent nutrient leaching. Prefer coated/slow-release urea.' : soilType === 'Black Soil' ? 'Apply in 3 splits (basal + 2 top dressings). Black soil retains N well but fixes P — use SSP (Single Super Phosphate) instead of DAP for better P availability.' : soilType === 'Clay Loam' ? 'Apply in 3 splits. Clay soil fixes P heavily — apply 15% extra P. Avoid waterlogging which causes denitrification (N loss).' : 'Apply in 3 equal splits: basal + 2 top dressings.'} Current stage (${stage}): ${stage === 'Sowing' || stage === 'Planting' ? 'Apply full basal dose now: DAP + MOP + Micronutrient mixture.' : stage.includes('Tiller') || stage.includes('Vegetative') || stage.includes('CRI') ? 'Apply 2nd N top-dressing (Urea). Soil should be moist.' : stage === 'Flowering' ? 'Foliar spray 0-52-34 (MAP) water soluble fertilizer @5g/L to support fruit set.' : stage.includes('Harvest') ? 'No fertilizer needed. Focus on harvest quality and storage.' : 'Continue scheduled fertilization. Monitor crop colour as deficiency indicator.'}`,
        irrigation: `${stage} irrigation for ${crop}: ${stage === 'Sowing' || stage === 'Planting' ? 'Apply pre-sowing Palewa irrigation 4-5 days before sowing for good seed-soil contact. Avoid excess water which causes seed rot.' : stage === 'CRI' ? 'CRI irrigation (21-25 DAS) is CRITICAL. Apply exactly 4-5 cm water. Do not flood the field.' : stage.includes('Tiller') ? 'Maintain soil moisture. Irrigate every 10-12 days. Avoid waterlogging which causes root hypoxia and yellowing.' : stage === 'Flowering' || stage === 'Fruiting' ? 'MOST critical stage for water. Irrigate every 4-6 days. Never let crop wilt. Use soil finger-test: if soil sticks to finger at 4-6 inch depth, delay irrigation.' : stage.includes('Harvest') ? 'STOP all irrigation 10-15 days before harvest. Dry soil improves harvesting efficiency and reduces post-harvest spoilage.' : 'Maintain 60-70% field capacity. Monitor via finger-touch test at 4-6 inch soil depth.'}`,
        pestAlert: (profile.commonPests.includes('Yellow Rust') ? 'WHEAT RUST WATCH: Yellow Rust (Puccinia striiformis) — yellow stripes on leaves. Apply Propiconazole 25 EC @200 ml/acre at first sign. Check weekly.' : profile.commonPests.includes('Brown Plant Hopper') ? 'RICE BPH ALERT: Brown Plant Hopper circular patches ("hopper burn"). Apply Buprofezin 25 SC @400 ml/acre. For Blast disease (water-soaked diamond-shaped lesions): apply Tricyclazole 75 WP @300 g/acre.' : profile.commonPests.includes('Pink Bollworm') ? 'COTTON: Install pheromone traps @5/acre for Pink Bollworm. For Whitefly (Leaf Curl vector): apply Spiromesifen 22.9 SC @200 ml/acre. Avoid Imidacloprid for whitefly — resistance is widespread.' : `Monitor weekly for ${profile.commonPests.join(', ')}. Use ETL (Economic Threshold Level) approach — only spray when pest count exceeds action threshold. This saves costs and protects natural predators.`) + (issueAdvice ? `\n\nSpecific Issue Analysis:\n${issueAdvice}` : ''),
        weatherTip: `Season Advisory for ${crop}: ${['Wheat', 'Mustard', 'Gram', 'Barley'].includes(crop) ? 'Rabi crops are sensitive to temperature spikes above 35°C during grain-filling (Feb-Mar). Install sprinklers for evaporative cooling if heatwave forecast. Late frost can damage flowering stage — cover nurseries with polythene.' : ['Rice', 'Cotton', 'Soybean', 'Maize', 'Sugarcane'].includes(crop) ? 'Kharif crops face risk from heavy rains and waterlogging. Ensure drainage channels are clear before monsoon. Take preventive fungicide action 2-3 days before prolonged wet spell forecast.' : 'Monitor weather forecasts regularly via IMD (mausam.imd.gov.in) and Agromet Advisory. Adjust irrigation/spray schedules based on 5-day forecast. March 2026: Temperatures rising — monitor for aphid population build-up.'}`,
        soilTip: SOIL_TIPS[soilType] || SOIL_TIPS['Loamy Soil'],
    };
}
