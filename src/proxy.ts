import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Authentication Check for protected routes
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isProtectedApiRoute = request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth/');

  if (isDashboardRoute || isProtectedApiRoute) {
    const sessionCookie = request.cookies.get('smartagri_session');
    if (!sessionCookie?.value) {
      if (isProtectedApiRoute) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      } else {
        const loginUrl = new URL('/signup', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // 2. Security Headers
  const response = NextResponse.next();
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME-sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Control referrer information sent
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Enforce HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
