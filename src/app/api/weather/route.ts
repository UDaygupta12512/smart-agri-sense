import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    
    try {
        if (type === 'search') {
            const query = searchParams.get('query');
            const count = searchParams.get('count') || '8';
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query || '')}&count=${count}&language=en&format=json`;
            const response = await fetch(url);
            const data = await response.json();
            return NextResponse.json(data);
        } 
        
        if (type === 'forecast') {
            const latitude = searchParams.get('latitude');
            const longitude = searchParams.get('longitude');
            const forecastDays = searchParams.get('forecast_days') || '7';
            
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
                '&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,visibility' +
                '&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation_probability' +
                '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,precipitation_sum' +
                `&timezone=auto&forecast_days=${forecastDays}`;
                
            const response = await fetch(url);
            if (!response.ok) {
                return NextResponse.json({ error: 'Failed to fetch from Open-Meteo' }, { status: response.status });
            }
            const data = await response.json();
            return NextResponse.json(data);
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error) {
        console.error('Weather proxy error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
