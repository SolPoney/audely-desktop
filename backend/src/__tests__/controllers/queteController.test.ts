import { describe, it, expect, vi, beforeEach } from 'vitest';

// On mock la base de données AVANT d'importer le controller
vi.mock('../../config/db.js', () => ({
  default: { execute: vi.fn() },
}));

import pool from '../../config/db.js';
import { updateRevision } from '../../controllers/queteController.js';

const mockExecute = vi.mocked(pool.execute);

describe('updateRevision — algorithme FSRS', () => {
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

    it('insère une nouvelle ligne quand aucune révision n\'existe pour cet exercice', async () => {
      await updateRevision(1, 1, 80);

      const [sql] = mockExecute.mock.calls[1] as [string, unknown[]];
      expect(sql).toContain('INSERT');
    });

    it('score < 50 (Again) → intervalle très court (≤ 2 jours)', async () => {
      await updateRevision(1, 1, 30);

      const [, params] = mockExecute.mock.calls[1] as [string, unknown[]];
      const intervalle = params[3] as number;
      expect(intervalle).toBeLessThanOrEqual(2);
      expect(intervalle).toBeGreaterThanOrEqual(1); // jamais 0
    });

    it('un score plus élevé produit un intervalle au moins aussi long qu\'un score plus bas', async () => {
      await updateRevision(1, 1, 95); // Easy

      const [, paramsEasy] = mockExecute.mock.calls[1] as [string, unknown[]];
      const intervalleEasy = paramsEasy[3] as number;

      vi.clearAllMocks();
      mockExecute.mockResolvedValueOnce([[]]);
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await updateRevision(1, 1, 75); // Good

      const [, paramsGood] = mockExecute.mock.calls[1] as [string, unknown[]];
      const intervalleGood = paramsGood[3] as number;

      expect(intervalleEasy).toBeGreaterThan(intervalleGood);
    });

    it('persiste la stabilité, la difficulté, l\'état FSRS et le nombre d\'échecs', async () => {
      await updateRevision(1, 1, 80);

      const [, params] = mockExecute.mock.calls[1] as [string, unknown[]];
      // idUtilisateur, idExercice, prochaine, intervalle, reps, stabilite, difficulte, etat, echecs, derniere_revision
      expect(params[4]).toBe(1); // reps
      expect(params[5]).toBeGreaterThan(0); // stabilité initialisée
      expect(params[6]).toBeGreaterThan(0); // difficulté initialisée
      expect(params[8]).toBe(0); // pas d'échec au premier essai réussi
    });
  });

  // ── Révision existante — UPDATE ────────────────────────
  describe('révision existante — UPDATE', () => {
    // Carte FSRS déjà établie : stabilité 10, en état "Review", échéance = aujourd'hui
    const carteExistante = () => {
      const hier = new Date();
      hier.setDate(hier.getDate() - 10);
      const aujourdhui = new Date().toISOString().slice(0, 10);
      mockExecute.mockResolvedValueOnce([[{
        prochaine_revision: aujourdhui,
        intervalle_jours: 10,
        nb_revisions: 2,
        stabilite: 10,
        difficulte: 3,
        etat: 2, // State.Review
        nb_echecs: 0,
        derniere_revision: hier.toISOString().slice(0, 10),
      }]]);
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    };

    it('met à jour (pas insère) quand une révision existe déjà', async () => {
      carteExistante();
      await updateRevision(1, 2, 85);

      const [sql] = mockExecute.mock.calls[1] as [string, unknown[]];
      expect(sql).toContain('UPDATE');
    });

    it('un succès (Good) sur une carte déjà stable augmente l\'intervalle au-delà de l\'ancien', async () => {
      carteExistante();
      await updateRevision(1, 2, 85); // Good

      const [, params] = mockExecute.mock.calls[1] as [string, unknown[]];
      const nouvelIntervalle = params[1] as number;
      expect(nouvelIntervalle).toBeGreaterThan(10);
    });

    it('un échec (score < 50) fait chuter l\'intervalle et incrémente le nombre d\'échecs', async () => {
      carteExistante();
      await updateRevision(1, 2, 20); // Again

      const [, params] = mockExecute.mock.calls[1] as [string, unknown[]];
      const nouvelIntervalle = params[1] as number;
      const nbEchecs = params[6] as number;
      expect(nouvelIntervalle).toBeLessThan(10);
      expect(nbEchecs).toBe(1); // 0 -> 1
    });

    it('le nombre de répétitions (reps) augmente à chaque révision', async () => {
      carteExistante();
      await updateRevision(1, 2, 85);

      const [, params] = mockExecute.mock.calls[1] as [string, unknown[]];
      expect(params[2]).toBe(3); // nb_revisions : 2 -> 3
    });
  });
});
