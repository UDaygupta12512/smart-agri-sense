import { NextRequest, NextResponse } from 'next/server';
import { AUTH_SESSION_COOKIE, logoutSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;

  if (sessionToken) {
    await logoutSession(sessionToken);
  }

  const response = NextResponse.json({ success: true });
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
