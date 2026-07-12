import { NextRequest, NextResponse } from 'next/server';
import { AUTH_SESSION_COOKIE, getUserFromSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value ?? '';
    const user = await getUserFromSession(sessionToken);

    if (!user) {
      return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ message: 'Unable to verify session.' }, { status: 500 });
  }
}
