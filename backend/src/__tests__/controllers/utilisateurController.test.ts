import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({
  default: { execute: vi.fn() },
}));

import pool from '../../config/db.js';
import { completerOnboarding } from '../../controllers/utilisateurController.js';

const mockExecute = vi.mocked(pool.execute);

const makeReq = (body: any, userId: number | undefined = 1) =>
  ({ user: userId === undefined ? undefined : { id: userId }, body } as any);

const makeRes = () => {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
};

describe('completerOnboarding', () => {
  beforeEach(() => vi.clearAllMocks());

  it('enregistre un objectif valide et renvoie 200', async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }] as any);
    const req = makeReq({ objectif_quotidien_xp: 50 });
    const res = makeRes();
    await completerOnboarding(req, res);

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE Utilisateur'),
      [50, 1],
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it.each([0, 15, 100, -30, NaN])('rejette un objectif invalide (%s)', async (objectif) => {
    const req = makeReq({ objectif_quotidien_xp: objectif });
    const res = makeRes();
    await completerOnboarding(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('renvoie 401 si userId manquant', async () => {
    const req = { user: undefined, body: { objectif_quotidien_xp: 30 } } as any;
    const res = makeRes();
    await completerOnboarding(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
