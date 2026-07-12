// Knowledge base module - client-safe (no Node.js fs/path dependencies)

export type SupportedLanguageCode = 'en-IN' | 'hi-IN' | 'bn-IN' | 'kn-IN' | 'ml-IN' | 'ta-IN' | 'te-IN';

interface KnowledgeDoc {
    id: string;
    title: string;
    keywords: string[];
    intents: string[];
    content: Partial<Record<SupportedLanguageCode, string>>;
}

interface ScoredDoc {
    doc: KnowledgeDoc;
    score: number;
    matchedKeywords: string[];
}

type KnowledgeSource = 'local-files' | 'built-in';

let knowledgeCache: { docs: KnowledgeDoc[]; source: KnowledgeSource } | null = null;

const KNOWLEDGE_BASE: KnowledgeDoc[] = [
    {
        id: 'market_profit_margin',
        title: 'Crop Profit & Margin Guidance',
        intents: ['market'],
        keywords: [
            'margin',
            'profit',
            'profitability',
            'best margin',
            'high profit',
            'roi',
            'return',
            'returns',
            'income',
            'net profit',
            'gross margin',
            'लाभ',
            'मुनाफा',
            'मार्जिन',
            'profit crop',
            'high margin crop',
        ],
        content: {
            'en-IN': '📈 “Best margin crop” depends on your location, season, water availability, soil, and market access. In general, margins are higher when: (1) you grow what has strong local demand, (2) you control input costs (seed/fertilizer/pesticide), (3) you reduce post-harvest losses, and (4) you have a buyer/mandi link. Tell me your district/state, irrigation (yes/no), land size, and season (Kharif/Rabi) and I will shortlist 3 suitable high-margin options and a cost+price plan.',
            'hi-IN': '📈 “सबसे अच्छा मार्जिन किस फसल में है” यह आपके स्थान, मौसम, पानी, मिट्टी और बाजार पर निर्भर करता है। सामान्य तौर पर मार्जिन तब अच्छा होता है जब: (1) लोकल मांग मजबूत हो, (2) इनपुट लागत (बीज/खाद/दवा) नियंत्रण में हो, (3) कटाई बाद नुकसान कम हो, (4) खरीदार/मंडी लिंक हो। आप अपना जिला/राज्य, सिंचाई है या नहीं, जमीन (एकड़) और सीज़न (खरीफ/रबी) बताएं — मैं 3 उपयुक्त हाई-मार्जिन विकल्प और लागत+भाव प्लान दूंगा।',
            'ta-IN': '📈 “சிறந்த மார்ஜின் எந்த பயிருக்கு?” என்பது இடம், பருவம், நீர் வசதி, மண் மற்றும் சந்தை அணுகலின் மீது சார்ந்தது. பொதுவாக மார்ஜின் அதிகமாக இருப்பது: (1) உள்ளூர் தேவை வலுவாக இருக்கும் போது, (2) உள்ளீட்டு செலவுகள் கட்டுப்பாட்டில் இருக்கும் போது, (3) அறுவடை பிந்தைய இழப்புகள் குறைவாக இருக்கும் போது, (4) விற்பனை சேனல்/மண்டி இணைப்பு இருக்கும் போது. உங்கள் மாவட்டம்/மாநிலம், பாசனம் (ஆம்/இல்லை), நில அளவு, பருவம் (காரிஃப்/ரபி) கூறுங்கள் — 3 உயர் மார்ஜின் தேர்வுகளையும் செலவு+விலை திட்டத்தையும் தருகிறேன்.',
            'te-IN': '📈 “ఉత్తమ మార్జిన్ ఉన్న పంట ఏది?” అనేది మీ ప్రాంతం, సీజన్, నీటి లభ్యత, నేల, మార్కెట్ యాక్సెస్‌పై ఆధారపడి ఉంటుంది. సాధారణంగా మార్జిన్ ఎక్కువగా ఉండేది: (1) లోకల్ డిమాండ్ బలంగా ఉన్నప్పుడు, (2) ఇన్‌పుట్ ఖర్చులు నియంత్రణలో ఉన్నప్పుడు, (3) కోత తర్వాత నష్టాలు తక్కువగా ఉన్నప్పుడు, (4) అమ్మకానికి ఛానల్/మండీ లింక్ ఉన్నప్పుడు. మీ జిల్లా/రాష్ట్రం, నీటిపారుదల (అవును/కాదు), భూమి (ఎకరాలు), సీజన్ (ఖరీఫ్/రబీ) చెబితే — 3 హై-మార్జిన్ ఎంపికలు + ఖర్చు+ధర ప్లాన్ ఇస్తాను.',
        },
    },
    {
        id: 'pest_rice_stem_borer',
        title: 'Rice Stem Borer Management',
        intents: ['pest'],
        keywords: [
            'stem borer',
            'yellow stem borer',
            'paddy stem borer',
            'rice stem borer',
            'dead heart',
            'white ear',
            'scirpophaga',
            'paddy',
            'rice',
            'धान तना छेदक',
            'तना छेदक',
            'deadheart',
            'white ear head',
        ],
        content: {
            'en-IN': '🐛 Rice stem borer (dead hearts/white ear): Remove and destroy infested tillers, keep water level shallow (2–3 cm) at early stage, and avoid excess nitrogen. If ETL is crossed (dead hearts >5% or 1 egg mass/m²), use Chlorantraniliprole 0.4G @ 4 kg/acre (broadcast in standing water) or Chlorantraniliprole 18.5 SC @ 60 ml/acre (spray with 200 L water/acre). Keep pheromone traps (5/acre) and do evening spray.',
            'hi-IN': '🐛 धान तना छेदक (डेड हार्ट/व्हाइट ईयर): संक्रमित टिलर निकालकर नष्ट करें, शुरुआती अवस्था में 2–3 सेमी पानी रखें और ज्यादा नाइट्रोजन न दें। ETL (डेड हार्ट >5% या 1 अंडे का गुच्छा/मी²) पर क्लोरैन्ट्रानिलिप्रोल 0.4G @ 4 किग्रा/एकड़ (खड़े पानी में बिखेरें) या क्लोरैन्ट्रानिलिप्रोल 18.5 SC @ 60 मिली/एकड़ (200 ली/एकड़ पानी में स्प्रे) करें। 5 फेरोमोन ट्रैप/एकड़ लगाएं और शाम को स्प्रे करें।',
            'ta-IN': '🐛 நெல் தண்டு துளைப்பான் (டெட் ஹார்ட்/வெள்ளை கதிர்): பாதிக்கப்பட்ட தண்டுகளை அகற்றி அழிக்கவும், ஆரம்ப கட்டத்தில் 2–3 செ.மீ நீர் மட்டம் வைத்துக் கொள்ளவும், அதிக நைட்ரஜன் தவிர்க்கவும். ETL (டெட் ஹார்ட் >5% அல்லது 1 முட்டை கூட்டம்/மீ²) மீறினால் Chlorantraniliprole 0.4G @ 4 கிலோ/ஏக்கர் (நீரில் பரப்பவும்) அல்லது Chlorantraniliprole 18.5 SC @ 60 மில்லி/ஏக்கர் (200 லிட்டர்/ஏக்கர் நீரில் தெளிக்கவும்). பெரோமோன் வலை 5/ஏக்கர் வைத்து மாலை நேரத்தில் தெளிக்கவும்.',
            'te-IN': '🐛 వరి కాండం తొలిచే పురుగు (డెడ్ హార్ట్/వైట్ ఇయర్): ప్రభావిత టిల్లర్లను తీసి నాశనం చేయండి, ప్రారంభ దశలో 2–3 సెం.మీ నీటి మట్టం ఉంచండి, అధిక నైట్రోజన్ నివారించండి. ETL (డెడ్ హార్ట్ >5% లేదా 1 ఎగ్‌మాస్/మీ²) దాటితే Chlorantraniliprole 0.4G @ 4 కిలో/ఎకరం (నిల్వ నీటిలో చల్లండి) లేదా Chlorantraniliprole 18.5 SC @ 60 మి.లీ/ఎకరం (200 లీ/ఎకరం నీటితో స్ప్రే) చేయండి. 5 ఫెరోమోన్ ట్రాప్స్/ఎకరం పెట్టి సాయంత్రం స్ప్రే చేయండి.',
        },
    },
    {
        id: 'fert_rice',
        title: 'Rice Fertilizer Schedule',
        intents: ['fertilizer'],
        keywords: ['fertilizer', 'rice', 'paddy', 'urea', 'dap', 'धान', 'खाद', 'நெல்', 'వరి', 'chawal', 'ধান'],
        content: {
            'en-IN': '🌾 Rice nutrient plan: Basal 50 kg DAP/acre, first top-dress 25 kg Urea at 20-25 DAS, second top-dress 25 kg Urea at panicle initiation. Add Zinc Sulphate 10 kg/acre where leaves show pale striping.',
            'hi-IN': '🌾 धान पोषण योजना: बेसल में 50 किग्रा DAP/एकड़, 20-25 दिन पर 25 किग्रा यूरिया, बाली निकलने पर 25 किग्रा यूरिया। जिंक कमी पर 10 किग्रा/एकड़ जिंक सल्फेट दें।',
            'ta-IN': '🌾 நெல் உர திட்டம்: அடிப்படை 50 கிலோ DAP/ஏக்கர், 20-25 நாட்களில் 25 கிலோ யூரியா, கதிர் தொடக்கத்தில் 25 கிலோ யூரியா. சிங்க் குறைபாடு இருந்தால் 10 கிலோ/ஏக்கர் ஜிங்க் சல்பேட் சேர்க்கவும்.',
            'te-IN': '🌾 వరి ఎరువు ప్రణాళిక: బేసల్‌గా 50 కిలో DAP/ఎకరం, 20-25 రోజులకు 25 కిలో యూరియా, పానికిల్ దశలో 25 కిలో యూరియా. జింక్ లోపం ఉంటే 10 కిలో జింక్ సల్ఫేట్ ఇవ్వండి.',
            'bn-IN': '🌾 ধানের সার পরিকল্পনা: ভিত্তি 50 কেজি DAP/একর, 20-25 দিনে 25 কেজি ইউরিয়া, প্যানিকল শুরুতে 25 কেজি ইউরিয়া। দস্তার অভাবে 10 কেজি জিংক সালফেট দিন।',
        },
    },
    {
        id: 'fert_wheat',
        title: 'Wheat Nutrient Management',
        intents: ['fertilizer'],
        keywords: ['fertilizer', 'wheat', 'gehu', 'npk', 'गेहूं', 'கோதுமை', 'గోధుమ', 'গম'],
        content: {
            'en-IN': '🌾 Wheat fertilizer guide: Basal 50 kg DAP + 20 kg MOP per acre. Top-dress 30 kg Urea at CRI (21-25 DAS) and again 30 kg Urea at 45-50 DAS. Apply only on moist soil.',
            'hi-IN': '🌾 गेहूं उर्वरक: बेसल में 50 किग्रा DAP + 20 किग्रा MOP/एकड़। CRI (21-25 दिन) पर 30 किग्रा यूरिया और 45-50 दिन पर 30 किग्रा यूरिया। यूरिया हमेशा नमी वाली मिट्टी में दें।',
            'ta-IN': '🌾 கோதுமை உரம்: அடிப்படையாக 50 கிலோ DAP + 20 கிலோ MOP/ஏக்கர். CRI கட்டத்தில் 30 கிலோ யூரியா, 45-50 நாட்களில் மீண்டும் 30 கிலோ யூரியா. ஈரமான மண்ணில் மட்டும் இடவும்.',
            'te-IN': '🌾 గోధుమ ఎరువులు: బేసల్‌గా 50 కిలో DAP + 20 కిలో MOP/ఎకరం. CRI దశలో 30 కిలో యూరియా, 45-50 రోజులకు మరో 30 కిలో యూరియా. తడిగా ఉన్న నేలలోనే వేయాలి.',
            'bn-IN': '🌾 গম সারের গাইড: ভিত্তি 50 কেজি DAP + 20 কেজি MOP/একর। CRI পর্যায়ে 30 কেজি ইউরিয়া, 45-50 দিনে আবার 30 কেজি। ভেজা মাটিতেই দিন।',
        },
    },
    {
        id: 'fert_cotton',
        title: 'Cotton Fertilizer Schedule',
        intents: ['fertilizer'],
        keywords: ['fertilizer', 'cotton', 'kapas', 'कपास', 'பருத்தி', 'పత్తి', 'তুলা'],
        content: {
            'en-IN': '🌾 Cotton nutrient plan: Basal 50 kg DAP + 25 kg MOP/acre. 1st top-dress 30 kg Urea at squaring (35-40 DAS), 2nd dose 30 kg Urea at flowering. Apply Mg spray (2 kg MgSO4/100L) at boll formation to prevent shedding.',
            'hi-IN': '🌾 कपास पोषण: बेसल में 50 किग्रा DAP + 25 किग्रा MOP/एकड़। स्क्वेयरिंग (35-40 दिन) पर 30 किग्रा यूरिया, फूल पर 30 किग्रा यूरिया। बॉल बनने पर MgSO4 2 किग्रा/100 ली स्प्रे करें।',
            'ta-IN': '🌾 பருத்தி உரம்: அடிப்படை 50 கிலோ DAP + 25 கிலோ MOP/ஏக்கர். ஸ்கேரிங் கட்டத்தில் 30 கிலோ யூரியா, பூக்கும் நிலையில் 30 கிலோ யூரியா. காய்ப்பு கட்டத்தில் MgSO4 2 கிலோ/100 லி தெளிக்கவும்.',
            'te-IN': '🌾 పత్తి ఎరువులు: బేసల్ 50 కిలో DAP + 25 కిలో MOP/ఎకరం. స్క్వేరింగ్‌లో 30 కిలో యూరియా, పూత దశలో 30 కిలో యూరియా. బోల్ దశలో MgSO4 2 కిలో/100 లీ స్ప్రే చేయండి.',
        },
    },
    {
        id: 'fert_soybean',
        title: 'Soybean Fertilizer Guide',
        intents: ['fertilizer'],
        keywords: ['fertilizer', 'soybean', 'soya', 'सोयाबीन', 'சோயா', 'సోయాబీన్'],
        content: {
            'en-IN': '🌾 Soybean: Being a legume, N requirement is low. Apply Basal 80 kg DAP + 30 kg MOP/acre. Rhizobium seed inoculation is critical. Apply Sulphur 10 kg/acre for better root nodulation and oil content.',
            'hi-IN': '🌾 सोयाबीन: दलहन होने से N कम चाहिए। बेसल में 80 किग्रा DAP + 30 किग्रा MOP/एकड़। राइजोबियम बीजोपचार ज़रूरी। बेहतर नॉड्यूलेशन और तेल के लिए 10 किग्रा/एकड़ सल्फर दें।',
            'ta-IN': '🌾 சோயாபீன்: பயறு வகை என்பதால் N தேவை குறைவு. அடிப்படை 80 கிலோ DAP + 30 கிலோ MOP/ஏக்கர். ரைசோபியம் விதை நேர்த்தி அவசியம். சல்ஃபர் 10 கிலோ/ஏக்கர் சேர்க்கவும்.',
            'te-IN': '🌾 సోయాబీన్: పప్పుధాన్యం కాబట్టి N తక్కువ. బేసల్ 80 కిలో DAP + 30 కిలో MOP/ఎకరం. రైజోబియం బీజోపచారం తప్పనిసరి. సల్ఫర్ 10 కిలో/ఎకరం వేయండి.',
        },
    },
    {
        id: 'pest_management',
        title: 'Integrated Pest Management',
        intents: ['pest'],
        keywords: ['pest', 'insect', 'aphid', 'borer', 'whitefly', 'कीट', 'பூச்சி', 'పురుగు', 'spray', 'thrips', 'armyworm', 'bollworm', 'मक्खी', 'rog', 'रोग', 'நோய்', 'వ్యాధి'],
        content: {
            'en-IN': '🐛 IPM checklist: scout weekly, use yellow/pheromone traps, spray only above threshold. For sucking pests use Imidacloprid 17.8 SL @60ml/acre; for borers use Chlorantraniliprole 18.5 SC @30ml/acre or Spinosad 45 SC @75ml/acre. Spray in evening and rotate chemistry every spray.',
            'hi-IN': '🐛 एकीकृत कीट प्रबंधन: साप्ताहिक निगरानी करें, पीले/फेरोमोन ट्रैप लगाएं, ETL पार होने पर ही स्प्रे करें। चूसक कीट पर इमिडाक्लोप्रिड 17.8 SL @60मिली/एकड़, बोरर पर क्लोरान्ट्रानिलिप्रोल 18.5 SC @30मिली/एकड़ या स्पिनोसैड 45 SC @75मिली/एकड़।',
            'ta-IN': '🐛 ஒருங்கிணைந்த பூச்சி கட்டுப்பாடு: வாரம் ஒருமுறை கண்காணிக்கவும், மஞ்சள்/பெரோமோன் வலைகள் பயன்படுத்தவும், ETL மீறினால் மட்டுமே தெளிக்கவும். சப்பும் பூச்சிக்கு இமிடாக்லோப்ரிட் 17.8 SL @60மிலி/ஏக்கர், துளைக்கும் பூச்சிக்கு ஸ்பினோசாட் 45 SC @75மிலி/ஏக்கர்.',
            'te-IN': '🐛 సమగ్ర పురుగు నిర్వహణ: వారానికి ఒకసారి పర్యవేక్షణ, పసుపు/ఫెరోమోన్ ట్రాప్స్ వాడాలి, ETL దాటితేనే స్ప్రే. సక్కింగ్ పురుగులకు ఇమిడాక్లోప్రిడ్ 17.8 SL @60మి.లీ/ఎకరం, బోరర్లకు స్పినోసాడ్ 45 SC @75మి.లీ/ఎకరం.',
        },
    },
    {
        id: 'pest_cotton_specific',
        title: 'Cotton Pest Control',
        intents: ['pest'],
        keywords: ['bollworm', 'pink bollworm', 'whitefly', 'leaf curl', 'cotton pest', 'कपास कीट', 'பருத்தி பூச்சி', 'పత్తి పురుగు', 'sucking', 'jassid'],
        content: {
            'en-IN': '🐛 Cotton Pest Management: For Pink Bollworm — install 5 pheromone traps/acre, spray Spinosad 45 SC @75ml/acre if moth catches >8/trap/night. For Whitefly (Leaf Curl vector) — use Spiromesifen 22.9 SC @200ml/acre. Avoid Imidacloprid for whitefly — resistance is widespread.',
            'hi-IN': '🐛 कपास कीट प्रबंधन: गुलाबी बॉलवर्म — 5 फेरोमोन ट्रैप/एकड़, >8 पतंगे/ट्रैप/रात हों तो स्पिनोसैड 45 SC @75मिली/एकड़। सफेद मक्खी — स्पिरोमेसिफेन 22.9 SC @200मिली/एकड़। इमिडाक्लोप्रिड का सफेद मक्खी पर प्रतिरोध आ चुका है।',
            'ta-IN': '🐛 பருத்தி பூச்சி: இளஞ்சிவப்பு காய்ப்புழு — 5 பெரோமோன் வலை/ஏக்கர், >8 அந்துப்பூச்சி/வலை/இரவு என்றால் ஸ்பினோசாட் 45 SC @75மிலி/ஏக்கர். வெள்ளை ஈ — ஸ்பிரோமெசிஃபென் 22.9 SC @200மிலி/ஏக்கர்.',
            'te-IN': '🐛 పత్తి పురుగులు: పింక్ బోల్‌వార్మ్ — 5 ఫెరోమోన్ ట్రాప్స్/ఎకరం, >8 మోత్/ట్రాప్/రాత్రి అయితే స్పినోసాడ్ 45 SC @75మి.లీ/ఎకరం. తెల్ల ఈగ — స్పిరోమేసిఫెన్ 22.9 SC @200మి.లీ/ఎకరం.',
        },
    },
    {
        id: 'disease_fungal',
        title: 'Fungal Disease Management',
        intents: ['pest'],
        keywords: ['fungus', 'blight', 'rust', 'mildew', 'blast', 'फफूंद', 'rog', 'jhulsa', 'पत्ती', 'leaf spot', 'நோய்', 'వ్యాధి', 'पीलापन', 'yellowing', 'मुरझाव', 'wilt'],
        content: {
            'en-IN': '🍂 Fungal Disease Guide: Early Blight/Leaf Spot — apply Mancozeb 75 WP @2.5g/L every 7-10 days. Blast (Rice) — Tricyclazole 75 WP @0.6g/L. Rust (Wheat) — Propiconazole 25 EC @200ml/acre. Powdery Mildew — Sulphur 80 WG @2g/L. Wilt (Fusarium) — Trichoderma viride soil drench + Carbendazim 0.1%.',
            'hi-IN': '🍂 फफूंद रोग: अगेती अंगमारी/धब्बा — मैंकोज़ेब 75 WP @2.5ग्रा/ली हर 7-10 दिन। ब्लास्ट (धान) — ट्राइसाइक्लाज़ोल 75 WP @0.6ग्रा/ली। रतुआ (गेहूं) — प्रोपिकोनाज़ोल 25 EC @200मिली/एकड़। उकठा — ट्राइकोडर्मा ड्रेंचिंग + कार्बेन्डाजिम 0.1%।',
            'ta-IN': '🍂 பூஞ்சை நோய்: இலைப்புள்ளி — மான்கோசெப் 75 WP @2.5கி/லி. நெல் ப்ளாஸ்ட் — டிரைசைக்லோசோல் 75 WP @0.6கி/லி. கோதுமை ரஸ்ட் — புரோபிகோனசோல் 25 EC @200மிலி/ஏக்கர். பவுடரி மில்டியூ — சல்ஃபர் 80 WG @2கி/லி.',
            'te-IN': '🍂 శిలీంద్ర వ్యాధులు: ఆకుమచ్చ — మాంకోజెబ్ 75 WP @2.5గ్రా/లీ. బ్లాస్ట్ (వరి) — ట్రైసైక్లాజోల్ 75 WP @0.6గ్రా/లీ. తుప్పు (గోధుమ) — ప్రొపికొనజోల్ 25 EC @200మి.లీ/ఎకరం. ఎండు — ట్రైకోడెర్మా + కార్బెండజిమ్ 0.1%.',
        },
    },
    {
        id: 'market_prices',
        title: 'Market and Mandi Trends',
        intents: ['market'],
        keywords: ['market', 'price', 'mandi', 'msp', 'sell', 'भाव', 'சந்தை', 'మార్కెట్', 'बिक्री', 'daam', 'rate', 'விலை', 'ధర', 'बाजार'],
        content: {
            'en-IN': '📊 Market strategy: compare mandi cash rate vs MSP, check 7-day trend before selling. If prices are rising >3% weekly, stagger selling in 2 lots to reduce risk. Always check procurement centers during MSP season.',
            'hi-IN': '📊 बाजार रणनीति: मंडी रेट और MSP की तुलना करें, बेचने से पहले 7-दिन का ट्रेंड देखें। यदि भाव 3%/सप्ताह से ज्यादा बढ़ रहे हों तो 2 किस्तों में बिक्री करें। MSP सीज़न में सरकारी केंद्रों की जानकारी रखें।',
            'ta-IN': '📊 சந்தை திட்டம்: மண்டி விலை மற்றும் MSP ஒப்பிடுங்கள். 7 நாள் விலை போக்கை பார்த்து விற்பனை செய்யுங்கள். விலை தொடர்ந்து உயர்ந்தால் 2 கட்டங்களாக விற்கவும். MSP சீசனில் அரசு மையங்களை சரிபார்க்கவும்.',
            'te-IN': '📊 మార్కెట్ వ్యూహం: మండీ ధరను MSPతో పోల్చండి. 7 రోజుల ట్రెండ్ చూసి అమ్మండి. ధరలు వేగంగా పెరుగుతుంటే 2 విడతలుగా అమ్మడం మంచిది. MSP సీజన్‌లో ప్రభుత్వ కేంద్రాలు చూడండి.',
        },
    },
    {
        id: 'market_storage',
        title: 'Grain Storage and Post-Harvest',
        intents: ['market'],
        keywords: ['storage', 'grain', 'warehouse', 'godown', 'भंडारण', 'களஞ்சியம்', 'నిల్వ', 'post harvest', 'drying', 'moisture'],
        content: {
            'en-IN': '📦 Post-Harvest: Dry grain to <14% moisture before storage. Use hermetic (airtight) bags for 6-month safe storage. For bulk storage, apply Aluminium Phosphide @1 tablet/tonne. Store on pallets, not directly on floor. Jute bags cause 5-8% loss vs HDPE bags.',
            'hi-IN': '📦 कटाई बाद: भंडारण से पहले अनाज को <14% नमी तक सुखाएं। 6 महीने सुरक्षित भंडारण के लिए हर्मेटिक बैग। बड़े भंडारण में एल्युमिनियम फॉस्फाइड @1 गोली/टन। फर्श से ऊपर पैलेट पर रखें।',
            'ta-IN': '📦 அறுவடை பிறகு: <14% ஈரப்பதத்திற்கு உலர்த்தவும். 6 மாத சேமிப்புக்கு ஹெர்மெட்டிக் பைகள். பெரிய கிடங்குகளில் அலுமினியம் பாஸ்பைட் @1 மாத்திரை/டன். தரையில் நேரடியாக வைக்காமல் பாலெட்மீது வைக்கவும்.',
            'te-IN': '📦 పంట తర్వాత: <14% తేమకు ఎండబెట్టండి. 6 నెలల నిల్వకు హెర్మెటిక్ బ్యాగ్‌లు వాడండి. పెద్ద గోదాములలో అల్యూమినియం ఫాస్ఫైడ్ @1 టాబ్లెట్/టన్ను. నేలపై కాకుండా ప్యాలెట్‌లపై ఉంచండి.',
        },
    },
    {
        id: 'weather_advisory',
        title: 'Weather-based Farm Actions',
        intents: ['weather', 'irrigation'],
        keywords: ['weather', 'rain', 'forecast', 'humidity', 'spray', 'मौसम', 'மழை', 'వాతావరణం', 'barish', 'baarish', 'heatwave', 'frost', 'loo', 'गर्मी', 'ठंड', 'cold'],
        content: {
            'en-IN': '🌤️ Weather actions: Spray when wind is below 12 km/h and no rain expected for 6 hours. During heatwaves irrigate early morning/evening and avoid midday sprays. Before heavy rain, apply preventive fungicide and clear drainage. During cold spells, protect nurseries and apply light irrigation before sunset to raise soil temperature.',
            'hi-IN': '🌤️ मौसम सलाह: 12 किमी/घंटा से कम हवा और 6 घंटे बारिश न हो तो स्प्रे करें। लू में सुबह/शाम सिंचाई, दोपहर स्प्रे बंद। भारी बारिश से पहले निवारक फफूंदनाशी लगाएं और नाली साफ करें। ठंड में नर्सरी ढकें और शाम हल्की सिंचाई करें।',
            'ta-IN': '🌤️ வானிலை ஆலோசனை: காற்று 12 கிமீ/மணிக்குக் குறைவாகவும் 6 மணி நேரம் மழை இல்லாதபோதும் தெளிக்கவும். வெப்ப அலையில் காலை/மாலை பாசனம், கடும் மழைக்கு முன் பூஞ்சைநாசினி தெளிக்கவும், வடிகால் சீர்படுத்தவும்.',
            'te-IN': '🌤️ వాతావరణ సలహా: గాలి వేగం 12 కి.మీ/గంటకు తక్కువగా, 6 గంటల వర్షం లేనప్పుడు స్ప్రే చేయండి. ఉష్ణతరంగంలో ఉదయం/సాయంత్రం నీరు పెట్టండి. భారీ వర్షానికి ముందు శిలీంద్ర నాశినీ వేయండి, డ్రైనేజ్ సరిచేయండి.',
        },
    },
    {
        id: 'soil_irrigation',
        title: 'Soil and Irrigation Management',
        intents: ['soil', 'irrigation'],
        keywords: ['soil', 'ph', 'irrigation', 'drip', 'water', 'मिट्टी', 'மண்', 'నేల', 'sinchai', 'सिंचाई', 'organic', 'jaivik', 'FYM', 'mulching'],
        content: {
            'en-IN': '💧 Soil-water tip: Sandy soils need frequent light irrigation; Black/Clay soils need wider intervals. Keep pH in the crop-specific range (most crops 6.0-7.5). Add FYM @5t/acre or vermicompost @2t/acre for better moisture retention and soil biology. Mulching reduces water need by 25-30%.',
            'hi-IN': '💧 मिट्टी-जल सलाह: रेतीली मिट्टी में कम मात्रा में बार-बार सिंचाई। काली/चिकनी मिट्टी में अंतराल बढ़ाएं। pH 6.0-7.5 रखें। FYM @5टन/एकड़ या वर्मीकम्पोस्ट @2टन/एकड़ डालें। मल्चिंग से 25-30% पानी की बचत होती है।',
            'ta-IN': '💧 மண்-நீர் மேலாண்மை: மணல் மண்ணில் சிறிதளவு அடிக்கடி பாசனம். கரிசல்/களிமண்ணில் இடைவெளி அதிகமாக வைக்கவும். pH 6.0-7.5 பராமரிக்கவும். FYM @5 டன்/ஏக்கர் அல்லது மண்புழு உரம் @2 டன்/ஏக்கர். மல்ச்சிங் 25-30% நீர் சேமிக்கும்.',
            'te-IN': '💧 నేల-నీటి నిర్వహణ: ఇసక నేలలో తక్కువ నీరు తరచుగా. బ్లాక్/క్లే నేలలో ఎక్కువ వ్యవధిలో. pH 6.0-7.5 ఉంచండి. FYM @5టన్/ఎకరం లేదా వర్మీకాంపోస్ట్ @2టన్/ఎకరం వేయండి. మల్చింగ్ 25-30% నీరు ఆదా.',
        },
    },
    {
        id: 'govt_schemes',
        title: 'Government Schemes for Farmers',
        intents: ['scheme'],
        keywords: ['scheme', 'subsidy', 'pm kisan', 'pmfby', 'loan', 'credit', 'yojana', 'योजना', 'திட்டம்', 'పథకం', 'kisan credit', 'insurance', 'बीमा'],
        content: {
            'en-IN': '🏛️ Key Government Schemes: PM-KISAN provides Rs 6000/year in 3 installments. PMFBY covers crop insurance with minimal premium (2% Kharif, 1.5% Rabi). Kisan Credit Card (KCC) gives crop loans at 4% effective interest for timely repayment. PMKSY provides 45-55% subsidy on micro-irrigation (drip/sprinkler).',
            'hi-IN': '🏛️ सरकारी योजनाएं: PM-KISAN — ₹6000/वर्ष 3 किस्तों में। PMFBY — न्यूनतम प्रीमियम (खरीफ 2%, रबी 1.5%) पर फसल बीमा। KCC — समय पर भुगतान पर 4% प्रभावी ब्याज दर। PMKSY — सूक्ष्म सिंचाई (ड्रिप/स्प्रिंकलर) पर 45-55% सब्सिडी।',
            'ta-IN': '🏛️ அரசு திட்டங்கள்: PM-KISAN — ₹6000/ஆண்டு 3 தவணைகள். PMFBY — குறைந்த பிரீமியம் (காரிஃப் 2%, ரபி 1.5%) பயிர் காப்பீடு. KCC — 4% வட்டியில் பயிர் கடன். PMKSY — சொட்டு/தெளிப்பான் மீது 45-55% மானியம்.',
            'te-IN': '🏛️ ప్రభుత్వ పథకాలు: PM-KISAN — ₹6000/సంవత్సరం 3 విడతలు. PMFBY — తక్కువ ప్రీమియం (ఖరీఫ్ 2%, రబీ 1.5%) పంట బీమా. KCC — 4% వడ్డీతో పంట రుణం. PMKSY — డ్రిప్/స్ప్రింక్లర్‌పై 45-55% సబ్సిడీ.',
        },
    },
    {
        id: 'organic_farming',
        title: 'Organic Farming Practices',
        intents: ['soil', 'fertilizer'],
        keywords: ['organic', 'jaivik', 'जैविक', 'bio', 'compost', 'vermi', 'neem', 'natural', 'இயற்கை', 'సేంద్రియ', 'kheti'],
        content: {
            'en-IN': '🌱 Organic farming essentials: Use Jeevamrit (200L/acre fermented microbial culture) every 15 days. Neem cake @100kg/acre at planting replaces part of N and controls soil pests. Panchagavya foliar spray @3% enhances plant immunity. Trichoderma viride @2kg/acre fortifies soil against fungal pathogens.',
            'hi-IN': '🌱 जैविक खेती: जीवामृत (200ली/एकड़) हर 15 दिन। नीम खली @100किग्रा/एकड़ मिट्टी में। पंचगव्य @3% फोलियर स्प्रे प्रतिरक्षा बढ़ाता है। ट्राइकोडर्मा विरिडी @2किग्रा/एकड़ फफूंद से बचाव करता है।',
            'ta-IN': '🌱 இயற்கை வேளாண்மை: ஜீவாம்ருதம் (200 லி/ஏக்கர்) 15 நாளுக்கு ஒருமுறை. வேப்பம் பிண்ணாக்கு @100கிலோ/ஏக்கர் மண்ணில். பஞ்சகவ்யா @3% இலை தெளிப்பு நோய் எதிர்ப்பை அதிகரிக்கும். டிரைக்கோடெர்மா @2கிலோ/ஏக்கர்.',
            'te-IN': '🌱 సేంద్రియ వ్యవసాయం: జీవామృతం (200లీ/ఎకరం) 15 రోజులకు ఒకసారి. వేప పిండి @100కిలో/ఎకరం. పంచగవ్య @3% ఫోలియర్ స్ప్రే రోగ నిరోధకత పెంచుతుంది. ట్రైకోడెర్మా @2కిలో/ఎకరం.',
        },
    },
    {
        id: 'pest_rice_stem_borer',
        title: 'Rice Stem Borer Management',
        intents: ['pest'],
        keywords: ['stem borer', 'yellow stem borer', 'paddy stem borer', 'rice stem borer', 'dead heart', 'white ear', 'scirpophaga', 'paddy', 'rice'],
        content: {
            'en-IN': 'dY?> Rice stem borer (dead hearts/white ear): Remove and destroy infested tillers, keep water level shallow (2-3 cm) at early stage, and avoid excess nitrogen. If ETL is crossed (dead hearts >5% or 1 egg mass/mA), use Chlorantraniliprole 0.4G @ 4 kg/acre (broadcast in standing water) or Chlorantraniliprole 18.5 SC @ 60 ml/acre (spray with 200 L water/acre). Keep pheromone traps (5/acre).'
        },
    },
    {
        id: 'pest_fall_armyworm',
        title: 'Fall Armyworm (FAW) Management in Maize',
        intents: ['pest'],
        keywords: ['fall armyworm', 'faw', 'maize pest', 'armyworm', 'spodoptera frugiperda', 'maize', 'corn'],
        content: {
            'en-IN': 'dY?> Fall Armyworm in Maize: Scout fields regularly starting from seedling stage. Look for papery windows on leaves and frass (sawdust-like excreta) in whorls. ETL: 5-10% plant infestation. Spray Emamectin benzoate 5% SG @ 0.4 g/L or Spinetoram 11.7% SC @ 0.5 ml/L. Direct the spray nozzle directly into the plant whorls where larvae hide.'
        },
    },
    {
        id: 'fertilizer_wheat_npk',
        title: 'Wheat Fertilizer Schedule (NPK)',
        intents: ['fertilizer'],
        keywords: ['wheat fertilizer', 'npk', 'urea', 'dap', 'wheat', 'gehu', 'topdressing wheat'],
        content: {
            'en-IN': 'dY~ Wheat NPK Dosage (General: 150:60:40 kg NPK/ha): Basal dose (at sowing): Apply 1 bag DAP (50kg) + 1 bag MOP (50kg) + 0.5 bag Urea (25kg) per acre. First Top Dressing (at CRI stage, 21 DAS): Apply 1 bag Urea (45kg/acre). Second Top Dressing (Late jointing stage, 45 DAS): Apply 0.5 to 1 bag Urea based on crop health. Add Zinc Sulphate (10kg/acre) basally if soils are deficient.'
        },
    },
    {
        id: 'pest_cotton_pink_bollworm',
        title: 'Pink Bollworm Management in Cotton',
        intents: ['pest'],
        keywords: ['pink bollworm', 'cotton', 'bollworm', 'pbw', 'kapas'],
        content: {
            'en-IN': 'dY?> Pink Bollworm in Cotton: PBW attacks flowers (rosette shape) and bolls. Install Pheromone traps @ 5/acre 45 days after sowing. ETL: 8 moths/trap/night for 3 days or 10% infested flowers/bolls. Spray Profenofos 50 EC @ 2 ml/L or Quinalphos 25 EC @ 2 ml/L. Terminate crop early to break the pest cycle.'
        },
    },
    {
        id: 'disease_tomato_late_blight',
        title: 'Tomato Late Blight Control',
        intents: ['pest'],
        keywords: ['late blight', 'tomato', 'blight', 'tamatar', 'phytophthora', 'wilt', 'leaves turning brown', 'black spots tomato'],
        content: {
            'en-IN': 'dY?> Tomato Late Blight: Characterized by large, irregular water-soaked spots on leaves that turn brown/purplish, and white fungal growth on undersides in humid weather. Preventive: Spray Mancozeb 75 WP @ 2g/L. Curative: If symptoms appear, spray Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L or Cymoxanil + Mancozeb @ 3g/L. Improve ventilation and avoid overhead irrigation.'
        },
    },
    {
        id: 'irrigation_general_guidelines',
        title: 'General Irrigation & Water Management',
        intents: ['irrigation'],
        keywords: ['irrigation', 'water', 'watering', 'paani', 'drip', 'sprinkler', 'critical stages', 'moisture'],
        content: {
            'en-IN': 'dY" Irrigation Guidelines: Always irrigate based on crop critical stages (e.g., CRI in wheat, flowering in most crops, pod formation in pulses). Prevent water stress during flowering/fruiting to avoid flower drop. Avoid over-irrigation to prevent root rot. Drip irrigation saves 40-50% water and allows fertigation (delivering fertilizers directly to roots). Mulching helps retain soil moisture.'
        },
    },
    {
        id: 'agri_loan_kcc',
        title: 'Kisan Credit Card (KCC) details',
        intents: ['scheme', 'general'],
        keywords: ['kcc', 'kisan credit card', 'loan', 'credit', 'interest', 'sbi', 'bank', 'interest subvention', 'crop loan'],
        content: {
            'en-IN': 'dY" Kisan Credit Card (KCC): Offers short-term crop loans up to Rs. 3 Lakh. The standard interest rate is 7%, but with a 3% prompt repayment subvention, the effective rate drops to 4% per annum. No collateral is required for loans up to Rs. 1.6 Lakh. Contact your nearest rural bank or CSC to apply with Aadhar, PAN, and land records.'
        },
    }
];

