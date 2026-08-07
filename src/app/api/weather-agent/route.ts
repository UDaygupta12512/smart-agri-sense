import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherForecast, buildAgentAgronomyReport } from '@/lib/weatherAgent';

/**
 * GET /api/weather-agent
 * Query Params: lat (latitude), lon (longitude), crops (comma-separated crop names)
 * 
 * Acts as an autonomous agent that analyzes live 7-day multi-variable weather data 
 * and returns actionable agronomic advice, disease vectors, spray windows, and irrigation schedules.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const latStr = searchParams.get('lat');
        const lonStr = searchParams.get('lon');
        const cropsStr = searchParams.get('crops');

        // Default to geographical center of India if not provided
        const lat = latStr ? parseFloat(latStr) : 20.5937;
        const lon = lonStr ? parseFloat(lonStr) : 78.9629;

        if (isNaN(lat) || isNaN(lon)) {
            return NextResponse.json({ error: 'Invalid coordinates provided' }, { status: 400 });
        }

        const farmerCrops = cropsStr ? cropsStr.split(',').map(c => c.trim()).filter(Boolean) : [];

        const weatherData = await fetchWeatherForecast(lat, lon);
        
        if (!weatherData) {
            return NextResponse.json({ error: 'Failed to fetch live weather data from Open-Meteo' }, { status: 502 });
        }

        const report = buildAgentAgronomyReport(lat, lon, weatherData, farmerCrops);

        return NextResponse.json({
            source: 'autonomous_weather_agent',
            report,
            alerts: report.alerts
        });

    } catch (error) {
        console.error('Weather Agent API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
