import { NextRequest, NextResponse } from 'next/server';
import { AUTH_SESSION_COOKIE, getUserFromSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserFromSession(sessionToken);

  if (!user) {
    const response = NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    response.cookies.set({
      name: AUTH_SESSION_COOKIE,
      value: '',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.json({ user });
}