const INTENT_KEYWORDS: Record<string, string[]> = {
    fertilizer: ['fertilizer', 'urea', 'dap', 'npk', 'nutrient', 'खाद', 'உரம்', 'ఎరువు', 'manure', 'compost', 'potash', 'mop', 'nitrogen', 'phosphorus', 'potassium', 'zinc', 'sulphur', 'micronutrient', 'basal', 'topdress', 'dose', 'सूक्ष्म', 'নিউট্রিয়েন্ট'],
    pest: ['pest', 'insect', 'disease', 'aphid', 'borer', 'कीट', 'பூச்சி', 'పురుగు', 'spray', 'fungicide', 'insecticide', 'wilt', 'blight', 'rot', 'mildew', 'rog', 'रोग', 'rust', 'thrips', 'whitefly', 'armyworm', 'bollworm', 'yellowing', 'माहू', 'इल्ली', 'நோய்', 'వ్యాధి', 'fungus', 'pha', 'curling'],
    market: ['market', 'mandi', 'msp', 'rate', 'price', 'margin', 'profit', 'profitability', 'roi', 'returns', 'income', 'भाव', 'सस्ता', 'महंगा', 'लाभ', 'मुनाफा', 'मार्जिन', 'சந்தை', 'மார்ஜின்', 'லாபம்', 'ధర', 'మార్జిన్', 'లాభం', 'sell', 'buy', 'बिक्री', 'दाम', 'storage', 'godown', 'warehouse', 'grade', 'विक्रय', 'விற்பனை', 'అమ్మడం'],
    weather: ['weather', 'rain', 'humidity', 'temperature', 'forecast', 'मौसम', 'வானிலை', 'వాతావరణం', 'heatwave', 'frost', 'cold', 'heat', 'storm', 'loo', 'barish', 'baarish', 'monsoon', 'drought', 'तापमान', 'வெப்பம்', 'ఉష్ణోగ్రత'],
    irrigation: ['irrigation', 'water', 'drip', 'sprinkler', 'सिंचाई', 'பாசனம்', 'నీటి', 'flood', 'furrow', 'paani', 'moisture', 'mulch', 'mulching', 'neer', 'neeru', 'நீர்', 'waterlogging', 'drainage'],
    soil: ['soil', 'ph', 'zinc', 'sulphur', 'मिट्टी', 'மண்', 'నేల', 'organic', 'carbon', 'FYM', 'compost', 'vermi', 'jaivik', 'humus', 'lime', 'gypsum', 'acid', 'alkaline', 'fertility', 'test'],
    scheme: ['scheme', 'yojana', 'subsidy', 'loan', 'credit', 'pm kisan', 'pmfby', 'insurance', 'kcc', 'योजना', 'சலுகை', 'பட்டியல்', 'పథకం', 'सब्सिडी', 'बीमा', 'kisan', 'government', 'sarkari', 'grant'],
};

