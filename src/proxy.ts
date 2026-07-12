import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Authentication check for protected routes
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isProtectedApiRoute =
    pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/');

  if (isDashboardRoute || isProtectedApiRoute) {
    const sessionCookie = request.cookies.get('smartagri_session');
    if (!sessionCookie?.value) {
      if (isProtectedApiRoute) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const signupUrl = new URL('/signup', request.url);
      return NextResponse.redirect(signupUrl);
    }
  }

  // 2. Add security headers to every response
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.groq.com https://generativelanguage.googleapis.com https://api.open-meteo.com https://nominatim.openstreetmap.org",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  return response;
}

// Required by Next.js 16 proxy convention
export default proxy;

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
};
