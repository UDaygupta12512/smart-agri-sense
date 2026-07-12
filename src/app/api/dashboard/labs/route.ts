import { NextResponse } from 'next/server';
import { generateLabs } from '@/lib/dynamicDashboardData';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') ?? '';

  try {
    const data = await generateLabs(location);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Unable to generate lab directory data.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