const CROP_KEYWORDS: Array<{ crop: string; tokens: string[] }> = [
    { crop: 'Rice', tokens: ['rice', 'paddy', 'धान', 'நெல்', 'వరి', 'chawal', 'ধান'] },
    { crop: 'Wheat', tokens: ['wheat', 'gehu', 'गेहूं', 'கோதுமை', 'గోధుమ', 'gehun', 'গম'] },
    { crop: 'Cotton', tokens: ['cotton', 'kapas', 'कपास', 'பருத்தி', 'పత్తి', 'narma', 'তুলা'] },
    { crop: 'Maize', tokens: ['maize', 'corn', 'मक्का', 'மக்காச்சோளம்', 'మొక్కజొన్న', 'makka', 'bhutta'] },
    { crop: 'Soybean', tokens: ['soybean', 'सोयाबीन', 'சோயா', 'సోయాబీన్', 'soya'] },
    { crop: 'Sugarcane', tokens: ['sugarcane', 'ganna', 'गन्ना', 'கரும்பு', 'చెరకు'] },
    { crop: 'Groundnut', tokens: ['groundnut', 'peanut', 'mungfali', 'मूंगफली', 'நிலக்கடலை', 'వేరుశెనగ'] },
    { crop: 'Mustard', tokens: ['mustard', 'sarson', 'सरसों', 'கடுகு', 'ఆవాలు'] },
    { crop: 'Onion', tokens: ['onion', 'pyaz', 'प्याज', 'வெங்காயம்', 'ఉల్లి'] },
    { crop: 'Tomato', tokens: ['tomato', 'tamatar', 'टमाटर', 'தக்காளி', 'టమాట'] },
    { crop: 'Potato', tokens: ['potato', 'aloo', 'आलू', 'உருளைக்கிழங்கு', 'ఆలూ', 'আলু'] },
    { crop: 'Bajra', tokens: ['bajra', 'pearl millet', 'millet', 'बाजरा', 'கம்பு', 'సజ్జ'] },
    { crop: 'Jowar', tokens: ['jowar', 'sorghum', 'ज्वार', 'சோளம்', 'జొన్న'] },
    { crop: 'Chana', tokens: ['chana', 'chickpea', 'bengal gram', 'चना', 'கொண்டைக்கடலை', 'శనగ'] },
    { crop: 'Barley', tokens: ['barley', 'jau', 'जौ', 'வாற்கோதுமை', 'బార్లీ'] },
];

