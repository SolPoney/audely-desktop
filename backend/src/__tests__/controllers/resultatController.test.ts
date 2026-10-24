import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({
  default: { getConnection: vi.fn() },
}));
vi.mock('../../services/serieService.js', () => ({
  mettreAJourSerie: vi.fn(),
}));
vi.mock('../../controllers/queteController.js', () => ({
  updateRevision: vi.fn(),
}));

import pool from '../../config/db.js';
import { saveResultat } from '../../controllers/resultatController.js';
import { mettreAJourSerie } from '../../services/serieService.js';
import { updateRevision } from '../../controllers/queteController.js';

const mockGetConnection = vi.mocked(pool.getConnection);
const mockMettreAJourSerie = vi.mocked(mettreAJourSerie);
const mockUpdateRevision = vi.mocked(updateRevision);

const makeReq = (body: any, userId: number | undefined = 1) =>
  ({ user: userId === undefined ? undefined : { id: userId }, body } as any);

const makeRes = () => {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
};

const makeConnection = () => ({
  beginTransaction: vi.fn(),
  commit: vi.fn(),
  rollback: vi.fn(),
  release: vi.fn(),
  execute: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
});

describe('saveResultat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('insère le résultat, met à jour la série, puis le FSRS hors transaction, et renvoie 201', async () => {
    const connection = makeConnection();
    mockGetConnection.mockResolvedValue(connection as any);
    mockMettreAJourSerie.mockResolvedValue({
      streakAvant: 2,
      streakActuelle: 3,
      streakRecord: 3,
      gelUtilise: false,
      gelsDisponibles: 1,
      nouveauRecord: true,
    });

    const req = makeReq({ id_exercice: 5, score: 80 });
    const res = makeRes();
    await saveResultat(req, res);

    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(connection.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO Resultats'),
      [1, 5, 80],
    );
    expect(mockMettreAJourSerie).toHaveBeenCalledWith(connection, 1);
    expect(connection.commit).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
    expect(mockUpdateRevision).toHaveBeenCalledWith(1, 5, 80);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ serie: expect.objectContaining({ streakActuelle: 3 }) }),
    );
  });

  it('annule la transaction (rollback) si la mise à jour de la série échoue, et ne touche pas au FSRS', async () => {
    const connection = makeConnection();
    mockGetConnection.mockResolvedValue(connection as any);
    mockMettreAJourSerie.mockRejectedValue(new Error('boom'));

    const req = makeReq({ id_exercice: 5, score: 80 });
    const res = makeRes();
    await saveResultat(req, res);

    expect(connection.rollback).toHaveBeenCalled();
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
    expect(mockUpdateRevision).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('rejette un score hors de 0-100 sans ouvrir de connexion', async () => {
    const req = makeReq({ id_exercice: 5, score: 150 });
    const res = makeRes();
    await saveResultat(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockGetConnection).not.toHaveBeenCalled();
  });

  it('rejette un id_exercice invalide', async () => {
    const req = makeReq({ id_exercice: 0, score: 50 });
    const res = makeRes();
    await saveResultat(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('renvoie 401 si userId manquant', async () => {
    const req = { user: undefined, body: { id_exercice: 1, score: 50 } } as any;
    const res = makeRes();
    await saveResultat(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockGetConnection).not.toHaveBeenCalled();
  });
});
