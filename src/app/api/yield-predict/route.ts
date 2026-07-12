import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

interface YieldPredictRequest {
    crop: string;
    area: number;
    location: string;
    soilHealth: string;
    soilPh: number;
    soilTypeField: string;
    season: string;
    irrigation: string;
    topography: string;
    lastSeasonYield: number | null;
    weatherContext: any;
    baseExpectedYield: number;
    baseYieldPerAcre: number;
}

const SYSTEM_PROMPT = `You are an expert Agronomist Data Scientist and AI Yield Predictor for Indian agriculture. 
Your task is to generate a highly accurate, dynamic, and realistic harvest prediction based on the user's inputs. 

You MUST respond with a valid JSON object in this exact format matching the YieldResult interface:
{
    "crop": "crop name",
    "location": "location name",
    "area": 5,
    "expectedYield": "Total expected yield as a string with 1 decimal (e.g. '125.5')",
    "yieldPerAcre": "Yield per acre as a string with 2 decimals (e.g. '25.10')",
    "accuracy": "Confidence score percentage as a string (e.g. '92.4')",
    "weatherSource": "live",
    "financial": {
        "estimatedRevenue": "Total estimated market revenue as a formatted currency string (e.g. '₹ 3,50,000')",
        "mspRevenue": "Estimated MSP revenue (e.g. '₹ 3,10,000')",
        "marketTrend": "Market trend description (e.g. 'Bullish (+11% over MSP assumption)')"
    },
    "factors": {
        "weatherImpact": "Detailed 2-3 sentence AI analysis of how the provided weather context affects this specific crop.",
        "soilImpact": "Detailed AI analysis of the soil pH, type, and health on the crop's nutrient uptake.",
        "pestRisk": "Detailed AI analysis of pest risks given the weather and season."
    },
    "alternateScenario": {
        "name": "Name of an optimized farming scenario (e.g. 'Optimized (Drip Irrigation + Excellent Soil)')",
        "expectedYield": "Optimized total yield string",
        "yieldPerAcre": "Optimized yield per acre string",
        "estimatedRevenue": "Optimized estimated revenue string",
        "improvementPct": "Percentage improvement string (e.g. '15.2')"
    }
}

Guidelines:
- Act as an intelligent AI predictor, not just a static calculator.
- Base your numbers on realistic agricultural data for the specified crop in India, but heavily adjust them based on the specific constraints provided (e.g., poor soil health or bad weather should significantly lower yield).
- Use the provided base mathematical yield expectations as a starting anchor, but you MUST adjust them dynamically to be more realistic based on your agronomic knowledge of the crop.
- Ensure all numbers make mathematical sense (expectedYield = area * yieldPerAcre).
- Financial values should be realistic for Indian markets.
- Provide detailed, insightful text for the factors instead of generic statements.`;

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
            console.error('Groq Yield API error:', await response.text());
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
        const body: YieldPredictRequest = await request.json();
        const { crop, area, location, soilHealth, soilPh, soilTypeField, season, irrigation, topography, lastSeasonYield, weatherContext, baseExpectedYield, baseYieldPerAcre } = body;

        const apiKey = process.env.GEMINI_API_KEY;
        const userPrompt = `Predict yield for the following constraints:
- Crop: ${crop}
- Location: ${location}
- Area: ${area} acres
- Soil: ${soilHealth} health, pH ${soilPh}, Type: ${soilTypeField}
- Season: ${season}
- Irrigation: ${irrigation}
- Topography: ${topography}
- Last Season Yield: ${lastSeasonYield ? lastSeasonYield + ' qtl/acre' : 'N/A'}
- Base Mathematical Prediction (anchor): ${baseExpectedYield} total qtl (${baseYieldPerAcre} qtl/acre)
- Live Weather Data: ${JSON.stringify(weatherContext)}

Generate a highly realistic AI yield prediction returning ONLY the valid JSON structure.`;

        let aiResponse: string | null = null;

        if (apiKey && apiKey !== 'your_gemini_api_key_here') {
            try {
                const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 2048, responseMimeType: 'application/json' }
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
            console.log('Gemini failed or missing key, trying Groq for Yield Predictor...');
            aiResponse = await callGroq(`${SYSTEM_PROMPT}\n\n${userPrompt}`);
        }

        if (!aiResponse) {
            return NextResponse.json({ error: 'AI models failed to generate prediction' }, { status: 500 });
        }

        // Parse the JSON response from AI
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');

            const prediction = JSON.parse(jsonMatch[0]);

            return NextResponse.json({
                prediction,
                source: 'ai'
            });

        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            return NextResponse.json({ error: 'Failed to parse AI prediction' }, { status: 500 });
        }

    } catch (error) {
        console.error('Yield Predictor API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
