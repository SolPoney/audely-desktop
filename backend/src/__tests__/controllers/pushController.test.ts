import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({
  default: { execute: vi.fn() },
}));
vi.mock('../../services/notificationService.js', () => ({
  envoyerRappelsDuJour: vi.fn(),
}));

import pool from '../../config/db.js';
import { getVapidPublicKey, subscribe, unsubscribe, declencherRappels } from '../../controllers/pushController.js';
import { envoyerRappelsDuJour } from '../../services/notificationService.js';

const mockExecute = vi.mocked(pool.execute);
const mockEnvoyerRappels = vi.mocked(envoyerRappelsDuJour);

const makeReq = (overrides: any = {}) => ({ user: { id: 1 }, body: {}, query: {}, header: () => undefined, ...overrides } as any);
const makeRes = () => {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
};

describe('getVapidPublicKey', () => {
  it('renvoie la clé publique depuis les variables d\'environnement', () => {
    process.env.VAPID_PUBLIC_KEY = 'ma-cle-publique';
    const res = makeRes();
    getVapidPublicKey({} as any, res);
    expect(res.json).toHaveBeenCalledWith({ publicKey: 'ma-cle-publique' });
  });
});

describe('subscribe', () => {
  beforeEach(() => vi.clearAllMocks());

  it('enregistre un abonnement valide (upsert sur endpoint)', async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const req = makeReq({ body: { endpoint: 'https://push/abc', keys: { p256dh: 'a', auth: 'b' } } });
    const res = makeRes();
    await subscribe(req, res);

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining('ON DUPLICATE KEY UPDATE'),
      [1, 'https://push/abc', 'a', 'b'],
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('rejette un abonnement sans clés', async () => {
    const req = makeReq({ body: { endpoint: 'https://push/abc' } });
    const res = makeRes();
    await subscribe(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('renvoie 401 si userId manquant', async () => {
    const req = makeReq({ user: undefined, body: { endpoint: 'x', keys: { p256dh: 'a', auth: 'b' } } });
    const res = makeRes();
    await subscribe(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('unsubscribe', () => {
  beforeEach(() => vi.clearAllMocks());

  it('supprime l\'abonnement de l\'utilisateur courant', async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const req = makeReq({ body: { endpoint: 'https://push/abc' } });
    const res = makeRes();
    await unsubscribe(req, res);

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM AbonnementPush'),
      [1, 'https://push/abc'],
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('declencherRappels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'le-bon-secret';
  });

  it('secret correct (en-tête) → déclenche l\'envoi', async () => {
    mockEnvoyerRappels.mockResolvedValueOnce({ envoyes: 3, erreurs: 0, horsCreneau: false });
    const req = makeReq({ user: undefined, header: (name: string) => (name === 'X-Cron-Secret' ? 'le-bon-secret' : undefined) });
    const res = makeRes();
    await declencherRappels(req, res);

    expect(mockEnvoyerRappels).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ envoyes: 3, erreurs: 0, horsCreneau: false });
  });

  it('secret correct (query param) → déclenche l\'envoi', async () => {
    mockEnvoyerRappels.mockResolvedValueOnce({ envoyes: 0, erreurs: 0, horsCreneau: true });
    const req = makeReq({ user: undefined, query: { secret: 'le-bon-secret' } });
    const res = makeRes();
    await declencherRappels(req, res);

    expect(mockEnvoyerRappels).toHaveBeenCalled();
  });

  it('secret manquant ou incorrect → 401, aucun envoi', async () => {
    const req = makeReq({ user: undefined, query: { secret: 'mauvais' } });
    const res = makeRes();
    await declencherRappels(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockEnvoyerRappels).not.toHaveBeenCalled();
  });
});
