import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({
  default: { execute: vi.fn() },
}));

import pool from '../../config/db.js';
import { getStats } from '../../controllers/statsController.js';

const mockExecute = vi.mocked(pool.execute);

// ─────────────────────────────────────────────────────────
// Mocks req / res Express
// ─────────────────────────────────────────────────────────
const makeReq = (userId = 1) => ({ user: { id: userId } } as any);
const makeRes = () => {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
};

// ─────────────────────────────────────────────────────────
// Helper : mock les 10 requêtes SQL de getStats dans l'ordre
// ─────────────────────────────────────────────────────────
interface StatsOverrides {
  xp?: number;
  streak_jours?: string[];   // dates ISO 'YYYY-MM-DD', ordre DESC
  totalSessions?: number;
  maxScore?: number;
  facileDone?: number;
  facileTotal?: number;
  moyenNb?: number;
}

const setupGetStats = ({
  xp = 0,
  streak_jours = [],
  totalSessions = 0,
  maxScore = 0,
  facileDone = 0,
  facileTotal = 0,
  moyenNb = 0,
}: StatsOverrides = {}) => {
  mockExecute
    .mockResolvedValueOnce([[]])                        // 1. parType
    .mockResolvedValueOnce([[]])                        // 2. historique
    .mockResolvedValueOnce([[{                          // 3. global
      total_sessions: totalSessions,
      score_global: 0,
      meilleur_score: maxScore,
    }]])
    .mockResolvedValueOnce([                            // 4. jours (streak)
      streak_jours.map(j => ({ jour: j })),
    ])
    .mockResolvedValueOnce([[{ total_xp: xp }]])        // 5. xpRes
    .mockResolvedValueOnce([[{                          // 6. maxScoreRes
      max_score: maxScore,
      total_sessions: totalSessions,
    }]])
    .mockResolvedValueOnce([[{ done: facileDone }]])    // 7. facileDoneRes
    .mockResolvedValueOnce([[{ total: facileTotal }]])  // 8. facileTotalRes
    .mockResolvedValueOnce([[{ nb: moyenNb }]])         // 9. moyenRes
    .mockResolvedValueOnce([[]])                        // 10. progression
    ;
};

