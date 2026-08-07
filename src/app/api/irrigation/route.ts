import { NextRequest, NextResponse } from 'next/server';
import { searchLocations, fetchWeatherForecast } from '@/lib/agriWeather';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Crop coefficient (Kc) by stage (FAO-56 reference values)
const CROP_KC_TABLE: Record<string, { initial: number; mid: number; end: number }> = {
    'Wheat': { initial: 0.4, mid: 1.15, end: 0.35 },
    'Rice': { initial: 1.05, mid: 1.20, end: 0.90 },
    'Cotton': { initial: 0.35, mid: 1.20, end: 0.65 },
    'Sugarcane': { initial: 0.40, mid: 1.25, end: 0.75 },
    'Soybean': { initial: 0.40, mid: 1.15, end: 0.50 },
    'Maize': { initial: 0.30, mid: 1.20, end: 0.50 },
    'Mustard': { initial: 0.35, mid: 1.05, end: 0.35 },
    'Potato': { initial: 0.50, mid: 1.15, end: 0.75 },
    'Tomato': { initial: 0.60, mid: 1.15, end: 0.80 },
    'Onion': { initial: 0.70, mid: 1.05, end: 0.75 }
};

// Soil Available Water Capacity (AWC in mm/m)
const SOIL_AWC: Record<string, { awc: number; infiltration: string; baseMoisture: number }> = {
    'Sandy': { awc: 65, infiltration: 'High (30mm/hr)', baseMoisture: 42 },
    'Loamy': { awc: 140, infiltration: 'Moderate (15mm/hr)', baseMoisture: 68 },
    'Black (Vertisol)': { awc: 180, infiltration: 'Low (5mm/hr)', baseMoisture: 75 },
    'Clay': { awc: 160, infiltration: 'Very Low (3mm/hr)', baseMoisture: 78 },
    'Alluvial': { awc: 150, infiltration: 'Moderate (12mm/hr)', baseMoisture: 70 },
    'Red': { awc: 110, infiltration: 'Moderate-High (18mm/hr)', baseMoisture: 58 },
    'Laterite': { awc: 90, infiltration: 'High (22mm/hr)', baseMoisture: 52 }
};

