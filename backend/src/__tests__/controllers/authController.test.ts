import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database pool BEFORE importing the controller
vi.mock('../../config/db.js', () => ({
  default: { execute: vi.fn() },
}));

// Mock argon2 to avoid native bindings in tests
vi.mock('argon2', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$argon2id$hashed'),
    verify: vi.fn(),
  },
}));

import argon2 from 'argon2';
import pool from '../../config/db.js';
import { register, login } from '../../controllers/authController.js';
import type { Request, Response } from 'express';

const mockExecute = vi.mocked(pool.execute);
const mockVerify = vi.mocked(argon2.verify);

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Create a minimal Express Request mock */
const makeReq = (body: Record<string, unknown>): Partial<Request> => ({ body });

/** Create a minimal Express Response mock that captures status + json calls */
const makeRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
};

// ── Security tests ────────────────────────────────────────────────────────────

describe('authController — security & input validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── register ───────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('rejects request with missing email (400)', async () => {
      const req = makeReq({ nom: 'Dupont', prenom: 'Marie', mot_de_passe: 'secret123' });
      const res = makeRes();
      await register(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects malformed email (400)', async () => {
      const req = makeReq({ nom: 'Dupont', prenom: 'Marie', email: 'not-an-email', mot_de_passe: 'secret123' });
      const res = makeRes();
      await register(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects password shorter than 8 characters (400)', async () => {
      const req = makeReq({ nom: 'Dupont', prenom: 'Marie', email: 'a@b.fr', mot_de_passe: 'short' });
      const res = makeRes();
      await register(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('accepts a valid registration and returns 201', async () => {
      mockExecute.mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }] as any);
      const req = makeReq({ nom: 'Dupont', prenom: 'Marie', email: 'marie@audely.fr', mot_de_passe: 'validPass1' });
      const res = makeRes();
      await register(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('returns 409 when the email is already taken (ER_DUP_ENTRY)', async () => {
      const dupError = Object.assign(new Error('Duplicate'), { code: 'ER_DUP_ENTRY' });
      mockExecute.mockRejectedValueOnce(dupError);
      const req = makeReq({ nom: 'Dupont', prenom: 'Marie', email: 'exists@audely.fr', mot_de_passe: 'validPass1' });
      const res = makeRes();
      await register(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  // ── login ──────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('rejects request with missing credentials (400)', async () => {
      const req = makeReq({});
      const res = makeRes();
      await login(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 401 (same message) for unknown email — prevents user enumeration', async () => {
      mockExecute.mockResolvedValueOnce([[]] as any); // no user found
      const req = makeReq({ email: 'ghost@audely.fr', mot_de_passe: 'anything' });
      const res = makeRes();
      await login(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email ou mot de passe incorrect' }));
    });

    it('returns 401 (same message) for wrong password — prevents user enumeration', async () => {
      mockExecute.mockResolvedValueOnce([[{ id: 1, mail: 'u@audely.fr', mot_de_passe: '$argon2id$hashed' }]] as any);
      mockVerify.mockResolvedValueOnce(false);
      const req = makeReq({ email: 'u@audely.fr', mot_de_passe: 'wrongpass' });
      const res = makeRes();
      await login(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email ou mot de passe incorrect' }));
    });

    it('returns a token (200) for valid credentials', async () => {
      process.env.JWT_SECRET = 'test_secret';
      mockExecute.mockResolvedValueOnce([[{ id: 1, mail: 'u@audely.fr', mot_de_passe: '$argon2id$hashed' }]] as any);
      mockVerify.mockResolvedValueOnce(true);
      const req = makeReq({ email: 'u@audely.fr', mot_de_passe: 'validPass1' });
      const res = makeRes();
      await login(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
    });
  });
});
