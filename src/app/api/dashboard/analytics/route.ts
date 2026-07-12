import { NextResponse } from 'next/server';
import { generateAnalyticsSnapshot } from '@/lib/aiDashboardData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') ?? '';

  try {
    const data = await generateAnalyticsSnapshot(location);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Unable to generate analytics snapshot.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
