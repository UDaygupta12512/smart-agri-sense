import { NextResponse } from 'next/server';
import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_MAX_AGE_SECONDS,
  AuthError,
  createSessionToken,
  AuthUser,
} from '@/lib/auth';

export const runtime = 'nodejs';

interface LoginBody {
  email?: string;
  password?: string;
  name?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = (body.email ?? '').trim().toLowerCase();
    const password = (body.password ?? '').trim();
    const name = (body.name ?? '').trim() || email.split('@')[0];

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'A valid email is required.' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // Stateless login — issue a signed session token for the email.
    // Since we have no persistent DB, we trust the user's email identity.
    const user: AuthUser = {
      id: `user_${Buffer.from(email).toString('base64url')}`,
      name,
      email,
      location: '',
      createdAt: new Date().toISOString(),
    };

    const sessionToken = createSessionToken(user);

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
