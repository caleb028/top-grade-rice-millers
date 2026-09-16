import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, getAdminSettings } from '@/lib/db';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from '@/lib/auth';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';
import { logSecurityEvent } from '@/lib/securityLogger';
import { sanitizeText } from '@/lib/validation';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = await verifySessionToken(sessionCookie.value);
  if (payload && payload.role === 'admin') {
    const settings = await getAdminSettings();
    return NextResponse.json({
      authenticated: true,
      user: {
        email: settings.adminEmail,
        name: settings.adminName,
      },
    });
  }

  // Invalid or expired token: clear cookie
  const res = NextResponse.json({ authenticated: false }, { status: 401 });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // Rate Limiting: 5 attempts per 15 minutes (900,000 ms) per IP
  const rateLimitKey = `login:${clientIp}`;
  const rateResult = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
  if (!rateResult.allowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ip: clientIp,
      endpoint: '/api/admin/auth',
    });
    return rateLimitResponse(
      rateResult.retryAfterSeconds,
      'Too many login attempts. Please try again later.'
    );
  }

  try {
    const body = await req.json();
    const email = sanitizeText(body.email, 100);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      logSecurityEvent('LOGIN_FAILURE', {
        ip: clientIp,
        email,
        reason: 'Missing email or password',
      });
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Please verify email and password.' },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminCredentials(email, password);
    if (!isValid) {
      logSecurityEvent('LOGIN_FAILURE', {
        ip: clientIp,
        email,
        reason: 'Invalid credentials',
      });
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Please verify email and password.' },
        { status: 401 }
      );
    }

    const settings = await getAdminSettings();
    const token = await createSessionToken(settings.adminEmail);

    logSecurityEvent('LOGIN_SUCCESS', {
      ip: clientIp,
      email: settings.adminEmail,
    });

    const res = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      user: {
        email: settings.adminEmail,
        name: settings.adminName,
      },
    });

    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication processing error.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const clientIp = getClientIp(req);
  logSecurityEvent('LOGOUT', { ip: clientIp });

  const res = NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  });

  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
