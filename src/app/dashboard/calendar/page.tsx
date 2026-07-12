'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Download,
  Loader2,
  Languages,
  MapPin,
  RefreshCw,
  Sprout,
  Tractor,
  Droplets,
  BellRing,
} from 'lucide-react';
import type { CalendarSnapshot, CalendarStage } from '@/lib/dynamicDashboardData';
import { getPrimaryCrop } from '@/lib/farmProfile';
import { useFarmProfile } from '@/lib/useFarmProfile';

const CROPS = ['Wheat', 'Rice (Paddy)', 'Cotton', 'Maize', 'Soybean'];
const POPULAR_LOCATIONS = ['Nagpur', 'Pune', 'Indore', 'Ludhiana', 'Jaipur', 'Raipur', 'Hyderabad', 'Bhopal', 'Nashik', 'Ahmedabad', 'Patna', 'Lucknow', 'Chennai', 'Bangalore'];
const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
] as const;

type AppLanguage = (typeof LANGUAGE_OPTIONS)[number]['code'];

const UI_TEXT: Record<AppLanguage, Record<string, string>> = {
  en: {
    title: 'Dynamic Crop Calendar',
    subtitle: 'Timeline adapts to your sowing date, crop, location, and current conditions.',
    downloaded: 'Downloaded',
    export: 'Export CSV',
    crop: 'Crop',
    sowingDate: 'Sowing Date',
    location: 'Location',
    language: 'Language',
    apply: 'Apply',
    progressOverview: 'Progress Overview',
    seasonProgress: 'Season Progress',
    weatherLoading: 'Generating weather-linked calendar note...',
    activeStage: 'Active Stage',
    noActiveStage: 'No active stage right now. Upcoming stages are listed below.',
    actionPanel: 'Actionable Advisory',
    actionSubtitle: 'What to do now based on current crop cycle',
    seasonCompleted: 'Season Completed',
    seasonActive: 'Season In Progress',
    seasonUpcoming: 'Season Yet To Start',
    loading: 'Building dynamic crop timeline...',
  },
  hi: {
    title: 'डायनामिक फसल कैलेंडर',
    subtitle: 'समयरेखा आपकी बुवाई तिथि, फसल, स्थान और वर्तमान मौसम के अनुसार बदलती है।',
    downloaded: 'डाउनलोड हो गया',
    export: 'CSV निर्यात करें',
    crop: 'फसल',
    sowingDate: 'बुवाई की तिथि',
    location: 'स्थान',
    language: 'भाषा',
    apply: 'लागू करें',
    progressOverview: 'प्रगति सारांश',
    seasonProgress: 'सीजन प्रगति',
    weatherLoading: 'मौसम आधारित सलाह तैयार की जा रही है...',
    activeStage: 'सक्रिय चरण',
    noActiveStage: 'अभी कोई सक्रिय चरण नहीं है। आने वाले चरण नीचे दिए गए हैं।',
    actionPanel: 'कार्रवाई योग्य सलाह',
    actionSubtitle: 'वर्तमान फसल चक्र के आधार पर अभी क्या करना है',
    seasonCompleted: 'सीजन पूर्ण',
    seasonActive: 'सीजन जारी है',
    seasonUpcoming: 'सीजन शुरू होना बाकी है',
    loading: 'डायनामिक फसल समयरेखा तैयार हो रही है...',
  },
  mr: {
    title: 'डायनॅमिक पीक कॅलेंडर',
    subtitle: 'ही वेळापत्रक तुमच्या पेरणी तारखेप्रमाणे, पिकाप्रमाणे, ठिकाणानुसार आणि हवामानानुसार बदलते.',
    downloaded: 'डाउनलोड झाले',
    export: 'CSV निर्यात करा',
    crop: 'पीक',
    sowingDate: 'पेरणी दिनांक',
    location: 'ठिकाण',
    language: 'भाषा',
    apply: 'लागू करा',
    progressOverview: 'प्रगती आढावा',
    seasonProgress: 'हंगाम प्रगती',
    weatherLoading: 'हवामानाशी संबंधित सूचना तयार होत आहेत...',
    activeStage: 'सक्रिय टप्पा',
    noActiveStage: 'सध्या सक्रिय टप्पा नाही. पुढील टप्पे खाली दिले आहेत.',
    actionPanel: 'कार्यान्वयनीय सल्ला',
    actionSubtitle: 'सध्याच्या पीक चक्रानुसार आत्ता काय करावे',
    seasonCompleted: 'हंगाम पूर्ण',
    seasonActive: 'हंगाम सुरू आहे',
    seasonUpcoming: 'हंगाम अजून सुरू व्हायचा आहे',
    loading: 'डायनॅमिक पीक वेळापत्रक तयार होत आहे...',
  },
  ta: {
    title: 'செயல்பாட்டு பயிர் காலண்டர்',
    subtitle: 'இந்த காலவரிசை உங்கள் விதைப்பு தேதி, பயிர், இடம் மற்றும் தற்போதைய வானிலைக்கு ஏற்ப மாறும்.',
    downloaded: 'பதிவிறக்கம் முடிந்தது',
    export: 'CSV ஏற்றுமதி',
    crop: 'பயிர்',
    sowingDate: 'விதைப்பு தேதி',
    location: 'இடம்',
    language: 'மொழி',
    apply: 'பயன்படுத்து',
    progressOverview: 'முன்னேற்ற சுருக்கம்',
    seasonProgress: 'பருவ முன்னேற்றம்',
    weatherLoading: 'வானிலை அடிப்படையிலான குறிப்புகள் உருவாக்கப்படுகின்றன...',
    activeStage: 'செயலில் உள்ள நிலை',
    noActiveStage: 'இப்போது செயலில் உள்ள நிலை இல்லை. அடுத்த நிலைகள் கீழே உள்ளன.',
    actionPanel: 'செயல் ஆலோசனை',
    actionSubtitle: 'தற்போதைய பயிர் சுற்றை அடிப்படையாகக் கொண்டு இப்போது செய்ய வேண்டியது',
    seasonCompleted: 'பருவம் முடிந்தது',
    seasonActive: 'பருவம் நடைபெறுகிறது',
    seasonUpcoming: 'பருவம் தொடங்கவில்லை',
    loading: 'செயல்பாட்டு பயிர் காலவரிசை உருவாக்கப்படுகிறது...',
  },
  te: {
    title: 'డైనమిక్ పంట క్యాలెండర్',
    subtitle: 'ఈ టైమ్‌లైన్ మీ విత్తన తేదీ, పంట, స్థానం మరియు ప్రస్తుత వాతావరణానికి అనుగుణంగా మారుతుంది.',
    downloaded: 'డౌన్‌లోడ్ అయింది',
    export: 'CSV ఎగుమతి',
    crop: 'పంట',
    sowingDate: 'విత్తన తేది',
    location: 'స్థానం',
    language: 'భాష',
    apply: 'వర్తించు',
    progressOverview: 'పురోగతి అవలోకనం',
    seasonProgress: 'సీజన్ పురోగతి',
    weatherLoading: 'వాతావరణ ఆధారిత సూచన రూపొందుతోంది...',
    activeStage: 'సక్రియ దశ',
    noActiveStage: 'ప్రస్తుతం సక్రియ దశ లేదు. రాబోయే దశలు క్రింద ఉన్నాయి.',
    actionPanel: 'చర్యల సలహా',
    actionSubtitle: 'ప్రస్తుత పంట చక్రం ఆధారంగా ఇప్పుడు చేయాల్సిన పని',
    seasonCompleted: 'సీజన్ పూర్తైంది',
    seasonActive: 'సీజన్ కొనసాగుతోంది',
    seasonUpcoming: 'సీజన్ ఇంకా ప్రారంభం కాలేదు',
    loading: 'డైనమిక్ పంట టైమ్‌లైన్ నిర్మించబడుతోంది...',
  },
};

