import { NextResponse } from 'next/server';
import { generateTraceabilityRecord } from '@/lib/dynamicDashboardData';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batchId = searchParams.get('batchId') ?? '';
  const crop = searchParams.get('crop') ?? '';
  const origin = searchParams.get('origin') ?? '';

  if (!batchId.trim()) {
    return NextResponse.json(
      {
        message: 'Batch ID is required.',
      },
      { status: 400 }
    );
  }

  try {
    const data = generateTraceabilityRecord(batchId, crop, origin);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Unable to find traceability record.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 404 }
    );
  }
}
