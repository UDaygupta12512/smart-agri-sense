import { NextRequest, NextResponse } from 'next/server';
import { generateAdvice, generateNativeLanguageAdvice } from '@/lib/advisoryData';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

interface AdvisoryRequest {
    crop: string;
    soilType: string;
    stage: string;
    issue?: string;
    language: 'en' | 'hi' | 'ta' | 'te';
}

interface AdvisoryAction {
    icon: string;
    title: string;
    description: string;
    urgency: 'high' | 'medium' | 'low';
}

interface AdvisoryResponse {
    summary: string;
    actions: AdvisoryAction[];
    fertilizer: string;
    irrigation: string;
    pestAlert: string;
    weatherTip: string;
    soilTip: string;
}

const SYSTEM_PROMPT = `You are Krishi Mitra, an expert AI agricultural advisor for Indian farmers. Generate detailed, actionable crop advisory based on the inputs provided.

You MUST respond with a valid JSON object in this exact format:
{
    "summary": "A 2-3 sentence overview of the advisory for this crop/stage/soil combination",
    "actions": [
        {
            "icon": "emoji icon",
            "title": "Action title (5-7 words)",
            "description": "Detailed description with specific dosages, timings, and methods (2-3 sentences)",
            "urgency": "high" or "medium" or "low"
        }
    ],
    "fertilizer": "Detailed fertilizer recommendation with NPK requirements, timing, and dosages for this crop stage",
    "irrigation": "Specific irrigation guidance for this crop stage with frequency and quantity",
    "pestAlert": "Current pest/disease risks for this crop stage with identification and control measures",
    "weatherTip": "Season-specific weather advisory and protective measures",
    "soilTip": "Soil management advice specific to the soil type mentioned"
}

Guidelines:
- Provide 3-5 actions, prioritized by urgency
- Use specific dosages in Indian units (kg/acre, ml/L, g/L, etc.)
- Consider Indian farming conditions and seasons (Kharif, Rabi, Zaid)
- Reference actual pesticides/fertilizers available in India
- Include both chemical and organic options when applicable
- Mention safety precautions for pesticide use
- For urgent issues, mark urgency as "high"
- Always use emojis for action icons (✅, ⚠️, 💧, 🐛, 🌱, etc.)

If an issue is mentioned, provide specific diagnosis and treatment in the pestAlert section.`;

const LANGUAGE_PROMPTS: Record<string, string> = {
    en: 'Respond in English.',
    hi: 'Respond in Hindi using Devanagari script.',
    ta: 'Respond in Tamil using Tamil script.',
    te: 'Respond in Telugu using Telugu script.',
};

async function callGroq(prompt: string): Promise<string | null> {
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
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            console.error('Groq Advisory API error:', await response.text());
            return null;
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (e) {
        console.error('Groq request failed:', e);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: AdvisoryRequest = await request.json();
        const { crop, soilType, stage, issue, language = 'en' } = body;

        if (!crop || !soilType || !stage) {
            return NextResponse.json(
                { error: 'Crop, soil type, and stage are required' },
                { status: 400 }
            );
        }

        const getFallbackAdvisory = () => {
            if (language === 'hi' || language === 'ta' || language === 'te') {
                return generateNativeLanguageAdvice(language, crop, soilType, stage, issue || '');
            }
            return generateAdvice(crop, soilType, stage, issue || '');
        };

        const apiKey = process.env.GEMINI_API_KEY;
        const userPrompt = `Generate a comprehensive crop advisory for:
- Crop: ${crop}
- Soil Type: ${soilType}
- Current Growth Stage: ${stage}
${issue ? `- Specific Issue/Problem: ${issue}` : '- No specific issue reported'}

${LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.en}

Remember to respond ONLY with a valid JSON object in the specified format.`;

        let aiResponse: string | null = null;

        if (apiKey && apiKey !== 'your_gemini_api_key_here') {
            try {
                const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
                    }),
                });
                if (response.ok) {
                    const data = await response.json();
                    aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
                }
            } catch (e) {
                console.error('Gemini request failed:', e);
            }
        }

        if (!aiResponse) {
            console.log('Gemini failed or missing key, trying Groq for Advisory...');
            aiResponse = await callGroq(`${SYSTEM_PROMPT}\n\n${userPrompt}`);
        }

        if (!aiResponse) {
            return NextResponse.json({
                advisory: getFallbackAdvisory(),
                source: 'local_fallback',
                fallback: true
            }, { status: 200 });
        }

        // Parse the JSON response from AI
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');

            const advisory: AdvisoryResponse = JSON.parse(jsonMatch[0]);

            if (!advisory.summary || !advisory.actions || !Array.isArray(advisory.actions)) {
                throw new Error('Invalid response structure');
            }

            return NextResponse.json({
                advisory,
                source: 'ai'
            });

        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            return NextResponse.json({
                advisory: getFallbackAdvisory(),
                source: 'local_fallback',
                fallback: true
            }, { status: 200 });
        }

    } catch (error) {
        console.error('Advisory API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', fallback: true },
            { status: 500 }
        );
    }
}

