import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

interface DiagnosisResult {
    disease: string;
    plant: string;
    confidence: string;
    severity: 'Low' | 'Medium' | 'High';
    description: string;
    treatment: string[];
    preventiveMeasures: string[];
}

const SYSTEM_PROMPT = `You are Krishi Mitra, an expert AI plant pathologist for Indian farmers. 
Analyze the provided plant image for diseases, pests, or nutrient deficiencies.

You MUST respond with a valid JSON object in this exact format:
{
    "disease": "Specific Disease/Pest Name (e.g. Late Blight, Fall Armyworm)",
    "plant": "Identified Plant Name",
    "confidence": "percentage (e.g. 85%)",
    "severity": "Low" or "Medium" or "High",
    "description": "2-3 sentences describing the visible symptoms and impact",
    "treatment": [
        "Specific treatment step 1 with dosages in Indian units (kg/acre, ml/L, g/L)",
        "Treatment step 2"
    ],
    "preventiveMeasures": [
        "Preventive measure 1",
        "Preventive measure 2"
    ]
}

Guidelines:
1. Examine the image for leaf spots, discoloration, wilting, powdery growth, insect damage.
2. Provide actionable treatments using pesticides available in India.
3. Respond ONLY with the JSON object, no extra text.`;

async function callGroqVision(prompt: string, base64Data: string, mimeType: string): Promise<string | null> {
    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.2-11b-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } }
                        ]
                    }
                ],
                temperature: 0.4,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            console.error('Groq Vision API error:', await response.text());
            return null;
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (e) {
        console.error('Groq Vision request failed:', e);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { image, crop, symptoms, localAnalysis } = body;

        if (!image || typeof image !== 'string') {
            return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        const cropContext = crop && crop !== 'unknown' ? `The farmer identified this as: ${crop}.` : '';
        const symptomContext = symptoms && symptoms.length > 0 ? `The farmer has observed these symptoms: ${symptoms.join(', ')}.` : '';
        const localContext = localAnalysis ? `Local heuristic scanner identified: ${localAnalysis.disease} with ${localAnalysis.confidence} confidence. Description: ${localAnalysis.description}` : '';
        const userPrompt = `Analyze this plant image for diseases or pest damage.\n${cropContext}\n${symptomContext}\n${localContext}\nValidate or refine the local heuristic diagnosis based on the image.\n\n${SYSTEM_PROMPT}`;

        const base64Match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (!base64Match) {
            return NextResponse.json({ error: 'Invalid image format. Expected base64 data URL.' }, { status: 400 });
        }

        const mimeType = base64Match[1];
        const base64Data = base64Match[2];

        let aiResponse: string | null = null;

        if (apiKey && apiKey !== 'your_gemini_api_key_here') {
            try {
                const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: 'user',
                                parts: [
                                    { text: userPrompt },
                                    { inlineData: { mimeType: mimeType, data: base64Data } }
                                ]
                            }
                        ],
                        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
                    }),
                });
                if (response.ok) {
                    const data = await response.json();
                    aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
                }
            } catch (e) {
                console.error('Gemini Vision failed:', e);
            }
        }

        if (!aiResponse) {
            console.log('Gemini Vision failed or missing key, trying Groq...');
            aiResponse = await callGroqVision(userPrompt, base64Data, mimeType);
        }

        if (!aiResponse) {
            return NextResponse.json({
                error: 'No response from AI',
                source: 'fallback'
            }, { status: 200 });
        }

        // Parse JSON
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');

            const diagnosis: DiagnosisResult = JSON.parse(jsonMatch[0]);

            if (!diagnosis.disease || !diagnosis.treatment || !Array.isArray(diagnosis.treatment)) {
                throw new Error('Invalid response structure');
            }

            const validatedDiagnosis: DiagnosisResult = {
                disease: diagnosis.disease,
                plant: diagnosis.plant || 'Unknown Plant',
                confidence: diagnosis.confidence || '70%',
                severity: (['Low', 'Medium', 'High'].includes(diagnosis.severity) ? diagnosis.severity : 'Medium') as 'Low' | 'Medium' | 'High',
                description: diagnosis.description || 'Disease detected in the plant image.',
                treatment: diagnosis.treatment,
                preventiveMeasures: diagnosis.preventiveMeasures || [
                    'Practice crop rotation',
                    'Use disease-resistant varieties',
                    'Maintain field hygiene'
                ]
            };

            return NextResponse.json({ diagnosis: validatedDiagnosis, source: 'ai' });

        } catch (parseError) {
            console.error('Failed to parse AI vision response:', parseError);
            return NextResponse.json({ error: 'Failed to parse AI response', source: 'fallback' }, { status: 200 });
        }

    } catch (error) {
        console.error('Pest detection API error:', error);
        return NextResponse.json({ error: 'Internal server error', source: 'fallback' }, { status: 200 });
    }
}