const RESPONSE_TEXT: Record<string, { understood: string; basedOn: string; followUp: string; clarify: string }> = {
    'en-IN': {
        understood: 'I understood your question:',
        basedOn: 'I matched this with:',
        followUp: 'Suggested follow-up:',
        clarify: 'If you share crop stage + location, I can make this more precise.',
    },
    'hi-IN': {
        understood: 'आपका सवाल समझा:',
        basedOn: 'यह जानकारी इन विषयों से मिली:',
        followUp: 'अगला उपयोगी सवाल:',
        clarify: 'फसल की अवस्था और स्थान बताएंगे तो मैं और सटीक सलाह दे सकता हूं।',
    },
    'ta-IN': {
        understood: 'உங்கள் கேள்வி புரிந்தது:',
        basedOn: 'இதற்கான தகவல்:',
        followUp: 'அடுத்த கேள்வி:',
        clarify: 'பயிர் கட்டம் மற்றும் இடம் கொடுத்தால் இன்னும் துல்லியமாக சொல்லலாம்.',
    },
    'te-IN': {
        understood: 'మీ ప్రశ్న అర్థమైంది:',
        basedOn: 'ఈ సమాచారాన్ని వీటి ఆధారంగా ఇచ్చాను:',
        followUp: 'తర్వాత అడగవచ్చు:',
        clarify: 'పంట దశ మరియు ప్రాంతం చెబితే ఇంకా ఖచ్చితమైన సలహా ఇస్తాను.',
    },
    'bn-IN': {
        understood: 'আমি আপনার প্রশ্ন বুঝেছি:',
        basedOn: 'আমি এটি মিলিয়েছি:',
        followUp: 'আরও জানতে চাইলে জিজ্ঞাসা করুন।',
        clarify: 'দুঃখিত, আমি সঠিক তথ্য খুঁজে পাইনি।',
    },
    'kn-IN': {
        understood: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಅರ್ಥವಾಯಿತು:',
        basedOn: 'ನಾನು ಇದನ್ನು ಹೊಂದಿಸಿದೆ:',
        followUp: 'ಇನ್ನೂ ತಿಳಿಯಲು ಕೇಳಿ.',
        clarify: 'ಕ್ಷಮಿಸಿ, ಸರಿಯಾದ ಮಾಹಿತಿ ಸಿಗಲಿಲ್ಲ.',
    },
    'ml-IN': {
        understood: 'നിങ്ങളുടെ ചോദ്യം മനസ്സിലായി:',
        basedOn: 'ഞാൻ ഇത് പൊരുത്തപ്പെടുത്തി:',
        followUp: 'കൂടുതൽ അറിയാൻ ചോദിക്കൂ.',
        clarify: 'ക്ഷമിക്കണം, ശരിയായ വിവരം കണ്ടെത്താനായില്ല.',
    },
};

