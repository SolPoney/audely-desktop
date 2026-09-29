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

  // ── Déjà révisé aujourd'hui : ne pas faire avancer la carte deux fois ──
  describe("déjà révisé aujourd'hui", () => {
    it("n'écrit rien si l'exercice a déjà été révisé aujourd'hui (évite de fausser FSRS)", async () => {
      const aujourdhui = new Date().toISOString().slice(0, 10);
      mockExecute.mockResolvedValueOnce([[{
        prochaine_revision: aujourdhui,
        intervalle_jours: 3,
        nb_revisions: 1,
        stabilite: 2.3,
        difficulte: 5,
        etat: 2,
        nb_echecs: 0,
        derniere_revision: new Date().toISOString(), // révisé il y a un instant, aujourd'hui
      }]]);

      await updateRevision(1, 3, 90);

      // Seul le SELECT a dû être exécuté — aucun INSERT ni UPDATE.
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    it("mais révise normalement si la dernière révision date d'un jour différent", async () => {
      const hier = new Date();
      hier.setDate(hier.getDate() - 1);
      mockExecute.mockResolvedValueOnce([[{
        prochaine_revision: new Date().toISOString().slice(0, 10),
        intervalle_jours: 3,
        nb_revisions: 1,
        stabilite: 2.3,
        difficulte: 5,
        etat: 2,
        nb_echecs: 0,
        derniere_revision: hier.toISOString(),
      }]]);
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await updateRevision(1, 3, 90);

      expect(mockExecute).toHaveBeenCalledTimes(2);
      const [sql] = mockExecute.mock.calls[1] as [string, unknown[]];
      expect(sql).toContain('UPDATE');
    });
  });

  // ── Race condition : deux requêtes concurrentes pour la même paire ──
  describe('insertion concurrente (contrainte UNIQUE)', () => {
    it('bascule sur un UPDATE si une autre requête a créé la ligne entre-temps (ER_DUP_ENTRY)', async () => {
      mockExecute.mockResolvedValueOnce([[]]); // SELECT : rien trouvé
      mockExecute.mockRejectedValueOnce(Object.assign(new Error('Duplicate entry'), { code: 'ER_DUP_ENTRY' })); // INSERT : collision
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE de repli

      await expect(updateRevision(1, 4, 80)).resolves.not.toThrow();

      expect(mockExecute).toHaveBeenCalledTimes(3);
      const [sqlRepli] = mockExecute.mock.calls[2] as [string, unknown[]];
      expect(sqlRepli).toContain('UPDATE');
    });

    it('propage toute autre erreur SQL sans la masquer en repli UPDATE', async () => {
      mockExecute.mockResolvedValueOnce([[]]);
      mockExecute.mockRejectedValueOnce(Object.assign(new Error('Connexion perdue'), { code: 'PROTOCOL_CONNECTION_LOST' }));

      await expect(updateRevision(1, 4, 80)).rejects.toThrow('Connexion perdue');
    });
  });
});
