import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getUser, getUserId, isAuthenticated } from '../../hooks/useAuth';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal fake JWT with the given payload.
 * The signature is intentionally invalid (not verified on the client side).
 */
const makeToken = (payload: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake_signature`;
};

const VALID_TOKEN = makeToken({
  id: 42,
  email: 'test@audely.fr',
  exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
});

const EXPIRED_TOKEN = makeToken({
  id: 99,
  email: 'old@audely.fr',
  exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useAuth', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  // ── getUser ────────────────────────────────────────────────────────────────

  describe('getUser()', () => {
    it('returns null when localStorage has no token', () => {
      expect(getUser()).toBeNull();
    });

    it('returns the decoded user for a valid token', () => {
      localStorage.setItem('token', VALID_TOKEN);
      const user = getUser();
      expect(user).not.toBeNull();
      expect(user?.id).toBe(42);
      expect(user?.email).toBe('test@audely.fr');
    });

    it('returns null for an expired token', () => {
      localStorage.setItem('token', EXPIRED_TOKEN);
      expect(getUser()).toBeNull();
    });

    it('returns null for a malformed token', () => {
      localStorage.setItem('token', 'not.a.jwt');
      expect(getUser()).toBeNull();
    });

    it('returns null when the token has no id field', () => {
      const noIdToken = makeToken({ email: 'noid@test.fr', exp: Date.now() / 1000 + 3600 });
      localStorage.setItem('token', noIdToken);
      expect(getUser()).toBeNull();
    });
  });

  // ── getUserId ──────────────────────────────────────────────────────────────

  describe('getUserId()', () => {
    it('returns the user id from a valid token', () => {
      localStorage.setItem('token', VALID_TOKEN);
      expect(getUserId()).toBe(42);
    });

    it('returns 0 when no token is present', () => {
      expect(getUserId()).toBe(0);
    });
  });

  // ── isAuthenticated ────────────────────────────────────────────────────────

  describe('isAuthenticated()', () => {
    it('returns false when no token is stored', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true for a valid, non-expired token', () => {
      localStorage.setItem('token', VALID_TOKEN);
      expect(isAuthenticated()).toBe(true);
    });

    it('returns false for an expired token', () => {
      localStorage.setItem('token', EXPIRED_TOKEN);
      expect(isAuthenticated()).toBe(false);
    });
  });
});
