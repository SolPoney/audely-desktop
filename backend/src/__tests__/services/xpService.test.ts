import { describe, it, expect, vi } from 'vitest';
import { enregistrerGainXP } from '../../services/xpService.js';

const makeConnection = () => ({ execute: vi.fn().mockResolvedValue([{}]) } as any);

describe('enregistrerGainXP', () => {
  it('score 60, niveau facile → 9 XP (60 * 0.15), pas de bonus', async () => {
    const connection = makeConnection();
    const res = await enregistrerGainXP(connection, 1, 10, 60, 'facile');

    expect(res).toEqual({ montantBase: 9, bonus: 0, total: 9 });
    expect(connection.execute).toHaveBeenCalledTimes(1);
  });

  it('score 85, niveau moyen → 21 XP de base (85 * 0.25 arrondi) + 5 bonus', async () => {
    const connection = makeConnection();
    const res = await enregistrerGainXP(connection, 1, 10, 85, 'moyen');

    expect(res).toEqual({ montantBase: 21, bonus: 5, total: 26 });
    expect(connection.execute).toHaveBeenCalledTimes(2);
  });

  it('score exactement 80 (seuil) → bonus accordé', async () => {
    const connection = makeConnection();
    const res = await enregistrerGainXP(connection, 1, 10, 80, 'difficile');

    expect(res.bonus).toBe(5);
  });

  it('niveau inconnu → traité comme "facile" (multiplicateur 0.15)', async () => {
    const connection = makeConnection();
    const res = await enregistrerGainXP(connection, 1, 10, 100, 'inconnu');

    expect(res.montantBase).toBe(15);
  });
});
