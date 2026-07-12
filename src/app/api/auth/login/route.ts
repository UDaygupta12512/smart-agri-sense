import { NextResponse } from 'next/server';
import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_MAX_AGE_SECONDS,
  AuthError,
  loginWithEmail,
} from '@/lib/auth';

export const runtime = 'nodejs';

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;

    const { user, sessionToken } = await loginWithEmail({
      email: body.email ?? '',
      password: body.password ?? '',
    });

    const response = NextResponse.json({ user });
    response.cookies.set({
      name: AUTH_SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: 'Unable to sign in right now.' }, { status: 500 });
  }
}
