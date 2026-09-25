import { describe, it, expect } from 'vitest';
import {
  signSession,
  verifySession,
  getDemoSession,
  verifyHoneypot,
  type SessionData,
} from '../apps/web/src/lib/session';

describe('Security & Session Module (Phase 1)', () => {
  const sampleSession: SessionData = {
    userId: 'usr_c_ramesh',
    role: 'customer',
    name: 'श्री. रमेश पाटील',
    phone: '9822012345',
    eventId: 'evt_patil_vivah',
    issuedAt: Date.now(),
  };

  it('signs and verifies a valid session payload', () => {
    const token = signSession(sampleSession);
    expect(typeof token).toBe('string');
    expect(token.includes('.')).toBe(true);

    const verified = verifySession(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe('usr_c_ramesh');
    expect(verified?.role).toBe('customer');
    expect(verified?.name).toBe('श्री. रमेश पाटील');
  });

  it('rejects tampered session tokens (payload modification)', () => {
    const token = signSession(sampleSession);
    const [payload, hmac] = token.split('.');

    // Tamper with payload to elevate role to admin
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...sampleSession, role: 'admin', userId: 'usr_admin_hacker' }),
    ).toString('base64url');

    const tamperedToken = `${tamperedPayload}.${hmac}`;
    const result = verifySession(tamperedToken);
    expect(result).toBeNull();
  });

  it('rejects tampered signatures (HMAC alteration)', () => {
    const token = signSession(sampleSession);
    const [payload] = token.split('.');
    const fakeHmac = 'fake_signature_that_does_not_match_payload_hash';

    const tamperedToken = `${payload}.${fakeHmac}`;
    expect(verifySession(tamperedToken)).toBeNull();
  });

  it('rejects expired sessions (> 30 days old)', () => {
    const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
    const expiredSession: SessionData = {
      ...sampleSession,
      issuedAt: thirtyOneDaysAgo,
    };

    const token = signSession(expiredSession);
    expect(verifySession(token)).toBeNull();
  });

  it('provides safe demo sessions for dev/preview users', () => {
    const customer = getDemoSession('customer');
    expect(customer.role).toBe('customer');
    expect(customer.userId).toBe('usr_c_ramesh');

    const vendor = getDemoSession('vendor');
    expect(vendor.role).toBe('vendor');
    expect(vendor.vendorId).toBe('vnd_pune_kulkarni_studio');

    const admin = getDemoSession('admin');
    expect(admin.role).toBe('admin');
  });

  describe('Anti-Spam Honeypot Verification', () => {
    it('accepts forms when honeypot field is empty (human behavior)', () => {
      const form = new FormData();
      form.append('name', 'अनिल जोशी');
      form.append('phone', '9822000000');
      // No honeypot field or empty string
      expect(verifyHoneypot(form)).toBe(true);

      form.append('_hp_family_name', '');
      expect(verifyHoneypot(form)).toBe(true);
    });

    it('rejects forms when honeypot field is filled by spambots', () => {
      const form = new FormData();
      form.append('name', 'Bot spammer');
      form.append('_hp_family_name', 'Automated Bot Entry');
      expect(verifyHoneypot(form)).toBe(false);
    });
  });
});
