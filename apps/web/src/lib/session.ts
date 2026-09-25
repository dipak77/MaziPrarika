import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export type UserRole = 'customer' | 'vendor' | 'admin' | 'guest';

export interface SessionData {
  userId: string;
  role: UserRole;
  name: string;
  phone?: string;
  vendorId?: string;
  eventId?: string;
  issuedAt: number;
}

const SESSION_COOKIE_NAME = 'mazi_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const PLACEHOLDER_SECRET = 'change-me-to-a-64-char-random-string-in-production';

/**
 * The seeded walkthrough stays open unless a pilot explicitly turns it off.
 * `MAZI_DEMO=0` is the production lock: no demo identity, and a placeholder
 * session secret refuses to sign anything.
 */
export function demoModeEnabled(): boolean {
  return process.env.MAZI_DEMO !== '0';
}

function getSecretKey(): string {
  const secret = process.env.SESSION_SECRET;
  const missing = !secret || secret === PLACEHOLDER_SECRET;
  if (missing && !demoModeEnabled()) {
    throw new Error('SESSION_SECRET must be a unique random string when MAZI_DEMO=0.');
  }
  if (missing) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[SECURITY WARNING] SESSION_SECRET is a placeholder. Set MAZI_DEMO=0 only after a real secret is in place.');
    }
    return 'mazi_patrika_dev_fallback_secret_key_88492019482019482019';
  }
  return secret;
}

/**
 * Signs a session payload with HMAC-SHA256.
 */
export function signSession(data: SessionData): string {
  const secret = getSecretKey();
  const json = JSON.stringify(data);
  const payloadBase64 = Buffer.from(json, 'utf8').toString('base64url');
  const hmac = createHmac('sha256', secret).update(payloadBase64).digest('base64url');
  return `${payloadBase64}.${hmac}`;
}

/**
 * Verifies and parses a signed session token. Returns null if invalid or tampered.
 */
export function verifySession(token: string): SessionData | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadBase64, providedHmac] = parts;
  if (!payloadBase64 || !providedHmac) return null;

  try {
    const secret = getSecretKey();
    const expectedHmac = createHmac('sha256', secret).update(payloadBase64).digest('base64url');
    
    // Constant-time comparison to prevent timing attacks
    const providedBuf = Buffer.from(providedHmac);
    const expectedBuf = Buffer.from(expectedHmac);
    if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
      return null;
    }

    const json = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const data = JSON.parse(json) as SessionData;

    // Check expiration
    if (typeof data.issuedAt !== 'number' || Date.now() - data.issuedAt > SESSION_TTL_MS) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Default fallback demo session for local development or preview users.
 */
export function getDemoSession(role: UserRole = 'customer'): SessionData {
  if (role === 'vendor') {
    return {
      userId: 'usr_v_ashutosh',
      role: 'vendor',
      name: 'श्री. आशुतोष कुलकर्णी',
      phone: '9822012345',
      vendorId: 'vnd_pune_kulkarni_studio',
      issuedAt: Date.now(),
    };
  }
  if (role === 'admin') {
    return {
      userId: 'usr_admin_seema',
      role: 'admin',
      name: 'सीमा देशपांडे',
      issuedAt: Date.now(),
    };
  }
  return {
    userId: 'usr_c_ramesh',
    role: 'customer',
    name: 'श्री. रमेश पाटील',
    phone: '9822012345',
    eventId: 'evt_patil_vivah',
    issuedAt: Date.now(),
  };
}

/**
 * Resolves current user session from HTTP-only cookie.
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (raw) {
      const verified = verifySession(raw);
      if (verified) return verified;
    }
  } catch {
    // cookies() unavailable in non-request contexts
  }
  if (demoModeEnabled()) return getDemoSession('customer');
  return null;
}

/**
 * Sets session cookie with strict security flags.
 */
export async function setSession(data: SessionData): Promise<void> {
  const token = signSession(data);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

/**
 * Clears current session cookie.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Guard: Requires caller to be authenticated with one of the allowed roles.
 */
export async function requireUser(allowedRoles?: UserRole[]): Promise<SessionData> {
  const session = await getSession();
  if (!session) throw new Error('सत्र आवश्यक आहे. कृपया पुन्हा प्रवेश करा.');
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    throw new Error(`अनधिकृत प्रवेश: ${session.role} या भूमिकेस परवानगी नाही.`);
  }
  return session;
}

/**
 * Guard: Requires caller to be an authorized vendor matching the requested vendorId.
 */
export async function requireVendor(targetVendorId?: string): Promise<{ session: SessionData; vendorId: string }> {
  const session = await getSession();
  if (!session) throw new Error('विक्रेता सत्र आवश्यक आहे.');
  const effectiveVendorId = session.vendorId || (session.role === 'admin' ? targetVendorId : undefined);

  if (!effectiveVendorId) {
    if (!demoModeEnabled()) throw new Error('विक्रेता सत्र आवश्यक आहे.');
    return { session: getDemoSession('vendor'), vendorId: targetVendorId ?? 'vnd_pune_kulkarni_studio' };
  }

  if (targetVendorId && effectiveVendorId !== targetVendorId && session.role !== 'admin') {
    throw new Error('अनधिकृत: आपण या विक्रेत्याचे खाते बदलू शकत नाही.');
  }

  return { session, vendorId: effectiveVendorId };
}

/**
 * Form protection: checks for bot submissions via invisible honeypot field.
 */
export function verifyHoneypot(formData: FormData, fieldName: string = '_hp_family_name'): boolean {
  const trapValue = formData.get(fieldName);
  // Honeypot should remain empty for humans. If a bot fills it, trapValue will be non-empty.
  return !trapValue || String(trapValue).trim().length === 0;
}
