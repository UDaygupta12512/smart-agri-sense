'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Mic, MicOff, X, Volume2, VolumeX, Globe, Sparkles, Wheat, Bug, TrendingUp, CloudSun, MessageCircle, Loader2, Activity, Share2, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { getVoiceLanguageCode, persistSiteLanguage, readSiteLanguage } from '@/lib/siteLanguage';
import { motion, AnimatePresence } from 'framer-motion';
import { buildFarmingKnowledgeAnswer, type SupportedLanguageCode as FarmingLangCode } from '@/lib/farmingKnowledgeAnswer';
import { createClient } from '@/utils/supabase/client';

type SupportedLanguageCode = FarmingLangCode;

interface LanguageConfig {
    code: SupportedLanguageCode;
    name: string;
    greeting: string;
}

interface VoiceUiCopy {
    title: string;
    subtitle: string;
    tapToAsk: string;
    typeToAsk: string;
    send: string;
    listening: string;
    processing: string;
    lastQuestion: string;
    answer: string;
    tryTopics: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

async function getAIResponse(query: string, langCode: SupportedLanguageCode, history: ChatMessage[] = [], location: string | null = null, signal?: AbortSignal): Promise<string> {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal,
            body: JSON.stringify({ message: query, language: langCode, history, location }),
        });

        const data = await response.json().catch(() => ({}));
        const apiText = typeof data?.response === 'string' ? data.response.trim() : '';

        if (apiText) {
            return apiText;
        }

        if (!response.ok) {
            throw new Error(typeof data?.error === 'string' ? data.error : 'API request failed');
        }

        return buildFarmingKnowledgeAnswer(query, langCode);
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }
        console.error('Error fetching AI response:', error);
        return buildFarmingKnowledgeAnswer(query, langCode);
    }
}

interface MinimalSpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    [index: number]: { transcript: string; confidence?: number };
}

interface MinimalSpeechRecognitionEvent {
    results: ArrayLike<MinimalSpeechRecognitionResult>;
    resultIndex?: number;
}

interface MinimalSpeechRecognitionErrorEvent {
    error: string;
}

interface MinimalSpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives?: number;
    onstart?: (() => void) | null;
    onresult: ((event: MinimalSpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: MinimalSpeechRecognitionErrorEvent) => void) | null;
    start: () => void;
    stop: () => void;
    abort?: () => void;
}

type SpeechRecognitionConstructor = new () => MinimalSpeechRecognition;

