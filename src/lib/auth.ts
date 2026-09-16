import { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = 'tgm_admin_session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface AdminSessionPayload {
  role: 'admin';
  email: string;
  iat: number;
  exp: number;
}

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    'topgrade_mwea_pishori_master_session_key_2026_production_hardening'
  );
}

// Helper to base64url encode and decode
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Signs data with HMAC-SHA256 using Web Crypto (compatible with both Node.js and Edge Runtime)
 */
async function createHmacSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(signature));
  const hashString = String.fromCharCode(...hashArray);
  return base64UrlEncode(hashString);
}

/**
 * Creates a cryptographically signed session token: `payloadBase64.signatureBase64`
 */
export async function createSessionToken(email: string): Promise<string> {
  const now = Date.now();
  const payload: AdminSessionPayload = {
    role: 'admin',
    email: email.trim().toLowerCase(),
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const payloadStr = base64UrlEncode(JSON.stringify(payload));
  const signature = await createHmacSignature(payloadStr, getSessionSecret());
  return `${payloadStr}.${signature}`;
}

/**
 * Verifies a signed session token. Returns null if invalid, expired, or tampered with.
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<AdminSessionPayload | null> {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadStr, signature] = parts;
  if (!payloadStr || !signature) {
    return null;
  }

  try {
    const expectedSignature = await createHmacSignature(payloadStr, getSessionSecret());
    if (signature !== expectedSignature) {
      return null;
    }

    const jsonStr = base64UrlDecode(payloadStr);
    const payload = JSON.parse(jsonStr) as AdminSessionPayload;

    if (payload.role !== 'admin' || !payload.email || typeof payload.exp !== 'number') {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null; // Expired session
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Server-side helper to authenticate an admin request.
 * Returns the payload if valid; otherwise returns null.
 */
export async function requireAdminSession(
  req: NextRequest
): Promise<AdminSessionPayload | null> {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) {
    return null;
  }
  return await verifySessionToken(cookie.value);
}
