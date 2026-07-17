import { describe, it, expect, vi, beforeEach } from 'vitest';

// On mock la base de données AVANT d'importer le controller
vi.mock('../../config/db.js', () => ({
  default: { execute: vi.fn() },
}));

import pool from '../../config/db.js';
import { updateRevision } from '../../controllers/queteController.js';

const mockExecute = vi.mocked(pool.execute);

// ─────────────────────────────────────────────────────────
// Aide : calcule la date dans N jours (même logique que le controller)
// ─────────────────────────────────────────────────────────
const dateInDays = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

describe('updateRevision — algorithme SM-2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Premier exercice (pas encore dans Revisions) ──────────
  describe('première révision — INSERT', () => {
    beforeEach(() => {
      // SELECT renvoie un tableau vide (pas d'entrée existante)
      mockExecute.mockResolvedValueOnce([[]]);
      // INSERT réussit
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    });

    it('score < 50 → intervalle 1 jour (on repart de zéro)', async () => {
      await updateRevision(1, 1, 30);

      const [sql, params] = mockExecute.mock.calls[1] as [string, unknown[]];
      expect(sql).toContain('INSERT');
      expect(params[3]).toBe(1); // nouvelIntervalle
      expect(params[2]).toBe(dateInDays(1)); // prochaine_revision
    });

    it('50 ≤ score < 80 → intervalle 3 jours', async () => {
      await updateRevision(1, 1, 60);

      const [, params] = mockExecute.mock.calls[1] as [string, unknown[]];
      expect(params[3]).toBe(3);
      expect(params[2]).toBe(dateInDays(3));
    });

    it('score ≥ 80, premier essai → intervalle 7 jours (max(1×2, 7) = 7)', async () => {
      await updateRevision(1, 1, 90);

      const [, params] = mockExecute.mock.calls[1] as [string, unknown[]];
      expect(params[3]).toBe(7);
      expect(params[2]).toBe(dateInDays(7));
    });
  });

  // ── Révision existante — UPDATE ────────────────────────
  describe('révision existante — UPDATE', () => {
    const mockExisting = (intervalleActuel: number) => {
      mockExecute.mockResolvedValueOnce([[{ intervalle_jours: intervalleActuel, nb_revisions: 2 }]]);
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    };

    it('score ≥ 80, intervalle=10 → 20 jours (10×2 = 20)', async () => {
      mockExisting(10);
      await updateRevision(1, 2, 85);

      const [sql, params] = mockExecute.mock.calls[1] as [string, unknown[]];
      expect(sql).toContain('UPDATE');
      expect(params[1]).toBe(20); // nouvelIntervalle
    });

    it('score ≥ 80, intervalle=20 → 30 jours (plafonné à 30)', async () => {
      mockExisting(20);
      await updateRevision(1, 2, 100);

      const [, params] = mockExecute.mock.calls[1] as [string, unknown[]];
      expect(params[1]).toBe(30);
    });

    it('score ≥ 80, intervalle=3 → 7 jours (max(3×2, 7) = 7)', async () => {
      mockExisting(3);
      await updateRevision(1, 2, 80);

      const [, params] = mockExecute.mock.calls[1] as [string, unknown[]];
      expect(params[1]).toBe(7);
    });

    it("50 <= score < 80, peu importe l'intervalle -> toujours 3 jours", async () => {
      mockExisting(14);
      await updateRevision(1, 2, 65);

      const [, params] = mockExecute.mock.calls[1] as [string, unknown[]];
      expect(params[1]).toBe(3);
    });

    it('score < 50 → remet à 1 jour (régresser)', async () => {
      mockExisting(7);
      await updateRevision(1, 2, 20);

      const [, params] = mockExecute.mock.calls[1] as [string, unknown[]];
      expect(params[1]).toBe(1);
    });
  });
});
