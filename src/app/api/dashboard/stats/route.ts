import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
    const today = new Date();
    return NextResponse.json({
        recentAlerts: [
            { type: 'warning', title: 'Pre-Summer Heat Alert', message: 'Max temperatures of 38-40°C forecast across Vidarbha for next 4 days. Irrigate wheat fields early morning.', time: '1h ago' },
            { type: 'info', title: 'Optimal Spray Window', message: 'Low winds (8-10 km/h) and ideal humidity tomorrow 6-9 AM — best conditions for pesticide application.', time: '4h ago' },
            { type: 'success', title: 'Wheat MSP Update', message: `Rabi ${today.getFullYear()}-${(today.getFullYear() + 1).toString().slice(2)} wheat MSP set at ₹2,425/qtl — 6% above last year. Good time to register crop.`, time: '6h ago' },
            { type: 'info', title: 'Rabi Harvest Advisory', message: 'Wheat and gram are nearing maturity in Nagpur, Indore, and Kota belts. Target harvest in next 10-15 days and pre-book threshers.', time: '1d ago' },
        ],
        cropHealth: [
            { name: 'Wheat', health: 91, area: '2.5 acres', stage: 'Grain Filling (Nagpur)' },
            { name: 'Gram (Chana)', health: 84, area: '1.8 acres', stage: 'Pod Development (Indore)' },
            { name: 'Mustard', health: 76, area: '1.2 acres', stage: 'Ripening (Kota)' },
            { name: 'Rice (Paddy)', health: 88, area: '2.2 acres', stage: 'Nursery Planning (Warangal)' },
            { name: 'Cotton', health: 81, area: '3.0 acres', stage: 'Field Prep (Akola)' },
        ]
    });
}
