import { describe, it, expect, vi } from 'vitest';
import { verifierNouveaux } from '../../services/badgeService.js';

interface Overrides {
  totalSessions?: number;
  maxScore?: number;
  facileDone?: number;
  facileTotal?: number;
  moyenNb?: number;
  dejaObtenus?: string[];
}

/** Connexion mockée : enchaîne les 5 SELECT de verifierNouveaux dans l'ordre, puis les INSERT. */
const makeConnection = ({
  totalSessions = 0,
  maxScore = 0,
  facileDone = 0,
  facileTotal = 0,
  moyenNb = 0,
  dejaObtenus = [],
}: Overrides = {}) => {
  const execute = vi.fn()
    .mockResolvedValueOnce([[{ total_sessions: totalSessions, max_score: maxScore }]])
    .mockResolvedValueOnce([[{ done: facileDone }]])
    .mockResolvedValueOnce([[{ total: facileTotal }]])
    .mockResolvedValueOnce([[{ nb: moyenNb }]])
    .mockResolvedValueOnce([dejaObtenus.map((id) => ({ id_badge: id }))])
    .mockResolvedValue([{ affectedRows: 1 }]); // tous les INSERT suivants
  return { execute } as any;
};

describe('verifierNouveaux', () => {
  it('premier exercice jamais fait → débloque "premier_pas"', async () => {
    const connection = makeConnection({ totalSessions: 1 });
    const nouveaux = await verifierNouveaux(connection, 1, 0);

    expect(nouveaux.map((b) => b.id)).toContain('premier_pas');
  });

  it('badge déjà obtenu → non réinséré ni re-signalé comme "nouveau"', async () => {
    const connection = makeConnection({ totalSessions: 5, dejaObtenus: ['premier_pas'] });
    const nouveaux = await verifierNouveaux(connection, 1, 0);

    expect(nouveaux.map((b) => b.id)).not.toContain('premier_pas');
    // Seul l'INSERT du SELECT initial doit avoir été appelé, pas d'INSERT pour premier_pas
    const insertCalls = connection.execute.mock.calls.filter((c: any[]) => c[0].includes('INSERT'));
    expect(insertCalls.length).toBe(0);
  });

  it('score parfait (100) → débloque "score_parfait"', async () => {
    const connection = makeConnection({ totalSessions: 1, maxScore: 100 });
    const nouveaux = await verifierNouveaux(connection, 1, 0);

    expect(nouveaux.map((b) => b.id)).toContain('score_parfait');
  });

  it('streak de 3 (passé en paramètre, pas recalculé) → débloque "serie_3"', async () => {
    const connection = makeConnection({ totalSessions: 1 });
    const nouveaux = await verifierNouveaux(connection, 1, 3);

    expect(nouveaux.map((b) => b.id)).toContain('serie_3');
  });

  it('tous les exercices faciles terminés → débloque "facile_maitrise"', async () => {
    const connection = makeConnection({ totalSessions: 1, facileDone: 5, facileTotal: 5 });
    const nouveaux = await verifierNouveaux(connection, 1, 0);

    expect(nouveaux.map((b) => b.id)).toContain('facile_maitrise');
  });

  it('insère une ligne BadgeObtenu pour chaque badge nouvellement débloqué', async () => {
    const connection = makeConnection({ totalSessions: 1 });
    await verifierNouveaux(connection, 1, 0);

    expect(connection.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO BadgeObtenu'),
      [1, 'premier_pas'],
    );
  });

  it('aucune condition remplie → aucun badge renvoyé, aucun INSERT', async () => {
    const connection = makeConnection();
    const nouveaux = await verifierNouveaux(connection, 1, 0);

    expect(nouveaux).toEqual([]);
    const insertCalls = connection.execute.mock.calls.filter((c: any[]) => c[0].includes('INSERT'));
    expect(insertCalls.length).toBe(0);
  });
});
