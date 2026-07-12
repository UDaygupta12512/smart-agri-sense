import {
  MarketSnapshot,
  MspRecord,
  SchemeRecord,
  CalendarSnapshot,
  AnalyticsSnapshot,
  generateMarketSnapshot as fallbackMarket,
  generateMspTable as fallbackMsp,
  generateSchemes as fallbackSchemes,
  generateCalendar as fallbackCalendar,
  generateAnalyticsSnapshot as fallbackAnalytics
} from './dynamicDashboardData';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

async function callGeminiJson<T>(prompt: string): Promise<T | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: 'application/json'
                }
            })
        });

        if (!response.ok) {
            console.error('Gemini JSON generation failed with status:', response.status);
            return null;
        }
        
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return null;

        return JSON.parse(text) as T;
    } catch (e) {
        console.error('Gemini JSON generation error:', e);
        return null;
    }
}

async function callGroqJson<T>(prompt: string): Promise<T | null> {
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
                temperature: 0.2,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            console.error('Groq JSON generation failed with status:', response.status);
            return null;
        }
        
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) return null;

        return JSON.parse(text) as T;
    } catch (e) {
        console.error('Groq JSON generation error:', e);
        return null;
    }
}

async function callAiJson<T>(prompt: string): Promise<T | null> {
    const geminiResult = await callGeminiJson<T>(prompt);
    if (geminiResult) return geminiResult;
    
    console.log('Gemini failed, falling back to Groq...');
    const groqResult = await callGroqJson<T>(prompt);
    return groqResult;
}

export async function generateMarketSnapshot(locationQuery: string, cropQuery = ''): Promise<MarketSnapshot> {
  return fallbackMarket(locationQuery, cropQuery);
}

export async function generateMspTable(marketingYear: string, region: string): Promise<MspRecord[]> {
  return fallbackMsp(marketingYear, region);
}

export async function generateSchemes(region: string): Promise<{ region: string; schemes: SchemeRecord[] }> {
  return fallbackSchemes(region);
}

export async function generateCalendar(cropName: string, sowingDateInput: string, locationQuery: string): Promise<CalendarSnapshot> {
  return fallbackCalendar(cropName, sowingDateInput, locationQuery);
}

export async function generateAnalyticsSnapshot(locationQuery: string): Promise<AnalyticsSnapshot> {
  return fallbackAnalytics(locationQuery);
}