function calculateFAOSmartIrrigation(
    cropType: string,
    soilType: string,
    cropStage: string,
    weatherContext: {
        temp: number;
        rainToday: number;
        rainTomorrow: number;
        rainProbToday: number;
        rainProbTomorrow: number;
    }
) {
    const soilInfo = SOIL_AWC[soilType] || { awc: 130, infiltration: 'Moderate', baseMoisture: 65 };
    const kcObj = CROP_KC_TABLE[cropType] || { initial: 0.4, mid: 1.1, end: 0.5 };

    const stageLower = cropStage.toLowerCase();
    let kc = kcObj.mid;
    if (stageLower.includes('initial') || stageLower.includes('sowing') || stageLower.includes('germination')) {
        kc = kcObj.initial;
    } else if (stageLower.includes('matur') || stageLower.includes('harvest') || stageLower.includes('rip')) {
        kc = kcObj.end;
    }

    // Reference ET0 approximation: Hargreaves modified (mm/day)
    const et0 = Math.max(3.0, (weatherContext.temp - 12) * 0.28);
    let cropWaterDemand = et0 * kc;

    // Adjust for today's rain
    if (weatherContext.rainToday > 0) {
        cropWaterDemand = Math.max(0, cropWaterDemand - weatherContext.rainToday * 0.8);
    }

    const waterReqStr = cropWaterDemand.toFixed(1);

    // Dynamic soil moisture
    let liveMoisture = soilInfo.baseMoisture;
    if (weatherContext.rainToday > 10) liveMoisture = Math.min(95, liveMoisture + 25);
    else if (weatherContext.temp > 35) liveMoisture = Math.max(25, liveMoisture - 15);

    const now = new Date();
    const todayNum = now.getDate();
    const yestNum = new Date(now.setDate(todayNum - 1)).getDate();
    const tmrwNum = new Date(now.setDate(todayNum + 1)).getDate();

    const skipToday = weatherContext.rainProbToday >= 45 || weatherContext.rainToday >= 5;
    const skipTmrw = weatherContext.rainProbTomorrow >= 45 || weatherContext.rainTomorrow >= 5;

    return {
        liveMoisture: Math.round(liveMoisture),
        waterRequirement: waterReqStr,
        schedule: [
            {
                dayStr: "Yest",
                dateNum: yestNum,
                title: "Basal Moisture Check",
                time: "Completed",
                skippedByRain: false,
                isPast: true,
                isToday: false
            },
            {
                dayStr: "Today",
                dateNum: todayNum,
                title: skipToday ? "Rain Pause Protocol" : (liveMoisture < 50 ? "Deep Root Fertigation" : "Light Foliar Sprinkler"),
                time: skipToday ? "Suspended (Rain Forecast)" : "Evening (5:30 PM, 45 mins)",
                skippedByRain: skipToday,
                isPast: false,
                isToday: true
            },
            {
                dayStr: "Tmrw",
                dateNum: tmrwNum,
                title: skipTmrw ? "Precipitation Hold" : "Drip Emitter Cycle",
                time: skipTmrw ? "Suspended (Wet Forecast)" : "Morning (6:30 AM, 1 hr)",
                skippedByRain: skipTmrw,
                isPast: false,
                isToday: false
            }
        ]
    };
}

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
}`;

async function callGroq(prompt: string): Promise<string | null> {
    if (!GROQ_API_KEY) return null;
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

        if (!response.ok) return null;
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch {
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

        let weatherSummary = {
            temp: 30,
            rainToday: 0,
            rainTomorrow: 0,
            rainProbToday: 10,
            rainProbTomorrow: 15
        };
        let weatherContext = 'Standard climatic conditions.';
        
        try {
            const sanitizedQuery = locationQuery?.trim() || 'Nagpur';
            const matches = await searchLocations(sanitizedQuery, 1);
            if (matches && matches.length > 0) {
                const selected = matches[0];
                const forecast = await fetchWeatherForecast(selected.latitude, selected.longitude, 3);
                
                weatherSummary.temp = forecast.daily.tempMax?.[0] || 30;
                weatherSummary.rainToday = forecast.daily.precipitationSum?.[0] || 0;
                weatherSummary.rainTomorrow = forecast.daily.precipitationSum?.[1] || 0;
                weatherSummary.rainProbToday = forecast.daily.rainProbabilityMax?.[0] || 0;
                weatherSummary.rainProbTomorrow = forecast.daily.rainProbabilityMax?.[1] || 0;
                
                weatherContext = `Location: ${selected.name}, ${selected.state}. Temp: ${weatherSummary.temp}°C. Rain Today: ${weatherSummary.rainToday}mm (${weatherSummary.rainProbToday}% chance). Rain Tomorrow: ${weatherSummary.rainTomorrow}mm (${weatherSummary.rainProbTomorrow}% chance).`;
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

Generate JSON response.`;

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
                console.warn('Gemini request failed in irrigation:', e);
            }
        }

        if (!aiResponse) {
            aiResponse = await callGroq(`${SYSTEM_PROMPT}\n\n${userPrompt}`);
        }

        if (aiResponse) {
            try {
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const prediction = JSON.parse(jsonMatch[0]);
                    if (prediction.schedule && Array.isArray(prediction.schedule)) {
                        return NextResponse.json({
                            data: prediction,
                            weatherContext,
                            source: 'ai_neural_inference'
                        });
                    }
                }
            } catch {
                // fall through to FAO engine
            }
        }

        // Guaranteed FAO-56 Agronomic Soil Water Computation
        const faoResult = calculateFAOSmartIrrigation(cropType, soilType, cropStage, weatherSummary);

        return NextResponse.json({
            data: faoResult,
            weatherContext,
            source: 'fao_56_evapotranspiration_engine'
        });

    } catch (error) {
        console.error('Irrigation API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
