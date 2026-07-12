import { NextResponse } from 'next/server';
import { generateMspTable } from '@/lib/aiDashboardData';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') ?? '2025-26';
  const region = searchParams.get('region') ?? 'All Regions';

  try {
    const data = await generateMspTable(year, region);
    return NextResponse.json({ year, region, records: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Unable to generate MSP table.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
