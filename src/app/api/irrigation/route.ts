import { NextRequest, NextResponse } from 'next/server';
import { searchLocations, fetchWeatherForecast } from '@/lib/agriWeather';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

const SYSTEM_PROMPT = `You are a Smart Irrigation Agronomist AI.
Your task is to analyze the crop constraints and the live weather forecast to provide an accurate irrigation schedule.

You MUST respond with a valid JSON object in this EXACT format:
{
    "liveMoisture": 65,
    "waterRequirement": "12.5",
    "schedule": [
        {
            "dayStr": "Today",
            "dateNum": 12,
            "title": "Light Sprinkler",
            "time": "Evening, 45 mins",
            "skippedByRain": false,
            "isPast": false,
            "isToday": true
        },
        {
            "dayStr": "Tmrw",
            "dateNum": 13,
            "title": "Deep Root Watering",
            "time": "Morning, 2 hours",
            "skippedByRain": true,
            "isPast": false,
            "isToday": false
        }
    ]
}

Guidelines:
- "liveMoisture" must be a number between 0 and 100 representing the estimated soil volumetric water content. Sandy soils drain fast. Clay retains water.
- "waterRequirement" must be a string like "8.5" (mm/day). Reduce this heavily if there is significant rain in the forecast.
- "schedule" must contain exactly 3 items. One item for a past action (e.g. yesterday, isPast=true), one for today (isToday=true), and one for tomorrow or day after.
- If the weather forecast indicates high probability of rain (>50%), you should set "skippedByRain" to true for that day's schedule item.
- Provide practical and localized advice for the "title" and "time".`;

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
                temperature: 0.3,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            console.error('Groq Irrigation API error:', await response.text());
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
        const body = await request.json();
        const { cropType, soilType, cropStage, locationQuery } = body;

        if (!cropType || !soilType || !cropStage) {
            return NextResponse.json({ error: 'Missing required crop constraints' }, { status: 400 });
        }

        let weatherContext = 'No weather data available.';
        
        try {
            const sanitizedQuery = locationQuery?.trim() || 'Nagpur';
            const matches = await searchLocations(sanitizedQuery, 1);
            if (matches && matches.length > 0) {
                const selected = matches[0];
                const forecast = await fetchWeatherForecast(selected.latitude, selected.longitude, 3);
                
                const avgTemp = forecast.daily.tempMax?.[0] || 30;
                const rainToday = forecast.daily.precipitationSum?.[0] || 0;
                const rainTomorrow = forecast.daily.precipitationSum?.[1] || 0;
                const rainProbToday = forecast.daily.rainProbabilityMax?.[0] || 0;
                const rainProbTomorrow = forecast.daily.rainProbabilityMax?.[1] || 0;
                
                weatherContext = `Location: ${selected.name}, ${selected.state}. Temp: ${avgTemp}°C. Rain Today: ${rainToday}mm (${rainProbToday}% chance). Rain Tomorrow: ${rainTomorrow}mm (${rainProbTomorrow}% chance).`;
            }
        } catch (e) {
            console.warn('Weather fetch failed in irrigation API:', e);
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const userPrompt = `Calculate irrigation plan for:
- Crop: ${cropType}
- Soil: ${soilType}
- Stage: ${cropStage}
- Weather: ${weatherContext}

Generate the JSON response.`;

        let aiResponse: string | null = null;

        if (apiKey && apiKey !== 'your_gemini_api_key_here') {
            try {
                const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 1024, responseMimeType: 'application/json' }
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
            console.log('Gemini failed or missing key, trying Groq for Irrigation Predictor...');
            aiResponse = await callGroq(`${SYSTEM_PROMPT}\n\n${userPrompt}`);
        }

        if (!aiResponse) {
            return NextResponse.json({ error: 'AI models failed to generate prediction' }, { status: 500 });
        }

        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');

            const prediction = JSON.parse(jsonMatch[0]);
            
            // Validate basic structure
            if (!prediction.schedule || !Array.isArray(prediction.schedule)) {
                throw new Error('Invalid schedule structure');
            }

            return NextResponse.json({
                data: prediction,
                weatherContext: weatherContext,
                source: 'ai'
            });

        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            // Fallback gracefully instead of throwing 500
            const fallbackPrediction = {
                liveMoisture: 60,
                waterRequirement: "10.0",
                schedule: [
                    { dayStr: "Yest", dateNum: new Date().getDate() - 1, title: "Base Moisture", time: "Completed", skippedByRain: false, isPast: true, isToday: false },
                    { dayStr: "Today", dateNum: new Date().getDate(), title: "Light Sprinkler", time: "Evening", skippedByRain: false, isPast: false, isToday: true },
                    { dayStr: "Tmrw", dateNum: new Date().getDate() + 1, title: "Deep Root Watering", time: "Morning", skippedByRain: false, isPast: false, isToday: false }
                ]
            };
            return NextResponse.json({ data: fallbackPrediction, weatherContext, source: 'fallback' });
        }

    } catch (error) {
        console.error('Irrigation API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