const STAGE_TRANSLATIONS: Record<string, Partial<Record<AppLanguage, string>>> = {
  'Soil Preparation': { hi: 'मिट्टी की तैयारी', mr: 'मातीची तयारी', ta: 'மண் தயாரிப்பு', te: 'నేల సిద్ధం' },
  Sowing: { hi: 'बुवाई', mr: 'पेरणी', ta: 'விதைப்பு', te: 'విత్తడం' },
  'CRI Irrigation': { hi: 'सीआरआई सिंचाई', mr: 'सीआरआय सिंचन', ta: 'CRI பாசனம்', te: 'CRI నీరుపారుదల' },
  'Top Dressing': { hi: 'टॉप ड्रेसिंग', mr: 'टॉप ड्रेसिंग', ta: 'மேல் உரமிடல்', te: 'టాప్ డ్రెస్సింగ్' },
  Flowering: { hi: 'फूल आने का चरण', mr: 'फुलोरा टप्पा', ta: 'மலர்ச்சி நிலை', te: 'పుష్పించే దశ' },
  Harvesting: { hi: 'कटाई', mr: 'कापणी', ta: 'அறுவடை', te: 'కోత' },
};

const STATUS_TRANSLATIONS: Record<CalendarStage['status'], Partial<Record<AppLanguage, string>>> = {
  completed: { hi: 'पूर्ण', mr: 'पूर्ण', ta: 'முடிந்தது', te: 'పూర్తైంది' },
  active: { hi: 'सक्रिय', mr: 'सक्रिय', ta: 'செயலில்', te: 'సక్రియ' },
  upcoming: { hi: 'आगामी', mr: 'आगामी', ta: 'வரவிருக்கும்', te: 'రాబోయేది' },
};

