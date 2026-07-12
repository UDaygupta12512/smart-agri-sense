import { NextRequest, NextResponse } from 'next/server';
import { buildFarmingKnowledgeAnswer, type SupportedLanguageCode } from '@/lib/farmingKnowledgeAnswer';

const GEMINI_MODELS = [
    'gemini-2.5-flash',
];

const SYSTEM_PROMPT = `You are Krishi Mitra, an expert AI agricultural advisor for Indian farmers.

CRITICAL RULES:
1. Read the user's exact question carefully and answer THAT question directly and comprehensively.
2. Always give COMPLETE, DETAILED answers. Never give short or partial answers.
3. Structure your response clearly with numbered steps or bullet points.
4. Include specific practical details: exact dosages (kg/acre, ml/L, g/L), timings (DAS, crop stages), product names, and application methods.
5. When discussing crops, cover: variety selection, land preparation, sowing, fertilizer schedule (basal + top-dress), irrigation, pest/disease management, harvesting, and post-harvest.
6. When discussing pests/diseases, cover: identification symptoms, ETL (Economic Threshold Level), chemical control (with dosage), biological control, cultural practices, and spray timing.
7. When discussing fertilizers, cover: basal dose, 1st top-dress, 2nd top-dress, micronutrients, and organic alternatives.
8. When discussing market/prices, cover: current trends, MSP rates, best selling strategy, storage tips, and government procurement options.
9. When discussing government schemes, cover: eligibility, benefits, application process, documents required, and helpline numbers.
10. If the user's question is vague, give the best comprehensive general advice first, then ask ONE short follow-up for more specifics.
11. Always end with a practical actionable tip or next step the farmer can take immediately.
12. Never reply with unrelated generic text. Stay focused on the exact question asked.

Your expertise: crops, fertilizers, pests/diseases, irrigation, soil health, weather advisories, mandi/MSP prices, government schemes (PM-KISAN, PMFBY, KCC, PMKSY), organic farming, post-harvest management.`;

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
    error?: {
        message?: string;
    };
}

function normalizeLanguage(language: string): SupportedLanguageCode {
    const code = (language || 'en-IN').toLowerCase();
    const map: Record<string, SupportedLanguageCode> = {
        en: 'en-IN',
        'en-in': 'en-IN',
        hi: 'hi-IN',
        'hi-in': 'hi-IN',
        ta: 'ta-IN',
        'ta-in': 'ta-IN',
        te: 'te-IN',
        'te-in': 'te-IN',
        bn: 'bn-IN',
        'bn-in': 'bn-IN',
        kn: 'kn-IN',
        'kn-in': 'kn-IN',
        ml: 'ml-IN',
        'ml-in': 'ml-IN',
    };
    return map[code] ?? map[code.split('-')[0]] ?? 'en-IN';
}

function getLanguageInstruction(language: SupportedLanguageCode): string {
    const languageMap: Record<SupportedLanguageCode, string> = {
        'en-IN': 'CRITICAL INSTRUCTION: Auto-detect the language of the user\'s question and ALWAYS reply in THAT exact same language (e.g. if they ask in Hindi, reply in Hindi script). If unsure, respond ENTIRELY in English. Give a complete, detailed answer with numbered steps and specific dosages/timings.',
        'hi-IN': 'CRITICAL INSTRUCTION: Auto-detect the language of the user\'s question and ALWAYS reply in THAT exact same language. If unsure, कृपया हिंदी में (Devanagari script) पूरा और विस्तृत उत्तर दें।',
        'ta-IN': 'CRITICAL INSTRUCTION: Auto-detect the language of the user\'s question and ALWAYS reply in THAT exact same language. If unsure, தமிழில் முழுமையாக, விரிவாக பதிலளிக்கவும்.',
        'te-IN': 'CRITICAL INSTRUCTION: Auto-detect the language of the user\'s question and ALWAYS reply in THAT exact same language. If unsure, తెలుగులో పూర్తిగా, వివరంగా సమాధానం ఇవ్వండి.',
        'bn-IN': 'CRITICAL INSTRUCTION: Auto-detect the language of the user\'s question and ALWAYS reply in THAT exact same language. If unsure, বাংলায় সম্পূর্ণ উত্তর দিন।',
        'kn-IN': 'CRITICAL INSTRUCTION: Auto-detect the language of the user\'s question and ALWAYS reply in THAT exact same language. If unsure, ಕನ್ನಡದಲ್ಲಿ ಸಂಪೂರ್ಣ ಉತ್ತರ ನೀಡಿ.',
        'ml-IN': 'CRITICAL INSTRUCTION: Auto-detect the language of the user\'s question and ALWAYS reply in THAT exact same language. If unsure, മലയാളത്തിൽ പൂർണ്ണമായി ഉത്തരം നൽകുക.',
    };
    return languageMap[language] || languageMap['en-IN'];
}