function getResponseText(langCode: SupportedLanguageCode) {
    return RESPONSE_TEXT[langCode] ?? RESPONSE_TEXT['en-IN'];
}

function normalizeForSearch(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\u0900-\u097f\u0980-\u09ff\u0b80-\u0bff\u0c00-\u0c7f\u0c80-\u0cff\u0d00-\u0d7f\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenize(text: string) {
    return normalizeForSearch(text).split(' ').filter((token) => token.length > 1);
}

function extractKeywordSeeds(text: string): string[] {
    const normalized = normalizeForSearch(text);
    const seeds = normalized.split(' ').filter((token) => token.length > 2);
    return [...new Set(seeds)];
}

function normalizeKnowledgeDoc(rawDoc: Partial<KnowledgeDoc> & { content?: string | Partial<Record<SupportedLanguageCode, string>> }, fallbackId: string): KnowledgeDoc | null {
    if (!rawDoc) {
        return null;
    }

    const id = typeof rawDoc.id === 'string' && rawDoc.id.trim() ? rawDoc.id.trim() : fallbackId;
    const title = typeof rawDoc.title === 'string' && rawDoc.title.trim() ? rawDoc.title.trim() : id;
    const content = typeof rawDoc.content === 'string'
        ? ({ 'en-IN': rawDoc.content } as Partial<Record<SupportedLanguageCode, string>>)
        : rawDoc.content ?? { 'en-IN': '' };

    const keywords = Array.isArray(rawDoc.keywords) && rawDoc.keywords.length > 0
        ? rawDoc.keywords
        : extractKeywordSeeds(`${title} ${Object.values(content).join(' ')}`);

    const intents = Array.isArray(rawDoc.intents) && rawDoc.intents.length > 0 ? rawDoc.intents : ['general'];

    return {
        id,
        title,
        keywords,
        intents,
        content,
    };
}

function getKnowledgeBase(): { docs: KnowledgeDoc[]; source: KnowledgeSource } {
    if (knowledgeCache) {
        return knowledgeCache;
    }

    knowledgeCache = { docs: KNOWLEDGE_BASE, source: 'built-in' };
    return knowledgeCache;
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// Check if two words are similar (fuzzy match)
function isFuzzyMatch(word: string, target: string, threshold = 0.7): boolean {
    if (word === target) return true;
    if (word.length < 3 || target.length < 3) return word === target;

    // Check prefix match
    if (word.startsWith(target) || target.startsWith(word)) return true;

    // Check if one contains the other
    if (word.includes(target) || target.includes(word)) return true;

    // Calculate similarity using Levenshtein distance
    const maxLen = Math.max(word.length, target.length);
    const distance = levenshteinDistance(word, target);
    const similarity = 1 - distance / maxLen;

    return similarity >= threshold;
}

// Find synonyms and related terms
const SYNONYMS: Record<string, string[]> = {
    fertilizer: ['manure', 'nutrient', 'compost', 'feed', 'urea', 'dap', 'npk', 'potash'],
    pest: ['insect', 'bug', 'worm', 'disease', 'infection', 'blight', 'fungus'],
    market: ['mandi', 'price', 'rate', 'sell', 'buy', 'cost', 'value', 'margin', 'profit', 'profitability', 'roi', 'returns', 'income'],
    weather: ['rain', 'climate', 'temperature', 'forecast', 'humidity', 'wind'],
    irrigation: ['water', 'watering', 'drip', 'sprinkler', 'moisture'],
    soil: ['land', 'earth', 'ground', 'dirt', 'field'],
    crop: ['plant', 'harvest', 'cultivation', 'farming', 'agriculture'],
};

function expandWithSynonyms(word: string): string[] {
    const normalized = word.toLowerCase();
    const expanded = [normalized];

    for (const [key, synonyms] of Object.entries(SYNONYMS)) {
        if (key === normalized || synonyms.includes(normalized)) {
            expanded.push(key, ...synonyms);
        }
    }

    return [...new Set(expanded)];
}

function detectCrop(queryText: string) {
    const normalized = normalizeForSearch(queryText);
    const tokens = tokenize(queryText);

    for (const crop of CROP_KEYWORDS) {
        if (crop.tokens.some((token) => {
            // Exact match
            if (token.length <= 4) {
                if (normalized.includes(' ' + token + ' ') || normalized.startsWith(token + ' ') || normalized.endsWith(' ' + token) || normalized === token || tokens.includes(token)) {
                    return true;
                }
            } else if (normalized.includes(token) || tokens.includes(token)) {
                return true;
            }

            // Fuzzy match for longer tokens
            if (token.length > 4) {
                return tokens.some(t => isFuzzyMatch(t, token, 0.75));
            }

            return false;
        })) {
            return crop.crop;
        }
    }

    return null;
}

function detectIntent(queryText: string) {
    const normalized = normalizeForSearch(queryText);
    const tokens = tokenize(queryText);

    // Expand tokens with synonyms
    const expandedTokens = tokens.flatMap(expandWithSynonyms);

    let bestIntent = 'general';
    let bestScore = 0;

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
        let score = 0;
        for (const keyword of keywords) {
            // Exact substring match - highest score
            if (normalized.includes(keyword)) {
                score += 6;
            } else if (expandedTokens.includes(keyword)) {
                // Synonym match
                score += 4;
            } else if (tokens.some((token) => token === keyword || token.startsWith(keyword) || keyword.startsWith(token))) {
                score += 2;
            } else if (tokens.some(token => isFuzzyMatch(token, keyword, 0.7))) {
                // Fuzzy match - lower score
                score += 1;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestIntent = intent;
        }
    }

    return bestIntent;
}

function scoreKnowledgeDocuments(queryText: string, docs: KnowledgeDoc[]): ScoredDoc[] {
    const normalized = normalizeForSearch(queryText);
    const tokens = tokenize(queryText);
    const expandedTokens = tokens.flatMap(expandWithSynonyms);

    const scoredDocs = docs.map((doc) => {
        let score = 0;
        const matchedKeywords: string[] = [];
        let hasStrongMatch = false;

        for (const keyword of doc.keywords) {
            const normalizedKeyword = normalizeForSearch(keyword);

            // Exact match - highest priority
            if (normalized.includes(normalizedKeyword)) {
                score += 8;
                matchedKeywords.push(keyword);
                hasStrongMatch = true;
            } else if (expandedTokens.includes(normalizedKeyword)) {
                // Synonym match
                score += 5;
                matchedKeywords.push(keyword);
                hasStrongMatch = true;
            } else if (tokens.some((token) => token === normalizedKeyword || token.startsWith(normalizedKeyword) || normalizedKeyword.startsWith(token))) {
                score += 3;
                matchedKeywords.push(keyword);
                hasStrongMatch = true;
            } else if (hasStrongMatch && tokens.some(token => isFuzzyMatch(token, normalizedKeyword, 0.7))) {
                // Allow fuzzy only if we already have at least one strong match.
                score += 1;
                matchedKeywords.push(keyword + ' (fuzzy)');
            }
        }

        // If there was no strong match at all, ignore this document.
        if (!hasStrongMatch) {
            return { doc, score: 0, matchedKeywords: [] };
        }

        // Boost score if multiple keywords matched
        if (matchedKeywords.length > 2) {
            score += matchedKeywords.length * 2;
        }

        return { doc, score, matchedKeywords };
    })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score);

    return scoredDocs;
}

const INTENT_ADVICE: Record<string, Partial<Record<SupportedLanguageCode, string>>> = {
    fertilizer: {
        'en-IN': 'For your question: split nitrogen in 2-3 doses, apply basal DAP at sowing/transplanting, and add zinc if leaves show pale striping.',
        'hi-IN': 'आपके प्रश्न के अनुसार: नाइट्रोजन 2-3 किस्तों में दें, बुवाई/रोपाई में बेसल DAP दें, पत्तियों में पीली धारियां हों तो जिंक दें।',
    },
    pest: {
        'en-IN': 'For your question: scout weekly, use traps, spray only above ETL, rotate chemicals, and spray in the evening with safety gear.',
        'hi-IN': 'आपके प्रश्न के अनुसार: साप्ताहिक निरीक्षण, ट्रैप, ETL पार होने पर ही स्प्रे, दवा बदल-बदलकर, शाम को सुरक्षा के साथ छिड़काव।',
    },
    market: {
        'en-IN': 'For your question: compare mandi rate with MSP, check 7-day trend, and sell in staggered lots when prices rise.',
        'hi-IN': 'आपके प्रश्न के अनुसार: मंडी भाव और MSP की तुलना, 7-दिन का ट्रेंड, भाव बढ़ने पर किस्तों में बिक्री।',
    },
    weather: {
        'en-IN': 'For your question: spray when wind is low and no rain for 6 hours; irrigate morning/evening in heat.',
        'hi-IN': 'आपके प्रश्न के अनुसार: कम हवा और 6 घंटे बिना बारिश पर स्प्रे; गर्मी में सुबह/शाम सिंचाई।',
    },
    irrigation: {
        'en-IN': 'For your question: irrigate by soil type and crop stage; avoid waterlogging; use mulching to save water.',
        'hi-IN': 'आपके प्रश्न के अनुसार: मिट्टी और फसल अवस्था के अनुसार सिंचाई; जलभराव से बचें; मल्चिंग से पानी बचाएं।',
    },
    soil: {
        'en-IN': 'For your question: test soil pH and micronutrients; add FYM/vermicompost; correct zinc/sulphur if deficient.',
        'hi-IN': 'आपके प्रश्न के अनुसार: मिट्टी pH और सूक्ष्म पोषक जांच; FYM/वर्मीकम्पोस्ट; जिंक/सल्फर सुधार।',
    },
    scheme: {
        'en-IN': 'For your question: check PM-KISAN, PMFBY, KCC, and micro-irrigation subsidy via state portal or CSC/KVK.',
        'hi-IN': 'आपके प्रश्न के अनुसार: PM-KISAN, PMFBY, KCC, सूक्ष्म सिंचाई सब्सिडी राज्य पोर्टल/CSC से जांचें।',
    },
    general: {
        'en-IN': 'Based on your description, share crop name, growth stage, district/state, and symptoms for a precise dosage and schedule.',
        'hi-IN': 'आपके विवरण के आधार पर फसल, अवस्था, जिला/राज्य और लक्षण बताएं ताकि सटीक मात्रा और समय दे सकूं।',
    },
};

function buildDynamicFallback(queryText: string, langCode: SupportedLanguageCode, intent: string, crop: string | null) {
    const text = getResponseText(langCode);
    const cropContext = crop ? ` (${crop})` : '';
    const advice =
        INTENT_ADVICE[intent]?.[langCode] ??
        INTENT_ADVICE[intent]?.['en-IN'] ??
        INTENT_ADVICE.general['en-IN'];

    return `${text.understood} "${queryText.trim()}"${cropContext}.\n\n${advice}\n\n${text.clarify}`;
}

function getFollowUpPrompt(intent: string, langCode: SupportedLanguageCode, crop: string | null) {
    const cropLabel = crop ?? (langCode === 'hi-IN' ? 'मेरी फसल' : langCode === 'ta-IN' ? 'என் பயிர்' : langCode === 'te-IN' ? 'నా పంట' : 'my crop');

    const prompts: Record<string, string> = {
        fertilizer: langCode === 'hi-IN' ? `${cropLabel} के लिए चरणवार उर्वरक डोज बताएं।` : langCode === 'ta-IN' ? `${cropLabel} க்கு கட்டம் வாரியான உர அளவு சொல்லுங்கள்.` : langCode === 'te-IN' ? `${cropLabel} కు దశల వారీ ఎరువు మోతాదు చెప్పండి.` : `Give a stage-wise fertilizer dose for ${cropLabel}.`,
        pest: langCode === 'hi-IN' ? `${cropLabel} में कीट का ETL और स्प्रे अंतराल बताएं।` : langCode === 'ta-IN' ? `${cropLabel} இல் ETL மற்றும் தெளிப்பு இடைவெளி சொல்லுங்கள்.` : langCode === 'te-IN' ? `${cropLabel} లో ETL మరియు స్ప్రే గ్యాప్ చెప్పండి.` : `Tell me ETL and spray interval for pests in ${cropLabel}.`,
        market: langCode === 'hi-IN' ? `${cropLabel} बेचने का सही समय बताएं।` : langCode === 'ta-IN' ? `${cropLabel} விற்க நல்ல நேரம் எது?` : langCode === 'te-IN' ? `${cropLabel} అమ్మడానికి సరైన సమయం ఏది?` : `What is the best time to sell ${cropLabel}?`,
        weather: langCode === 'hi-IN' ? 'अगले 5 दिनों का स्प्रे और सिंचाई प्लान दें।' : langCode === 'ta-IN' ? 'அடுத்த 5 நாட்களுக்கு தெளிப்பு, பாசன திட்டம் கொடுக்கவும்.' : langCode === 'te-IN' ? 'తదుపరి 5 రోజుల స్ప్రే, నీటి ప్రణాళిక ఇవ్వండి.' : 'Give a 5-day spray and irrigation plan.',
        irrigation: langCode === 'hi-IN' ? `${cropLabel} के लिए मिट्टी-आधारित सिंचाई अंतराल दें।` : langCode === 'ta-IN' ? `${cropLabel} க்கு மண் அடிப்படையிலான பாசன இடைவெளி சொல்லுங்கள்.` : langCode === 'te-IN' ? `${cropLabel} కు నేల ఆధారిత నీటి విరామం చెప్పండి.` : `Give soil-based irrigation interval for ${cropLabel}.`,
        soil: langCode === 'hi-IN' ? 'मेरी मिट्टी रिपोर्ट के अनुसार सुधार योजना दें।' : langCode === 'ta-IN' ? 'என் மண் அறிக்கைக்கு ஏற்ற மேம்பாட்டு திட்டம் கூறுங்கள்.' : langCode === 'te-IN' ? 'నా నేల నివేదికకు సరిపోయే మెరుగుదల ప్రణాళిక చెప్పండి.' : 'Give a soil improvement plan from my test report.',
        scheme: langCode === 'hi-IN' ? 'PM-KISAN, PMFBY या KCC की विस्तृत पात्रता बताएं।' : langCode === 'ta-IN' ? 'PM-KISAN, PMFBY அல்லது KCC தகுதி விவரம் சொல்லுங்கள்.' : langCode === 'te-IN' ? 'PM-KISAN, PMFBY లేదా KCC అర్హత వివరాలు చెప్పండి.' : 'Tell me eligibility details for PM-KISAN, PMFBY, or KCC.',
        general: langCode === 'hi-IN' ? 'फसल + अवस्था + समस्या के साथ दोबारा पूछें।' : langCode === 'ta-IN' ? 'பயிர் + கட்டம் + பிரச்சனை சேர்த்து மீண்டும் கேளுங்கள்.' : langCode === 'te-IN' ? 'పంట + దశ + సమస్యతో మళ్లీ అడగండి.' : 'Ask again with crop + stage + issue.',
    };

    return prompts[intent] ?? prompts.general;
}

function hasStrongKnowledgeMatch(query: string): boolean {
    const { docs } = getKnowledgeBase();
    const matches = scoreKnowledgeDocuments(query, docs);
    return matches.length > 0 && matches[0].score >= 3;
}

function cleanTextForSpeech(text: string): string {
    return text
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
        .replace(/[*#_\[\]()]/g, ' ')
        .replace(/\d+\.\s/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function buildFarmingKnowledgeAnswer(query: string, langCode: SupportedLanguageCode): string {
    const intent = detectIntent(query);
    const crop = detectCrop(query);
    const text = getResponseText(langCode);
    const { docs, source } = getKnowledgeBase();
    const matches = scoreKnowledgeDocuments(query, docs);
    const topMatches = matches.slice(0, 2);

    if (topMatches.length === 0) {
        if (source === 'local-files') {
            return (
                `${text.understood} "${query.trim()}".\n\n` +
                'I could not find this in the local knowledge base. Add a matching entry in data/knowledge-base.json or data/knowledge/*.md, then try again.'
            );
        }

        return buildDynamicFallback(query, langCode, intent, crop);
    }

    const matchedTitles = topMatches.map((item) => item.doc.title).join(', ');
    const sections = topMatches
        .map((item, index) => {
            const localizedDoc = item.doc.content[langCode] ?? item.doc.content['en-IN'] ?? '';
            return `${index + 1}. ${localizedDoc}`;
        })
        .join('\n\n');

    const followUpPrompt = getFollowUpPrompt(intent, langCode, crop);
    const cropContext = crop ? ` (${crop})` : '';

    return (
        `${text.understood} "${query.trim()}"${cropContext}.\n` +
        `${text.basedOn} ${matchedTitles}.\n\n` +
        `${sections}\n\n` +
        `${text.followUp} ${followUpPrompt}`
    );
}