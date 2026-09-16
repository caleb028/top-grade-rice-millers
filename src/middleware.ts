import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Administrative Page Protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
    const session = await verifySessionToken(sessionCookie?.value);

    if (!session || session.role !== 'admin') {
      const loginUrl = new URL('/admin/login', req.url);
      // Clean redirect to login
      const response = NextResponse.redirect(loginUrl);
      // Remove invalid cookie if present
      if (sessionCookie) {
        response.cookies.delete(SESSION_COOKIE_NAME);
      }
      return response;
    }
  }

  // 2. Administrative API Protection (except login / auth endpoint)
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth')) {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
    const session = await verifySessionToken(sessionCookie?.value);

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Administrator session required.' },
        { status: 401 }
      );
    }
  }

  // 3. Security Headers for all responses
  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.jpg (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.jpg).*)',
  ],
};