function translateUi(language: AppLanguage, key: string): string {
  return UI_TEXT[language]?.[key] ?? UI_TEXT.en[key] ?? key;
}

function translateStage(stage: string, language: AppLanguage): string {
  if (language === 'en') {
    return stage;
  }
  return STAGE_TRANSLATIONS[stage]?.[language] ?? stage;
}

function translateStatus(status: CalendarStage['status'], language: AppLanguage): string {
  if (language === 'en') {
    return status;
  }
  return STATUS_TRANSLATIONS[status]?.[language] ?? status;
}

function localizeSentence(text: string, language: AppLanguage): string {
  if (language === 'en') {
    return text;
  }

  const replacements: Partial<Record<AppLanguage, Array<[string, string]>>> = {
    hi: [
      ['Current', 'वर्तमान'],
      ['cycle is complete', 'चक्र पूर्ण हो चुका है'],
      ['Prepare land and inputs', 'भूमि और इनपुट तैयार करें'],
      ['Review yield, cost, and pest records', 'उपज, लागत और कीट रिकॉर्ड की समीक्षा करें'],
      ['Focus now', 'अभी ध्यान दें'],
      ['Next stage', 'अगला चरण'],
      ['Weather is mostly favorable this week', 'इस सप्ताह मौसम अधिकांशतः अनुकूल है'],
      ['Rain probability is high', 'बारिश की संभावना अधिक है'],
      ['High temperature window expected', 'उच्च तापमान का दौर अपेक्षित है'],
      ['Updated', 'अपडेट'],
      ['No upcoming stage remains in this cycle.', 'इस चक्र में आगे कोई चरण शेष नहीं है।'],
    ],
    mr: [
      ['Current', 'सध्याचा'],
      ['cycle is complete', 'चक्र पूर्ण झाले आहे'],
      ['Prepare land and inputs', 'जमीन आणि इनपुट तयार करा'],
      ['Review yield, cost, and pest records', 'उत्पादन, खर्च आणि किड नोंदी तपासा'],
      ['Focus now', 'आत्ता लक्ष द्या'],
      ['Next stage', 'पुढचा टप्पा'],
      ['Weather is mostly favorable this week', 'या आठवड्यात हवामान बहुतांश अनुकूल आहे'],
      ['Rain probability is high', 'पावसाची शक्यता जास्त आहे'],
      ['High temperature window expected', 'उच्च तापमानाचा कालावधी अपेक्षित आहे'],
      ['Updated', 'अद्ययावत'],
      ['No upcoming stage remains in this cycle.', 'या चक्रात पुढील टप्पा शिल्लक नाही.'],
    ],
    ta: [
      ['Current', 'தற்போதைய'],
      ['cycle is complete', 'சுற்று முடிந்துள்ளது'],
      ['Prepare land and inputs', 'நிலம் மற்றும் உள்ளீடுகளை தயாரிக்கவும்'],
      ['Review yield, cost, and pest records', 'விளைச்சல், செலவு, பூச்சி பதிவுகளை பரிசீலிக்கவும்'],
      ['Focus now', 'இப்போது கவனம்'],
      ['Next stage', 'அடுத்த நிலை'],
      ['Weather is mostly favorable this week', 'இந்த வாரம் வானிலை பெரும்பாலும் சாதகமாக உள்ளது'],
      ['Rain probability is high', 'மழை வாய்ப்பு அதிகம்'],
      ['High temperature window expected', 'உயர் வெப்பநிலை நிலை எதிர்பார்க்கப்படுகிறது'],
      ['Updated', 'புதுப்பிப்பு'],
      ['No upcoming stage remains in this cycle.', 'இந்த சுற்றில் அடுத்த நிலை இல்லை.'],
    ],
    te: [
      ['Current', 'ప్రస్తుత'],
      ['cycle is complete', 'చక్రం పూర్తైంది'],
      ['Prepare land and inputs', 'భూమి మరియు ఇన్‌పుట్‌లను సిద్ధం చేయండి'],
      ['Review yield, cost, and pest records', 'దిగుబడి, ఖర్చు, పురుగు రికార్డులను సమీక్షించండి'],
      ['Focus now', 'ఇప్పుడే దృష్టి'],
      ['Next stage', 'తదుపరి దశ'],
      ['Weather is mostly favorable this week', 'ఈ వారం వాతావరణం ఎక్కువగా అనుకూలంగా ఉంది'],
      ['Rain probability is high', 'వర్షం అవకాశం ఎక్కువగా ఉంది'],
      ['High temperature window expected', 'అధిక ఉష్ణోగ్రత పరిస్థితి ఆశించబడుతోంది'],
      ['Updated', 'నవీకరణ'],
      ['No upcoming stage remains in this cycle.', 'ఈ చక్రంలో తరువాత దశ మిగలలేదు.'],
    ],
  };

  let localized = text;
  for (const [from, to] of replacements[language] ?? []) {
    localized = localized.replaceAll(from, to);
  }
  return localized;
}

