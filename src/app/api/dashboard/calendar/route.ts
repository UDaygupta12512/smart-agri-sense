import { NextResponse } from 'next/server';
import { generateCalendar } from '@/lib/aiDashboardData';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get('crop') ?? 'Wheat';
  const sowingDate = searchParams.get('sowingDate') ?? '';
  const location = searchParams.get('location') ?? '';

  try {
    const data = await generateCalendar(crop, sowingDate, location);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Unable to generate crop calendar.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
