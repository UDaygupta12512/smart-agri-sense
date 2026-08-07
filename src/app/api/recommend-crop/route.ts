import { NextRequest, NextResponse } from 'next/server';
import { recommendCrops, SoilData, REGIONAL_PRESETS } from '@/lib/cropRecommender';

/**
 * GET /api/recommend-crop
 * Returns regional preset agro-climatic profiles for instant selection
 */
export async function GET() {
    return NextResponse.json({
        presets: REGIONAL_PRESETS,
        benchmarkCropsCount: 28,
        features: ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    });
}

/**
 * POST /api/recommend-crop
 * 
 * Body: { N, P, K, temperature, humidity, ph, rainfall, k }
 * 
 * Takes soil and climate parameters, runs them through the custom 
 * KNN classification algorithm, and returns the top 4 recommended crops with full agronomy guidelines.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Extract and validate input data
        const input: SoilData = {
            N: Number(body.N) || 0,
            P: Number(body.P) || 0,
            K: Number(body.K) || 0,
            temperature: Number(body.temperature) || 25,
            humidity: Number(body.humidity) || 60,
            ph: Number(body.ph) || 7.0,
            rainfall: Number(body.rainfall) || 100,
        };

        // Basic validation bounds
        if (input.ph < 0 || input.ph > 14) {
            return NextResponse.json({ error: 'pH must be between 0 and 14' }, { status: 400 });
        }

        const k = Number(body.k) || 4;

        // Run the Machine Learning algorithm (KNN)
        const recommendations = recommendCrops(input, k);

        return NextResponse.json({
            source: 'custom_knn_classifier',
            message: 'Crop recommendations generated successfully using ICAR Agronomic KNN Engine.',
            inputs: input,
            recommendations: recommendations
        });

    } catch (error) {
        console.error('Crop Recommender API Error:', error);
        return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
    }
}