const languages: LanguageConfig[] = [
    { code: 'en-IN', name: 'English', greeting: 'Hello! I am your Agri Assistant. Ask me anything about crops, weather, pests, or prices.' },
    { code: 'hi-IN', name: 'हिंदी', greeting: 'नमस्ते! मैं आपका कृषि सहायक हूं। आप फसल, मौसम, कीट या बाजार से जुड़ा कोई भी सवाल पूछ सकते हैं।' },
    { code: 'bn-IN', name: 'বাংলা', greeting: 'নমস্কার! আমি আপনার কৃষি সহায়ক। ফসল, আবহাওয়া, পোকা বা বাজার নিয়ে প্রশ্ন করুন।' },
    { code: 'kn-IN', name: 'ಕನ್ನಡ', greeting: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ. ಬೆಳೆ, ಹವಾಮಾನ, ಕೀಟ ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಬಗ್ಗೆ ಕೇಳಿ.' },
    { code: 'ml-IN', name: 'മലയാളം', greeting: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ കൃഷി സഹായി. വിള, കാലാവസ്ഥ, കീടങ്ങൾ, വില എന്നീ വിഷയങ്ങൾ ചോദിക്കാം.' },
    { code: 'ta-IN', name: 'தமிழ்', greeting: 'வணக்கம்! நான் உங்கள் வேளாண் உதவியாளர். பயிர், வானிலை, பூச்சி, சந்தை விலை குறித்து கேளுங்கள்.' },
    { code: 'te-IN', name: 'తెలుగు', greeting: 'నమస్కారం! నేను మీ వ్యవసాయ సహాయకుడిని. పంట, వాతావరణం, పురుగులు, మార్కెట్ ధరలపై అడగండి.' },
];

const VOICE_UI: Partial<Record<SupportedLanguageCode, VoiceUiCopy>> = {
    'en-IN': {
        title: 'Voice Farmer Q&A',
        subtitle: 'Ask by voice, get answer in voice',
        tapToAsk: 'Tap mic and ask your farming query',
        typeToAsk: 'Or type your farming query',
        send: 'Send',
        listening: 'Listening...',
        processing: 'Generating your advisory...',
        lastQuestion: 'Your Question',
        answer: 'Voice Answer',
        tryTopics: 'Try quick voice topics',
    },
    'hi-IN': {
        title: 'वॉइस किसान प्रश्नोत्तर',
        subtitle: 'आवाज़ में पूछें, आवाज़ में उत्तर पाएं',
        tapToAsk: 'माइक दबाकर अपना कृषि सवाल पूछें',
        typeToAsk: 'या अपना कृषि प्रश्न लिखें',
        send: 'भेजें',
        listening: 'सुन रहा हूँ...',
        processing: 'आपके लिए सलाह तैयार की जा रही है...',
        lastQuestion: 'आपका प्रश्न',
        answer: 'वॉइस उत्तर',
        tryTopics: 'त्वरित वॉइस विषय आज़माएं',
    },
    'ta-IN': {
        title: 'குரல் விவசாய கேள்வி-பதில்',
        subtitle: 'குரலில் கேளுங்கள், குரலில் பதில் பெறுங்கள்',
        tapToAsk: 'மைக்கை தட்டி உங்கள் விவசாய கேள்வியை கேளுங்கள்',
        typeToAsk: 'அல்லது உங்கள் விவசாய கேள்வியை தட்டச்சு செய்யுங்கள்',
        send: 'அனுப்பு',
        listening: 'கேட்கப்படுகிறது...',
        processing: 'உங்கள் ஆலோசனை தயாராகிறது...',
        lastQuestion: 'உங்கள் கேள்வி',
        answer: 'குரல் பதில்',
        tryTopics: 'விரைவு குரல் தலைப்புகள்',
    },
    'te-IN': {
        title: 'వాయిస్ రైతు ప్రశ్నోత్తరాలు',
        subtitle: 'మాట్లాడి అడగండి, వాయిస్‌లో సమాధానం పొందండి',
        tapToAsk: 'మైక్ నొక్కి మీ వ్యవసాయ ప్రశ్న అడగండి',
        typeToAsk: 'లేదా మీ వ్యవసాయ ప్రశ్నను టైప్ చేయండి',
        send: 'పంపండి',
        listening: 'వింటోంది...',
        processing: 'మీ సలహా సిద్ధం అవుతోంది...',
        lastQuestion: 'మీ ప్రశ్న',
        answer: 'వాయిస్ సమాధానం',
        tryTopics: 'త్వరిత వాయిస్ అంశాలు',
    },
};

function getVoiceUiCopy(langCode: SupportedLanguageCode): VoiceUiCopy {
    return VOICE_UI[langCode] ?? VOICE_UI['en-IN']!;
}

const QUICK_TOPIC_TEMPLATES: Array<{
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    labels: Partial<Record<SupportedLanguageCode, string>>;
    queries: Partial<Record<SupportedLanguageCode, string>>;
}> = [
    {
        id: 'fertilizer',
        icon: Wheat,
        labels: {
            'en-IN': 'Fertilizer Plan',
            'hi-IN': 'खाद योजना',
            'ta-IN': 'உர திட்டம்',
            'te-IN': 'ఎరువు ప్రణాళిక',
        },
        queries: {
            'en-IN': 'What fertilizer schedule should I follow for rice?',
            'hi-IN': 'धान के लिए सही खाद शेड्यूल क्या है?',
            'ta-IN': 'நெற்கான உர அட்டவணை என்ன?',
            'te-IN': 'వరికి సరైన ఎరువు షెడ్యూల్ ఏమిటి?',
        },
    },
    {
        id: 'pest',
        icon: Bug,
        labels: {
            'en-IN': 'Pest Control',
            'hi-IN': 'कीट नियंत्रण',
            'ta-IN': 'பூச்சி கட்டுப்பு',
            'te-IN': 'పురుగు నియంత్రణ',
        },
        queries: {
            'en-IN': 'How do I control sucking pests in cotton?',
            'hi-IN': 'कपास में चूसक कीटों को कैसे नियंत्रित करें?',
            'ta-IN': 'பருத்தியில் சுரக்கும் பூச்சிகளை எப்படி கட்டுப்படுத்துவது?',
            'te-IN': 'పత్తిలో సక్కింగ్ పురుగులను ఎలా నియంత్రించాలి?',
        },
    },
    {
        id: 'market',
        icon: TrendingUp,
        labels: {
            'en-IN': 'Market Prices',
            'hi-IN': 'बाजार भाव',
            'ta-IN': 'சந்தை விலை',
            'te-IN': 'మార్కెట్ ధరలు',
        },
        queries: {
            'en-IN': 'What are today\'s mandi prices for wheat and rice?',
            'hi-IN': 'आज गेहूं और धान के मंडी भाव क्या हैं?',
            'ta-IN': 'இன்று கோதுமை, நெல் சந்தை விலை என்ன?',
            'te-IN': 'ఈరోజు గోధుమ, వరి మండీ ధరలు ఏమిటి?',
        },
    },
    {
        id: 'weather',
        icon: CloudSun,
        labels: {
            'en-IN': 'Weather Advisory',
            'hi-IN': 'मौसम सलाह',
            'ta-IN': 'வானிலை ஆலோசனை',
            'te-IN': 'వాతావరణ సలహా',
        },
        queries: {
            'en-IN': 'Give me a weather-based spray and irrigation advisory.',
            'hi-IN': 'मौसम के आधार पर छिड़काव और सिंचाई की सलाह दें।',
            'ta-IN': 'வானிலையை வைத்து தெளிப்பு மற்றும் பாசன ஆலோசனை கூறுங்கள்.',
            'te-IN': 'వాతావరణం ఆధారంగా స్ప్రే, నీటి పారుదల సలహా ఇవ్వండి.',
        },
    },
];

function getQuickTopics(langCode: SupportedLanguageCode) {
    return QUICK_TOPIC_TEMPLATES.map((topic) => ({
        id: topic.id,
        icon: topic.icon,
        label: topic.labels[langCode] ?? topic.labels['en-IN'] ?? 'Advisory Topic',
        query: topic.queries[langCode] ?? topic.queries['en-IN'] ?? 'Share a practical crop advisory.',
    }));
}

export default function VoiceAssistant({
    variant = 'floating',
    defaultOpen = false,
}: {
    variant?: 'floating' | 'embedded';
    defaultOpen?: boolean;
} = {}) {
    const pathname = usePathname();
    const isEmbedded = variant === 'embedded';

    const [isOpen, setIsOpen] = useState(isEmbedded || defaultOpen);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLang, setSelectedLang] = useState(() => {
        const siteLang = readSiteLanguage();
        const voiceCode = getVoiceLanguageCode(siteLang) as SupportedLanguageCode;
        return languages.find((lang) => lang.code === voiceCode) ?? languages[0];
    });
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [lastQuestion, setLastQuestion] = useState('');
    const [lastAnswer, setLastAnswer] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [savedAdvisories, setSavedAdvisories] = useState<{q: string, a: string}[]>([]);
    const [viewSaved, setViewSaved] = useState(false);
    const [manualQuery, setManualQuery] = useState('');
    const [speechError, setSpeechError] = useState('');
    const [speechSupported, setSpeechSupported] = useState(true);

    const voiceUi = getVoiceUiCopy(selectedLang.code);

    const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
    const noSpeechRetryRef = useRef(0);
    const networkRetryRef = useRef(0);
    const lastSpeechErrorRef = useRef<MinimalSpeechRecognitionErrorEvent['error'] | null>(null);
    const isOpenRef = useRef(isOpen);
    const shouldListenRef = useRef(false);
    const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const finalizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const requestAbortRef = useRef<AbortController | null>(null);
    const handleUserMessageRef = useRef<(text: string) => void>(() => {});
    const finalTranscriptRef = useRef('');
    const answerEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const loadHistory = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('chat_history')
                    .select('*')
                    .order('created_at', { ascending: true });
                
                if (!error && data) {
                    const loadedHistory: ChatMessage[] = [];
                    data.forEach((row: any) => {
                        loadedHistory.push({ role: 'user', content: row.message });
                        loadedHistory.push({ role: 'assistant', content: row.response });
                    });
                    setChatHistory(loadedHistory);
                    
                    if (data.length > 0) {
                        const lastRow = data[data.length - 1];
                        setLastQuestion(lastRow.message);
                        setLastAnswer(lastRow.response);
                    }
                }
            }
        };
        loadHistory();
    }, []);

    const clearRetryTimer = () => {
        if (retryTimerRef.current) {
            clearTimeout(retryTimerRef.current);
            retryTimerRef.current = null;
        }
    };

    const clearFinalizeTimer = () => {
        if (finalizeTimerRef.current) {
            clearTimeout(finalizeTimerRef.current);
            finalizeTimerRef.current = null;
        }
    };

    // Initialize speech recognition and synthesis
    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    useEffect(() => {
        const saved = localStorage.getItem('agri_saved_advisories');
        if (saved) {
            try {
                setSavedAdvisories(JSON.parse(saved));
            } catch (e) {
                // ignore
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Check for speech recognition support
            const speechWindow = window as Window & {
                SpeechRecognition?: SpeechRecognitionConstructor;
                webkitSpeechRecognition?: SpeechRecognitionConstructor;
            };

            const SpeechRecognitionImpl = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
            if (SpeechRecognitionImpl) {
                recognitionRef.current = new SpeechRecognitionImpl();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.maxAlternatives = 3;

                recognitionRef.current.onstart = () => {
                    setSpeechError('');
                    setIsListening(true);
                    lastSpeechErrorRef.current = null;
                };

                recognitionRef.current.onresult = (event: MinimalSpeechRecognitionEvent) => {
                    const resultsLength = event.results?.length ?? 0;
                    const startIndex = typeof event.resultIndex === 'number' ? event.resultIndex : 0;
                    let hasFinal = false;

                    for (let i = startIndex; i < resultsLength; i += 1) {
                        const result = event.results[i];
                        const part = result?.[0]?.transcript?.trim();
                        if (!part) {
                            continue;
                        }
                        if (result.isFinal) {
                            hasFinal = true;
                            finalTranscriptRef.current = `${finalTranscriptRef.current} ${part}`.trim();
                        }
                    }

                    if (!hasFinal) {
                        return;
                    }

                    // Ignore stale or user-cancelled recognition results.
                    if (!shouldListenRef.current) {
                        return;
                    }

                    clearFinalizeTimer();
                    finalizeTimerRef.current = setTimeout(() => {
                        const transcript = finalTranscriptRef.current.trim();
                        finalTranscriptRef.current = '';

                        if (!transcript) {
                            return;
                        }

                        shouldListenRef.current = false;
                        clearRetryTimer();
                        noSpeechRetryRef.current = 0;
                        setSpeechError('');
                        try {
                            recognitionRef.current?.stop();
                        } catch {
                            // Ignore stop race errors.
                        }
                        handleUserMessageRef.current(transcript);
                    }, 700);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                    if (shouldListenRef.current && !lastSpeechErrorRef.current) {
                        clearRetryTimer();
                        retryTimerRef.current = setTimeout(() => {
                            if (!shouldListenRef.current || !isOpenRef.current) {
                                setIsListening(false);
                                return;
                            }
                            try {
                                recognitionRef.current?.start();
                                setIsListening(true);
                            } catch {
                                setIsListening(false);
                            }
                        }, 200);
                    }
                };

                recognitionRef.current.onerror = (event: MinimalSpeechRecognitionErrorEvent) => {
                    const errorCode = event.error;
                    lastSpeechErrorRef.current = errorCode;

                    if (errorCode === 'aborted') {
                        return;
                    }

                    if (errorCode === 'no-speech') {
                        if (noSpeechRetryRef.current < 2 && isOpenRef.current && shouldListenRef.current) {
                            noSpeechRetryRef.current += 1;
                            setSpeechError('No voice detected. Please speak closer to the microphone. Retrying...');

                            clearRetryTimer();
                            retryTimerRef.current = setTimeout(() => {
                                if (!shouldListenRef.current || !isOpenRef.current) {
                                    setIsListening(false);
                                    return;
                                }
                                try {
                                    recognitionRef.current?.start();
                                } catch {
                                    setIsListening(false);
                                }
                            }, 250);
                            return;
                        }

                        setSpeechError('No voice detected. Tap mic and speak clearly in a quiet place.');
                        return;
                    }

                    if (errorCode === 'not-allowed' || errorCode === 'service-not-allowed') {
                        setSpeechError('Microphone permission is blocked. Please allow mic access in browser settings.');
                        shouldListenRef.current = false;
                        clearFinalizeTimer();
                        finalTranscriptRef.current = '';
                        return;
                    }

                    if (errorCode === 'audio-capture') {
                        setSpeechError('No microphone was detected. Please connect a mic and try again.');
                        shouldListenRef.current = false;
                        clearFinalizeTimer();
                        finalTranscriptRef.current = '';
                        return;
                    }

                    if (errorCode === 'network') {
                        if (networkRetryRef.current < 1 && isOpenRef.current && shouldListenRef.current) {
                            networkRetryRef.current += 1;
                            setSpeechError('Speech service is unreachable. Retrying...');

                            clearRetryTimer();
                            retryTimerRef.current = setTimeout(() => {
                                if (!shouldListenRef.current || !isOpenRef.current) {
                                    setIsListening(false);
                                    return;
                                }
                                try {
                                    recognitionRef.current?.start();
                                } catch {
                                    setIsListening(false);
                                }
                            }, 500);
                            return;
                        }

                        setSpeechError('Speech service is offline or blocked. Check internet or firewall, then try again.');
                        setIsListening(false);
                        shouldListenRef.current = false;
                        clearFinalizeTimer();
                        finalTranscriptRef.current = '';
                        return;
                    }

                    setSpeechError(`Speech recognition error: ${errorCode}`);
                    setIsListening(false);
                    shouldListenRef.current = false;
                };
            } else {
                setSpeechSupported(false);
            }

            // Initialize speech synthesis
            synthRef.current = window.speechSynthesis;

            const loadVoices = () => {
                voicesRef.current = window.speechSynthesis.getVoices();
            };

            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            clearRetryTimer();
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    useEffect(() => {
        const handleAppLanguageChange = () => {
            const siteLang = readSiteLanguage();
            const voiceCode = getVoiceLanguageCode(siteLang) as SupportedLanguageCode;
            const next = languages.find((lang) => lang.code === voiceCode) ?? languages[0];
            setSelectedLang(next);
        };

        const handleOpenVoiceAssistant = () => {
            setIsOpen(true);
        };

        window.addEventListener('app-language-change', handleAppLanguageChange);
        window.addEventListener('open-voice-assistant', handleOpenVoiceAssistant);

        return () => {
            window.removeEventListener('app-language-change', handleAppLanguageChange);
            window.removeEventListener('open-voice-assistant', handleOpenVoiceAssistant);
        };
    }, []);

    const toggleModal = () => {
        if (isOpen) {
            requestAbortRef.current?.abort();
            requestAbortRef.current = null;
            setIsLoading(false);
            shouldListenRef.current = false;
            stopListening();
            stopSpeaking();
        }
        setIsOpen(!isOpen);
    };

    const ensureMicrophonePermission = async () => {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            return true;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track) => track.stop());
            return true;
        } catch {
            setSpeechError('Microphone access is required. Please allow permission and try again.');
            return false;
        }
    };

    const startListening = async () => {
        if (recognitionRef.current && !isListening) {
            const hasMicPermission = await ensureMicrophonePermission();
            if (!hasMicPermission) {
                return;
            }

            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(50);
            }

            recognitionRef.current.lang = selectedLang.code;
            shouldListenRef.current = true;
            noSpeechRetryRef.current = 0;
            networkRetryRef.current = 0;
            lastSpeechErrorRef.current = null;
            finalTranscriptRef.current = '';
            setSpeechError('');
            clearRetryTimer();
            clearFinalizeTimer();
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch {
                shouldListenRef.current = false;
                setIsListening(false);
                setSpeechError('Unable to start microphone. Please try again.');
            }
        }
    };

    const stopListening = () => {
        shouldListenRef.current = false;
        clearRetryTimer();
        clearFinalizeTimer();
        noSpeechRetryRef.current = 0;
        networkRetryRef.current = 0;
        finalTranscriptRef.current = '';
        requestAbortRef.current?.abort();
        requestAbortRef.current = null;
        setIsLoading(false);
        stopSpeaking();

        if (recognitionRef.current) {
            try {
                if (recognitionRef.current.abort) {
                    recognitionRef.current.abort();
                } else {
                    recognitionRef.current.stop();
                }
            } catch {
                // Ignore browser abort/stop race errors.
            }
        }

        setIsListening(false);
    };

    const getBestVoiceForLanguage = (langCode: SupportedLanguageCode) => {
        const voices = voicesRef.current;
        if (!voices.length) {
            return undefined;
        }

        const normalizedLang = langCode.toLowerCase();
        const baseLang = normalizedLang.split('-')[0];

        // 1. Try exact match (e.g., hi-in)
        let best = voices.find((voice) => voice.lang.toLowerCase() === normalizedLang);
        
        // 2. Try base lang match (e.g., hi) or regional (e.g., hi-xx)
        if (!best) {
            best = voices.find((voice) => 
                voice.lang.toLowerCase() === baseLang || 
                voice.lang.toLowerCase().startsWith(`${baseLang}-`)
            );
        }

        // 3. Try to find any Google cloud voice for this language as fallback
        if (!best) {
            best = voices.find((voice) => 
                voice.name.toLowerCase().includes('google') && 
                voice.name.toLowerCase().includes(baseLang)
            );
        }

        return best;
    };

    const stopSpeaking = () => {
        if (synthRef.current) {
            synthRef.current.resume();
            synthRef.current.cancel();
        }
        setIsSpeaking(false);
    };

    const speakText = (text: string, attempt = 0) => {
        // Stop any current audio
        stopSpeaking();

        // Refresh voices just in case they loaded late
        if (voicesRef.current.length === 0 && window.speechSynthesis) {
            voicesRef.current = window.speechSynthesis.getVoices();
        }

        if (voicesRef.current.length === 0 && attempt < 3) {
            setTimeout(() => speakText(text, attempt + 1), 300);
            return;
        }

        // Thoroughly clean the text for speech: remove emojis, markdown, special chars
        const cleanText = text
            .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, ' ')
            .replace(/[*#_\[\](){}|`~<>@^\\]/g, ' ')
            .replace(/https?:\/\/\S+/g, ' ')
            .replace(/\d+\.\s/g, ' ')
            .replace(/[\n\r]+/g, '. ')
            .replace(/\s+/g, ' ')
            .trim();

        if (!cleanText) {
            setIsSpeaking(false);
            return;
        }

        // Split text into smaller chunks at sentence boundaries
        const rawChunks = cleanText.match(/[^.!?।:;]+[.!?।:;]*/g) || [cleanText];
        const chunks: string[] = [];

        rawChunks.forEach(chunk => {
            let currentText = chunk.trim();
            while (currentText.length > 0) {
                if (currentText.length <= 120) {
                    if (currentText.length > 1) chunks.push(currentText);
                    break;
                }
                let splitIndex = currentText.lastIndexOf(' ', 120);
                if (splitIndex <= 0) splitIndex = currentText.indexOf(' ', 10);
                if (splitIndex <= 0) splitIndex = 120;
                const part = currentText.substring(0, splitIndex).trim();
                if (part.length > 1) chunks.push(part);
                currentText = currentText.substring(splitIndex).trim();
            }
        });

        if (chunks.length === 0) {
            setIsSpeaking(false);
            return;
        }

        // Find best voice
        const bestVoice = synthRef.current
            ? getBestVoiceForLanguage(selectedLang.code)
            : null;

        if (!synthRef.current) {
            // TTS not available — silently skip, the written answer is always visible
            setIsSpeaking(false);
            return;
        }

        // Chrome workaround: SpeechSynthesis pauses after ~15 seconds.
        // Calling resume() periodically prevents Chrome from auto-pausing.
        // IMPORTANT: Do NOT call pause() before resume() — that causes audible gaps.
        let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

        const startKeepAlive = () => {
            stopKeepAlive();
            keepAliveInterval = setInterval(() => {
                if (synthRef.current && synthRef.current.speaking) {
                    synthRef.current.resume();
                }
            }, 5000);
        };

        const stopKeepAlive = () => {
            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
                keepAliveInterval = null;
            }
        };

        const speakChunksSequentially = (chunkIndex: number) => {
            if (!synthRef.current) {
                stopKeepAlive();
                setIsSpeaking(false);
                return;
            }

            if (chunkIndex >= chunks.length) {
                stopKeepAlive();
                setIsSpeaking(false);
                return;
            }

            const chunkText = chunks[chunkIndex];
            if (!chunkText) {
                speakChunksSequentially(chunkIndex + 1);
                return;
            }

            const utterance = new SpeechSynthesisUtterance(chunkText);
            // Always use the user's selected language for TTS, not the voice's default lang
            utterance.lang = selectedLang.code;
            if (bestVoice) {
                utterance.voice = bestVoice;
            }
            // Lower rate for Indian languages to prevent breaking/rushing, otherwise normal rate
            utterance.rate = selectedLang.code.startsWith('en') ? 1.05 : 0.85;
            utterance.pitch = 1.0;

            utterance.onend = () => {
                speakChunksSequentially(chunkIndex + 1);
            };

            utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
                // These errors are expected during normal user interactions (stopping, switching, etc.)
                const ignorable = ['interrupted', 'canceled', 'cancelled'];
                if (ignorable.includes(e.error)) {
                    stopKeepAlive();
                    setIsSpeaking(false);
                    return;
                }

                // For synthesis-failed or other errors, skip this chunk and try the next one
                console.warn(`TTS chunk ${chunkIndex} error: ${e.error}, skipping to next chunk`);
                speakChunksSequentially(chunkIndex + 1);
            };

            try {
                synthRef.current.resume();
                synthRef.current.speak(utterance);
            } catch {
                // Skip this chunk on exception
                speakChunksSequentially(chunkIndex + 1);
            }
        };

        // Delay to allow synthRef.cancel() to fully reset the browser engine
        setTimeout(() => {
            if (!synthRef.current) {
                setIsSpeaking(false);
                return;
            }
            try {
                synthRef.current.cancel();
                synthRef.current.resume();
            } catch {
                // Ignore resume/cancel errors.
            }
            setIsSpeaking(true);
            startKeepAlive();
            speakChunksSequentially(0);
        }, 150);
    };


    const handleUserMessage = async (text: string) => {
        if (!text.trim()) return;

        // Rate Limiting (API Spam Protection)
        const now = Date.now();
        const rateLimitKey = 'agri_rate_limit';
        let timestamps: number[] = [];
        try {
            timestamps = JSON.parse(localStorage.getItem(rateLimitKey) || '[]');
        } catch { }
        
        // Remove timestamps older than 1 minute
        timestamps = timestamps.filter(t => now - t < 60000);
        
        if (timestamps.length >= 5) {
            setLastAnswer('You have asked too many questions recently. Please wait a minute and try again.');
            return;
        }
        
        timestamps.push(now);
        localStorage.setItem(rateLimitKey, JSON.stringify(timestamps));

        requestAbortRef.current?.abort();
        const controller = new AbortController();
        requestAbortRef.current = controller;

        setLastQuestion(text.trim());
        setManualQuery('');
        setIsLoading(true);

        const cacheKey = `agri_cache_${selectedLang.code}_${text.trim().toLowerCase()}`;
        const cachedAnswer = localStorage.getItem(cacheKey);

        if (cachedAnswer) {
            setLastAnswer(cachedAnswer);
            setChatHistory(prev => [
                ...prev,
                { role: 'user', content: text.trim() },
                { role: 'assistant', content: cachedAnswer }
            ]);
            setIsLoading(false);
            
            setTimeout(() => {
                answerEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 100);
            speakText(cachedAnswer);
            return;
        }

        // Get location
        let locationStr = null;
        if (navigator.geolocation) {
            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
                });
                locationStr = `${pos.coords.latitude},${pos.coords.longitude}`;
            } catch (e) {
                // ignore
            }
        }

        // Get AI response
        try {
            // Keep history limited to last 4 messages (2 exchanges) to save tokens
            const recentHistory = chatHistory.slice(-4);
            const response = await getAIResponse(text.trim(), selectedLang.code, recentHistory, locationStr, controller.signal);

            if (!isOpenRef.current) {
                return;
            }

            setLastAnswer(response);
            localStorage.setItem(cacheKey, response);
            setChatHistory(prev => [
                ...prev,
                { role: 'user', content: text.trim() },
                { role: 'assistant', content: response }
            ]);

            // Auto-scroll to show the written answer
            setTimeout(() => {
                answerEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 100);

            // Auto-speak response
            speakText(response);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }
            console.error('Error getting response:', error);
            setSpeechError('Unable to get advisory right now. Please try again.');
        } finally {
            if (requestAbortRef.current === controller) {
                requestAbortRef.current = null;
            }
            setIsLoading(false);
        }
    };

    const handleQuickTopic = (topic: ReturnType<typeof getQuickTopics>[number]) => {
        handleUserMessage(topic.query);
    };

    // Keep ref in sync so speech recognition callback always uses latest handler
    handleUserMessageRef.current = handleUserMessage;

    const changeLanguage = (lang: typeof languages[0]) => {
        setSelectedLang(lang);
        setShowLangMenu(false);

        setLastQuestion('');
        setLastAnswer('');
        setChatHistory([]);
        setManualQuery('');
    };

    const handleManualSubmit = () => {
        const question = manualQuery.trim();
        if (!question) {
            return;
        }
        handleUserMessage(question);
    };

    const shareToWhatsApp = () => {
        if (!lastAnswer || !lastQuestion) return;
        const text = `*Query:* ${lastQuestion}\n\n*Agri-Sense AI:* ${lastAnswer}\n\n_Shared from Farmers Advisory System_`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const saveAdvisory = () => {
        if (!lastAnswer || !lastQuestion) return;
        const newSaved = [...savedAdvisories, { q: lastQuestion, a: lastAnswer }];
        setSavedAdvisories(newSaved);
        localStorage.setItem('agri_saved_advisories', JSON.stringify(newSaved));
    };

    const isCurrentSaved = savedAdvisories.some(s => s.q === lastQuestion && s.a === lastAnswer);

    const localizedQuickTopics = getQuickTopics(selectedLang.code);

    // Hide the floating FAB on the dedicated voice-assistant page to avoid duplication
    const shouldHide = pathname === '/dashboard/voice-assistant' && !isEmbedded;
    if (shouldHide) {
        return null;
    }

    const panelClassName = isEmbedded
        ? 'w-full bg-white dark:bg-card rounded-2xl border border-border overflow-hidden flex flex-col min-h-[520px] max-h-[75vh] notranslate'
        : 'fixed bottom-24 right-6 z-50 w-[360px] md:w-[420px] bg-white dark:bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col max-h-[600px] notranslate';

    return (
        <>
            {!isEmbedded && (
                <button
                    onClick={toggleModal}
                    className="fixed bottom-6 right-6 z-50 h-16 w-16 bg-linear-to-tr from-primary to-emerald-500 rounded-full shadow-[0_4px_25px_rgba(34,197,94,0.5)] flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 group notranslate"
                    aria-label="Open Voice Assistant"
                >
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75"></div>
                    <div className="absolute inset-1 rounded-full border-2 border-white/30"></div>
                    <MessageCircle className="h-7 w-7 relative z-10 group-hover:scale-110 transition-transform" />
                </button>
            )}

            {(isOpen || isEmbedded) && (
                <div className={panelClassName}>
                    {/* Header */}
                    <div className="bg-linear-to-r from-primary to-emerald-500 p-4 text-white">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Kisan Sahayak</h3>
                                    <p className="text-xs text-white/80">Your Digital Agricultural Officer</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Language Selector */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowLangMenu(!showLangMenu)}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1 text-sm"
                                        aria-label="Change assistant language"
                                        title="Change assistant language"
                                    >
                                        <Globe className="h-4 w-4" />
                                        <span className="hidden md:inline">{selectedLang.name}</span>
                                    </button>

                                    {showLangMenu && (
                                        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-card rounded-xl shadow-xl border border-border overflow-hidden min-w-[140px] z-50 animate-in fade-in slide-in-from-top-2">
                                            {languages.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => changeLanguage(lang)}
                                                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 ${selectedLang.code === lang.code ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                                                        }`}
                                                >
                                                    {lang.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {!isEmbedded && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setViewSaved(!viewSaved)}
                                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                            aria-label="Toggle Saved Advisories"
                                            title="Saved Advisories"
                                        >
                                            <BookmarkCheck className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={toggleModal}
                                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                            aria-label="Close voice assistant"
                                            title="Close"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {viewSaved ? (
                        <div className="flex-1 overflow-y-auto p-5 scroll-smooth">
                            <h3 className="text-sm font-bold text-foreground mb-4">Saved Advisories</h3>
                            {savedAdvisories.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    <BookmarkPlus className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No saved advisories yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {savedAdvisories.map((saved, idx) => (
                                        <div key={idx} className="bg-muted/30 border border-border p-4 rounded-2xl">
                                            <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" />{saved.q}</p>
                                            <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{saved.a}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Quick Topics */}
                    <div className="p-3 border-b border-border bg-muted/30">
                        <p className="text-xs font-medium text-muted-foreground mb-2">{voiceUi.tryTopics}</p>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {localizedQuickTopics.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => handleQuickTopic(topic)}
                                    disabled={isLoading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-card rounded-full text-xs font-medium border border-border hover:border-primary hover:text-primary transition-colors whitespace-nowrap shadow-sm disabled:opacity-50"
                                >
                                    <topic.icon className="h-3.5 w-3.5" />
                                    {topic.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Voice-only Interaction Area */}
                    <div className={`flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-muted/10 to-muted/30 ${isEmbedded ? 'min-h-[360px]' : 'min-h-[280px] max-h-[350px]'}`}>
                        <div className="rounded-2xl border border-border bg-white dark:bg-muted p-4">
                            <h4 className="text-sm font-semibold text-foreground">{voiceUi.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{voiceUi.subtitle}</p>
                            <p className="text-xs text-primary font-medium mt-2">{selectedLang.greeting}</p>
                        </div>

                        <div className="flex justify-center relative py-6">
                            {speechSupported ? (
                                <div className="relative flex items-center justify-center">
                                    {/* Audio waves behind the button when listening */}
                                    <AnimatePresence>
                                        {(isListening || isSpeaking) && (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 -m-8 flex items-center justify-center pointer-events-none"
                                            >
                                                {[1, 2, 3].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        className={`absolute rounded-full border-2 ${isListening ? 'border-red-500/30' : 'border-primary/30'}`}
                                                        animate={{ 
                                                            width: ['100%', '200%', '100%'], 
                                                            height: ['100%', '200%', '100%'],
                                                            opacity: [0.6, 0, 0.6]
                                                        }}
                                                        transition={{ 
                                                            duration: 2, 
                                                            repeat: Infinity, 
                                                            delay: i * 0.4,
                                                            ease: "easeInOut"
                                                        }}
                                                        style={{ width: '100%', height: '100%' }}
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    <button
                                        type="button"
                                        onClick={isListening ? stopListening : startListening}
                                        disabled={isLoading}
                                        className={`relative z-10 h-20 w-20 rounded-full flex items-center justify-center transition-all shadow-xl overflow-hidden ${isListening
                                            ? 'bg-red-500 text-white shadow-red-500/40 scale-105'
                                            : isSpeaking ? 'bg-emerald-500 text-white shadow-emerald-500/40' : 'bg-primary text-white hover:bg-primary/90 hover:scale-105 shadow-primary/30'
                                            } disabled:opacity-50 disabled:hover:scale-100`}
                                        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                                        title={isListening ? 'Stop voice input' : 'Start voice input'}
                                    >
                                        {/* Walkie-Talkie style inner rings */}
                                        <div className="absolute inset-2 rounded-full border border-white/20"></div>
                                        <div className="absolute inset-4 rounded-full border border-white/10"></div>
                                        
                                        {isListening ? (
                                            <div className="flex items-center justify-center gap-1">
                                                {[1, 2, 3, 4, 5].map((bar) => (
                                                    <motion.div
                                                        key={bar}
                                                        className="w-1.5 bg-white rounded-full"
                                                        animate={{ height: ['8px', '24px', '8px', '32px', '12px'] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: bar * 0.1 }}
                                                    />
                                                ))}
                                            </div>
                                        ) : isSpeaking ? (
                                            <Activity className="h-8 w-8 animate-pulse" />
                                        ) : (
                                            <Mic className="h-8 w-8" />
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">Speech recognition is not supported in this browser.</p>
                            )}
                        </div>

                        <p className="text-center text-xs text-muted-foreground">
                            {isListening ? (
                                <span className="text-red-500 font-medium">🎙️ {voiceUi.listening} {selectedLang.name}</span>
                            ) : (
                                <span>{voiceUi.tapToAsk} ({selectedLang.name})</span>
                            )}
                        </p>

                        <div className="rounded-2xl border border-border bg-white dark:bg-muted p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">{voiceUi.typeToAsk}</p>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                                <textarea
                                    value={manualQuery}
                                    onChange={(event) => setManualQuery(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' && !event.shiftKey) {
                                            event.preventDefault();
                                            handleManualSubmit();
                                        }
                                    }}
                                    rows={3}
                                    placeholder="Describe your crop, problem, location, and stage in detail..."
                                    className="w-full min-h-[88px] resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                                    aria-label="Type your farming question"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={handleManualSubmit}
                                    disabled={isLoading || !manualQuery.trim()}
                                    className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                                    aria-label="Send typed question"
                                >
                                    {voiceUi.send}
                                </button>
                            </div>
                        </div>

                        {speechError && (
                            <p className="text-center text-xs text-amber-600 dark:text-amber-400 font-medium">
                                {speechError}
                            </p>
                        )}

                        {isLoading && (
                            <div className="rounded-2xl border border-border bg-white dark:bg-muted p-4">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span className="text-sm text-muted-foreground">{voiceUi.processing}</span>
                                </div>
                            </div>
                        )}

                        {lastQuestion && (
                            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                                <p className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5">
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    {voiceUi.lastQuestion}
                                </p>
                                <p className="text-sm text-foreground leading-relaxed">{lastQuestion}</p>
                            </div>
                        )}

                        {lastAnswer && (
                            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/30 p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        {voiceUi.answer}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => isSpeaking ? stopSpeaking() : speakText(lastAnswer)}
                                            className={`px-2.5 py-1 rounded-full transition-colors inline-flex items-center gap-1.5 text-xs font-medium ${
                                                isSpeaking
                                                    ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60'
                                                    : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60'
                                            }`}
                                            aria-label={isSpeaking ? 'Stop speaking answer' : 'Play answer voice'}
                                            title={isSpeaking ? 'Stop speaking answer' : 'Play answer voice'}
                                        >
                                            {isSpeaking ? (
                                                <><VolumeX className="h-3.5 w-3.5" /> Stop</>
                                            ) : (
                                                <><Volume2 className="h-3.5 w-3.5" /> Play</>
                                            )}
                                        </button>
                                        <button
                                            onClick={shareToWhatsApp}
                                            className="px-2.5 py-1 rounded-full transition-colors inline-flex items-center gap-1.5 text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60"
                                            aria-label="Share to WhatsApp"
                                            title="Share to WhatsApp"
                                        >
                                            <Share2 className="h-3.5 w-3.5" /> Share
                                        </button>
                                        <button
                                            onClick={saveAdvisory}
                                            disabled={isCurrentSaved}
                                            className={`px-2.5 py-1 rounded-full transition-colors inline-flex items-center gap-1.5 text-xs font-medium ${isCurrentSaved ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40'}`}
                                            aria-label="Save Advisory"
                                            title="Save Advisory"
                                        >
                                            {isCurrentSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <BookmarkPlus className="h-3.5 w-3.5" />} Save
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm text-foreground leading-relaxed whitespace-pre-line break-words">
                                    {lastAnswer}
                                </div>
                            </div>
                        )}
                        <div ref={answerEndRef} />
                        </div>
                        </>
                    )}
                    </div>
            )}
        </>
    );
}