async function callGroq(prompt: string): Promise<string | null> {
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5
            })
        });

        if (!response.ok) {
            console.error('Groq text generation failed:', await response.text());
            return null;
        }
        
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        return text ? text.trim() : null;
    } catch (error) {
        console.error('Groq text request failed:', error);
        return null;
    }
}

async function callGemini(apiKey: string, prompt: string): Promise<string | null> {
    for (const model of GEMINI_MODELS) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: prompt }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.5,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 4096,
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    ],
                }),
            });

            if (!response.ok) {
                console.error(`Gemini ${model} error:`, await response.text());
                continue;
            }

            const data: GeminiResponse = await response.json();
            if (data.error) {
                console.error(`Gemini ${model} error:`, data.error.message);
                continue;
            }

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text) {
                return text;
            }
        } catch (error) {
            console.error(`Gemini ${model} request failed:`, error);
        }
    }

    return null;
}

export async function POST(request: NextRequest) {
    let message = '';
    let language: SupportedLanguageCode = 'en-IN';
    let history: { role: string, content: string }[] = [];
    let locationStr = '';

    try {
        const body = await request.json();
        message = typeof body?.message === 'string' ? body.message.trim() : '';
        language = normalizeLanguage(typeof body?.language === 'string' ? body.language : 'en-IN');
        if (Array.isArray(body?.history)) {
            history = body.history;
        }
        if (typeof body?.location === 'string') {
            locationStr = body.location;
        }

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // --- Semantic Interceptor (API Saver) ---
        // This stops basic small talk from hitting the expensive LLM
        const lowerMsg = message.toLowerCase().trim().replace(/[?!.]/g, '');
        const greetings = ['hi', 'hello', 'hey', 'namaste', 'vanakkam', 'hi there'];
        const identityQ = ['who are you', 'what is your name', 'what are you', 'who made you', 'who created you'];
        const thanks = ['thank you', 'thanks', 'dhanyavad', 'nandri', 'shukriya'];

        if (greetings.includes(lowerMsg)) {
            return NextResponse.json({ response: 'Namaste! I am Krishi Mitra, your AI Agricultural Advisor. How can I help you with your farming today?', source: 'interceptor' });
        }
        if (identityQ.some(q => lowerMsg.includes(q))) {
            return NextResponse.json({ response: 'I am Krishi Mitra, an AI built to assist Indian farmers with crop management, pest detection, and government schemes.', source: 'interceptor' });
        }
        if (thanks.includes(lowerMsg)) {
            return NextResponse.json({ response: 'You are very welcome! Let me know if you need any more farming advice.', source: 'interceptor' });
        }
        // ----------------------------------------

        const apiKey = process.env.GEMINI_API_KEY?.trim();
        const localAnswer = () => buildFarmingKnowledgeAnswer(message, language);

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return NextResponse.json({
                response: 'API key is missing. Please configure GEMINI_API_KEY in your environment to use the Krishi Mitra AI.',
                source: 'error',
            });
        }

        const languageInstruction = getLanguageInstruction(language);
        let historyPrompt = '';
        if (history.length > 0) {
            historyPrompt = 'Conversation History:\n' + history.map(h => `${h.role === 'user' ? 'Farmer' : 'AI'}: ${h.content}`).join('\n') + '\n\n';
        }
        
        let locationContext = '';
        if (locationStr) {
            locationContext = `[SYSTEM NOTE: The farmer is currently located at GPS coordinates: ${locationStr}. Please tailor your advice (crops, weather, soil, diseases) specifically to this region in India if applicable.]\n\n`;
        }

        const prompt =
            `${SYSTEM_PROMPT}\n\n${languageInstruction}\n\n` +
            `${historyPrompt}` +
            `${locationContext}` +
            `User question (answer this exactly):\n"${message}"`;

        let aiResponse = await callGemini(apiKey, prompt);

        if (!aiResponse) {
            console.log('Gemini chat failed, trying Groq...');
            aiResponse = await callGroq(prompt);
        }

        if (aiResponse) {
            return NextResponse.json({
                response: aiResponse,
                source: 'ai',
            });
        }

        console.log('Both AI APIs failed, using offline knowledge base...');
        return NextResponse.json({
            response: localAnswer(),
            source: 'offline_knowledge',
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({
            response: 'An internal server error occurred while processing your request. Please try again later.',
            source: 'error',
            error: 'Internal server error',
        });
    }
}
