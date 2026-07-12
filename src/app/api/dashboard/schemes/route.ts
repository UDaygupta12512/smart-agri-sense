import { NextResponse } from 'next/server';
import { generateSchemes } from '@/lib/aiDashboardData';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') ?? 'India';

  try {
    const data = await generateSchemes(region);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Unable to generate schemes data.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
