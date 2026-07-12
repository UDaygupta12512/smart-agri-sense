import { NextResponse } from 'next/server';
import { generateMarketSnapshot } from '@/lib/aiDashboardData';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') ?? '';
  const crop = searchParams.get('crop') ?? '';

  try {
    const data = await generateMarketSnapshot(location, crop);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Unable to generate market snapshot.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