function progressClass(percent: number) {
  if (percent >= 90) return 'w-full';
  if (percent >= 75) return 'w-10/12';
  if (percent >= 60) return 'w-8/12';
  if (percent >= 45) return 'w-6/12';
  if (percent >= 30) return 'w-4/12';
  return 'w-3/12';
}

function statusClass(status: CalendarStage['status']) {
  if (status === 'completed') {
    return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300';
  }
  if (status === 'active') {
    return 'bg-primary text-white';
  }
  return 'bg-muted text-muted-foreground';
}

export default function CalendarPage() {
  const { profile } = useFarmProfile();
  const primaryCrop = getPrimaryCrop(profile);
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [crop, setCrop] = useState(primaryCrop?.name || 'Wheat');
  const [location, setLocation] = useState(profile.location || 'Nagpur');
  const [locationInput, setLocationInput] = useState(profile.location || 'Nagpur');
  const [sowingDate, setSowingDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<CalendarSnapshot | null>(null);
  const [csvDownloaded, setCsvDownloaded] = useState(false);

  const loadCalendar = async (targetCrop: string, targetSowingDate: string, targetLocation: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/dashboard/calendar?crop=${encodeURIComponent(targetCrop)}&sowingDate=${encodeURIComponent(targetSowingDate)}&location=${encodeURIComponent(targetLocation)}`
      );
      if (!response.ok) {
        throw new Error('Unable to load crop calendar right now.');
      }

      const payload = (await response.json()) as CalendarSnapshot;
      setData(payload);
      setLocation(targetLocation);
      setSowingDate(payload.sowingDate);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load dynamic crop calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialCrop = primaryCrop?.name || 'Wheat';
    const initialLocation = profile.location || 'Nagpur';
    const parsedPlantedDate = primaryCrop?.planted ? new Date(primaryCrop.planted) : null;
    const initialSowingDate =
      parsedPlantedDate && !Number.isNaN(parsedPlantedDate.getTime())
        ? parsedPlantedDate.toISOString().slice(0, 10)
        : '';

    setCrop(initialCrop);
    setLocation(initialLocation);
    setLocationInput(initialLocation);
    if (initialSowingDate) {
      setSowingDate(initialSowingDate);
    }

    loadCalendar(initialCrop, initialSowingDate, initialLocation);
  }, [primaryCrop?.name, primaryCrop?.planted, profile.location]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadCalendar(crop, sowingDate, locationInput.trim() || 'Nagpur');
    }, 3 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, [crop, sowingDate, locationInput]);

  const activeStage = useMemo(() => {
    return data?.stages.find((stage) => stage.status === 'active') ?? null;
  }, [data]);

  const sowingStage = data?.stages.find(s => s.stage.toLowerCase().includes('sowing') || s.stage.toLowerCase().includes('planting'));
  const fertilizerStage = data?.stages.find(s => s.stage.toLowerCase().includes('dressing') || s.stage.toLowerCase().includes('fertilizer'));
  const harvestStage = data?.stages.find(s => s.stage.toLowerCase().includes('harvest'));
  const availableCrops = useMemo(() => Array.from(new Set([crop, ...CROPS])), [crop]);

  const handleExportCsv = () => {
    if (!data) {
      return;
    }

    const lines = [
      'Crop,Stage,Start Date,End Date,Status,Recommendation',
      ...data.stages.map(
        (stage) =>
          `"${data.crop}","${stage.stage}","${stage.startDate}","${stage.endDate}","${stage.status}","${stage.recommendation.replace(/"/g, "'")}"`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${data.crop.replace(/[^a-z0-9]/gi, '_')}_dynamic_calendar.csv`;
    anchor.click();
    URL.revokeObjectURL(url);

    setCsvDownloaded(true);
    setTimeout(() => setCsvDownloaded(false), 2200);
  };

  return (
    <div className="min-h-screen space-y-8 bg-muted/5 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
            <CalendarIcon className="h-8 w-8 text-primary" />
            {translateUi(language, 'title')}
          </h1>
          <p className="mt-2 text-muted-foreground">{translateUi(language, 'subtitle')}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Languages className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              title={translateUi(language, 'language')}
              value={language}
              onChange={(event) => setLanguage(event.target.value as AppLanguage)}
              className="h-11 rounded-xl border border-border bg-white pl-9 pr-3 text-sm font-semibold text-foreground shadow-sm transition dark:bg-card"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted dark:bg-card"
          >
            <Download className="h-4 w-4" />
            {csvDownloaded ? translateUi(language, 'downloaded') : translateUi(language, 'export')}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-card">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Farm Sync</p>
            <p className="text-sm text-muted-foreground">
              This timeline opens with {primaryCrop?.name || crop} in {profile.location || location}. Update plots in My Farm and the seasonal plan follows automatically.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {profile.soilType}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-card md:grid-cols-4">
        <div>
          <label htmlFor="calendar-crop" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {translateUi(language, 'crop')}
          </label>
          <select
            id="calendar-crop"
            value={crop}
            onChange={(event) => setCrop(event.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium"
          >
            {availableCrops.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="calendar-sowing" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {translateUi(language, 'sowingDate')}
          </label>
          <input
            id="calendar-sowing"
            type="date"
            value={sowingDate}
            onChange={(event) => setSowingDate(event.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="calendar-location" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {translateUi(language, 'location')}
          </label>
          <div className="flex gap-2">
            <div className="relative grow">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="calendar-location"
                type="text"
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm"
                placeholder={translateUi(language, 'location')}
              />
            </div>
            <button
              type="button"
              onClick={() => loadCalendar(crop, sowingDate, locationInput.trim() || 'Nagpur')}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {translateUi(language, 'apply')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {POPULAR_LOCATIONS.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => {
              setLocationInput(city);
              loadCalendar(crop, sowingDate, city);
            }}
            className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground dark:bg-card"
          >
            {city}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{translateUi(language, 'progressOverview')}</p>
            <h2 className="text-xl font-bold text-foreground">{data?.crop ?? crop}</h2>
            <p className="text-sm text-muted-foreground">{translateUi(language, 'location')}: {data?.location ?? location}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-primary">{data?.progressPercent ?? 0}%</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{translateUi(language, 'seasonProgress')}</p>
          </div>
        </div>

        <div className="h-3 rounded-full bg-muted/40">
          <div className={`h-3 rounded-full bg-primary ${progressClass(data?.progressPercent ?? 0)}`} />
        </div>

        <p className="mt-3 text-sm text-muted-foreground">{localizeSentence(data?.weatherNote ?? translateUi(language, 'weatherLoading'), language)}</p>
        <p className="mt-2 text-sm font-medium text-foreground">
          {activeStage
            ? `${translateUi(language, 'activeStage')}: ${translateStage(activeStage.stage, language)}`
            : translateUi(language, 'noActiveStage')}
        </p>
      </div>

      {data && (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900/30 dark:bg-blue-900/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
                <Tractor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-blue-900 dark:text-blue-300">Sowing Reminder</h3>
            </div>
            {sowingStage ? (
              <>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{sowingStage.startDate}</p>
                <p className="text-sm text-blue-600/80 dark:text-blue-300/70 mt-1 line-clamp-2">{sowingStage.recommendation}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/50 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  <BellRing className="h-3 w-3" /> {sowingStage.status === 'completed' ? 'Completed' : 'Upcoming'}
                </div>
              </>
            ) : (
              <p className="text-sm text-blue-600/80 dark:text-blue-300/70">No specific sowing data for this crop.</p>
            )}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/30 dark:bg-amber-900/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg">
                <Droplets className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-bold text-amber-900 dark:text-amber-300">Fertilizer Schedule</h3>
            </div>
            {fertilizerStage ? (
              <>
                <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{fertilizerStage.startDate}</p>
                <p className="text-sm text-amber-600/80 dark:text-amber-300/70 mt-1 line-clamp-2">{fertilizerStage.recommendation}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-900/50 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  <BellRing className="h-3 w-3" /> {fertilizerStage.status === 'completed' ? 'Applied' : 'Upcoming'}
                </div>
              </>
            ) : (
              <p className="text-sm text-amber-600/80 dark:text-amber-300/70">Check main timeline for details.</p>
            )}
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg">
                <Sprout className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-green-900 dark:text-green-300">Harvest Reminder</h3>
            </div>
            {harvestStage ? (
              <>
                <p className="text-2xl font-black text-green-700 dark:text-green-400">{harvestStage.startDate}</p>
                <p className="text-sm text-green-600/80 dark:text-green-300/70 mt-1 line-clamp-2">{harvestStage.recommendation}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-900/50 text-xs font-semibold text-green-700 dark:text-green-300">
                  <BellRing className="h-3 w-3" /> {harvestStage.status === 'completed' ? 'Done' : 'Target Date'}
                </div>
              </>
            ) : (
              <p className="text-sm text-green-600/80 dark:text-green-300/70">Date will be calculated automatically.</p>
            )}
          </div>
        </div>
      )}

      {data?.actionPlan?.length ? (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">{translateUi(language, 'actionPanel')}</h3>
              <p className="text-sm text-muted-foreground">{translateUi(language, 'actionSubtitle')}</p>
            </div>
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {data.seasonStatus === 'completed'
                ? translateUi(language, 'seasonCompleted')
                : data.seasonStatus === 'active'
                  ? translateUi(language, 'seasonActive')
                  : translateUi(language, 'seasonUpcoming')}
            </span>
          </div>

          <div className="space-y-2">
            {data.actionPlan.map((item, index) => (
              <p key={`${item}-${index}`} className="rounded-lg bg-muted/30 px-3 py-2 text-sm text-foreground">
                {index + 1}. {localizeSentence(item, language)}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-border bg-white dark:bg-card">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {translateUi(language, 'loading')}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {(data?.stages ?? []).map((stage) => (
            <div key={stage.id} className="rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-card">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Sprout className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{translateStage(stage.stage, language)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {stage.startDate} to {stage.endDate}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(stage.status)}`}>
                  {translateStatus(stage.status, language)}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{localizeSentence(stage.recommendation, language)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
