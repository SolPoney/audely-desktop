import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({
  default: { execute: vi.fn() },
}));

import pool from '../../config/db.js';
import { getExercicesMinimal, getExercicesParNiveau } from '../../controllers/exerciceController.js';

const mockExecute = vi.mocked(pool.execute);

const makeReq = (params: Record<string, string> = {}) => ({ params } as any);
const makeRes = () => {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
};

describe('getExercicesMinimal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('interroge bien la base sans filtre et répond 200 avec les lignes', async () => {
    const rows = [{ id: 1, niveau: 'facile', categorie_id: 3 }, { id: 2, niveau: 'moyen', categorie_id: 4 }];
    mockExecute.mockResolvedValueOnce([rows] as any);
    const res = makeRes();

    await getExercicesMinimal(makeReq(), res);

    expect(mockExecute).toHaveBeenCalledWith('SELECT id, niveau, categorie_id FROM Exercices');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  it('renvoie 500 si la requête échoue', async () => {
    mockExecute.mockRejectedValueOnce(new Error('boom'));
    const res = makeRes();

    await getExercicesMinimal(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('getExercicesParNiveau', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filtre par niveau et répond 200 avec les lignes', async () => {
    const rows = [{ id: 1, niveau: 'moyen', categorie_id: 3, titre: 'Test' }];
    mockExecute.mockResolvedValueOnce([rows] as any);
    const res = makeRes();

    await getExercicesParNiveau(makeReq({ niveau: 'moyen' }), res);

    expect(mockExecute).toHaveBeenCalledWith('SELECT * FROM Exercices WHERE niveau = ?', ['moyen']);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(rows);
  });

  it('renvoie 500 si la requête échoue', async () => {
    mockExecute.mockRejectedValueOnce(new Error('boom'));
    const res = makeRes();

    await getExercicesParNiveau(makeReq({ niveau: 'facile' }), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