// Dates pour les tests de streak — utilise la date LOCALE (pas UTC)
// pour correspondre à la comparaison faite dans le controller
const dayOffset = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${j}`;
};

// ─────────────────────────────────────────────────────────
describe('getStats — calcul du niveau (XP)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('0 XP → Débutant, niveau 1, nextXP=100, xpPct=0', async () => {
    setupGetStats({ xp: 0 });
    const res = makeRes();
    await getStats(makeReq(), res);

    const { niveau } = res.json.mock.calls[0][0];
    expect(niveau.nom).toBe('Débutant');
    expect(niveau.niveau).toBe(1);
    expect(niveau.nextXP).toBe(100);
    expect(niveau.xpPct).toBe(0);
  });

  it('50 XP → Débutant, xpPct=50 (50/100)', async () => {
    setupGetStats({ xp: 50 });
    const res = makeRes();
    await getStats(makeReq(), res);

    const { niveau } = res.json.mock.calls[0][0];
    expect(niveau.nom).toBe('Débutant');
    expect(niveau.niveau).toBe(1);
    expect(niveau.xpPct).toBe(50);
  });

  it('100 XP exactement → Apprenti, niveau 2, xpPct=0', async () => {
    setupGetStats({ xp: 100 });
    const res = makeRes();
    await getStats(makeReq(), res);

    const { niveau } = res.json.mock.calls[0][0];
    expect(niveau.nom).toBe('Apprenti');
    expect(niveau.niveau).toBe(2);
    expect(niveau.prevXP).toBe(100);
    expect(niveau.nextXP).toBe(300);
    expect(niveau.xpPct).toBe(0);
  });

  it('200 XP → Apprenti, xpPct=50 (100/200)', async () => {
    setupGetStats({ xp: 200 });
    const res = makeRes();
    await getStats(makeReq(), res);

    const { niveau } = res.json.mock.calls[0][0];
    expect(niveau.nom).toBe('Apprenti');
    expect(niveau.xpPct).toBe(50);
  });

  it('1500 XP → Maître, niveau 6, nextXP=null, xpPct=100', async () => {
    setupGetStats({ xp: 1500 });
    const res = makeRes();
    await getStats(makeReq(), res);

    const { niveau } = res.json.mock.calls[0][0];
    expect(niveau.nom).toBe('Maître');
    expect(niveau.niveau).toBe(6);
    expect(niveau.nextXP).toBeNull();
    expect(niveau.xpPct).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────
describe('getStats — calcul du streak', () => {
  beforeEach(() => vi.clearAllMocks());

  it('aucune session → streak 0', async () => {
    setupGetStats({ streak_jours: [] });
    const res = makeRes();
    await getStats(makeReq(), res);

    expect(res.json.mock.calls[0][0].streak).toBe(0);
  });

  it("seulement aujourd'hui -> streak 1", async () => {
    setupGetStats({ streak_jours: [dayOffset(0)] });
    const res = makeRes();
    await getStats(makeReq(), res);

    expect(res.json.mock.calls[0][0].streak).toBe(1);
  });

  it('3 jours consécutifs → streak 3', async () => {
    setupGetStats({
      streak_jours: [dayOffset(0), dayOffset(1), dayOffset(2)],
    });
    const res = makeRes();
    await getStats(makeReq(), res);

    expect(res.json.mock.calls[0][0].streak).toBe(3);
  });

  it('trou dans la série → streak coupé', async () => {
    // aujourd'hui et il y a 2 jours, mais pas hier → série brisée après 1
    setupGetStats({
      streak_jours: [dayOffset(0), dayOffset(2)],
    });
    const res = makeRes();
    await getStats(makeReq(), res);

    expect(res.json.mock.calls[0][0].streak).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────
describe('getStats — badges', () => {
  beforeEach(() => vi.clearAllMocks());

  it('"Premier pas" débloqué dès 1 session', async () => {
    setupGetStats({ totalSessions: 1 });
    const res = makeRes();
    await getStats(makeReq(), res);

    const badge = res.json.mock.calls[0][0].badges.find((b: any) => b.id === 'premier_pas');
    expect(badge.unlocked).toBe(true);
  });

  it('"Premier pas" verrouillé si 0 session', async () => {
    setupGetStats({ totalSessions: 0 });
    const res = makeRes();
    await getStats(makeReq(), res);

    const badge = res.json.mock.calls[0][0].badges.find((b: any) => b.id === 'premier_pas');
    expect(badge.unlocked).toBe(false);
  });

  it('"Oreille d\'or" debloque si meilleur score = 100', async () => {
    setupGetStats({ maxScore: 100, totalSessions: 1 });
    const res = makeRes();
    await getStats(makeReq(), res);

    const badge = res.json.mock.calls[0][0].badges.find((b: any) => b.id === 'score_parfait');
    expect(badge.unlocked).toBe(true);
  });

  it('"Star" (streak 3) débloqué avec 3 jours consécutifs', async () => {
    setupGetStats({
      streak_jours: [dayOffset(0), dayOffset(1), dayOffset(2)],
      totalSessions: 3,
    });
    const res = makeRes();
    await getStats(makeReq(), res);

    const badge = res.json.mock.calls[0][0].badges.find((b: any) => b.id === 'serie_3');
    expect(badge.unlocked).toBe(true);
  });

  it('"Star" verrouillé avec seulement 2 jours consécutifs', async () => {
    setupGetStats({
      streak_jours: [dayOffset(0), dayOffset(1)],
      totalSessions: 2,
    });
    const res = makeRes();
    await getStats(makeReq(), res);

    const badge = res.json.mock.calls[0][0].badges.find((b: any) => b.id === 'serie_3');
    expect(badge.unlocked).toBe(false);
  });

  it('"Bases solides" débloqué si tous les exercices facile sont faits', async () => {
    setupGetStats({ facileDone: 5, facileTotal: 5 });
    const res = makeRes();
    await getStats(makeReq(), res);

    const badge = res.json.mock.calls[0][0].badges.find((b: any) => b.id === 'facile_maitrise');
    expect(badge.unlocked).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────
describe('getStats — sécurité', () => {
  it('renvoie 401 si userId manquant', async () => {
    const req = { user: undefined } as any;
    const res = makeRes();
    await getStats(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
