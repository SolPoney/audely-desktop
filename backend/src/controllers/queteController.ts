import pool from '../config/db.js';
import { Request, Response } from 'express';
import { fsrs, createEmptyCard, Rating, State, type Card, type Grade } from 'ts-fsrs';

/** Returns today's date as an ISO string (YYYY-MM-DD, UTC). */
const today = () => new Date().toISOString().slice(0, 10);

/* ── FSRS (Free Spaced Repetition Scheduler) ───────────────────────────────
 *
 * Remplace l'ancien algorithme SM-2 simplifié : les intervalles sont dérivés
 * d'un modèle de mémoire (stabilité/difficulté) plutôt que d'un doublement
 * fixe, ce qui s'adapte mieux à l'historique réel de chaque exercice.
 *
 * - enable_short_term: false — l'app ne propose qu'une tentative par exercice
 *   par jour (quête du jour), pas de répétitions "dans 10 minutes" comme sur
 *   une appli de flashcards ; on saute donc les paliers d'apprentissage courts.
 * - maximum_interval: 90 — on ne laisse jamais un exercice de côté trop
 *   longtemps, même très bien maîtrisé (le défaut de la librairie est 100 ans).
 */
const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 90,
  enable_fuzz: false,
  enable_short_term: false,
});

/** Convertit le score 0-100 obtenu à l'exercice en note qualitative FSRS. */
const scoreVersRating = (score: number): Grade => {
  if (score < 50) return Rating.Again;
  if (score < 70) return Rating.Hard;
  if (score < 90) return Rating.Good;
  return Rating.Easy;
};

interface RevisionRow {
  prochaine_revision: string;
  intervalle_jours: number;
  nb_revisions: number;
  stabilite: number | null;
  difficulte: number | null;
  etat: number;
  nb_echecs: number;
  derniere_revision: string | null;
}

/** Reconstruit la Card FSRS à partir de la ligne stockée en base. */
const versCard = (row: RevisionRow): Card => ({
  due: new Date(row.prochaine_revision),
  stability: row.stabilite ?? 0,
  difficulty: row.difficulte ?? 0,
  elapsed_days: 0,
  scheduled_days: row.intervalle_jours,
  learning_steps: 0,
  reps: row.nb_revisions,
  lapses: row.nb_echecs,
  state: row.etat as State,
  last_review: row.derniere_revision ? new Date(row.derniere_revision) : undefined,
});

/**
 * Create or update the spaced-repetition record for a completed exercise.
 *
 * Called automatically after each result is saved via `saveResultat`.
 * If no record exists for the (user, exercise) pair, a new FSRS card is
 * created. Otherwise the stored card state is rebuilt and advanced by one
 * review, then persisted.
 *
 * @param idUtilisateur - The user's database id
 * @param idExercice    - The exercise's database id
 * @param score         - Score obtained (0–100)
 */
export const updateRevision = async (
  idUtilisateur: number,
  idExercice: number,
  score: number,
): Promise<void> => {
  const [rows] = await pool.execute(
    `SELECT prochaine_revision, intervalle_jours, nb_revisions, stabilite, difficulte, etat, nb_echecs, derniere_revision
     FROM Revisions WHERE id_utilisateur = ? AND id_exercice = ?`,
    [idUtilisateur, idExercice],
  ) as any[];

  const existing = (rows as RevisionRow[])[0];

  // Déjà révisé aujourd'hui (l'app ne prévoit qu'une tentative par jour, mais
  // rien n'empêche techniquement de rejouer un exercice déjà fait via le
  // Parcours) : on ne fait pas avancer une seconde fois la carte FSRS le même
  // jour, ce qui fausserait le calcul (conçu pour un vrai écart de jours).
  if (existing?.derniere_revision && new Date(existing.derniere_revision).toISOString().slice(0, 10) === today()) {
    return;
  }

  const carteActuelle: Card = existing ? versCard(existing) : createEmptyCard();
  const rating = scoreVersRating(score);
  const maintenant = new Date();

  const { card: carteMaj } = scheduler.next(carteActuelle, maintenant, rating);

  const prochaine = carteMaj.due.toISOString().slice(0, 10);
  const intervalle = Math.max(1, Math.round(carteMaj.scheduled_days));
  const valeursCarte = [
    prochaine, intervalle, carteMaj.reps,
    carteMaj.stability, carteMaj.difficulty, carteMaj.state, carteMaj.lapses, maintenant,
  ];

  if (existing) {
    await pool.execute(
      `UPDATE Revisions SET prochaine_revision = ?, intervalle_jours = ?, nb_revisions = ?,
         stabilite = ?, difficulte = ?, etat = ?, nb_echecs = ?, derniere_revision = ?
       WHERE id_utilisateur = ? AND id_exercice = ?`,
      [...valeursCarte, idUtilisateur, idExercice],
    );
  } else {
    try {
      await pool.execute(
        `INSERT INTO Revisions
           (id_utilisateur, id_exercice, prochaine_revision, intervalle_jours, nb_revisions, stabilite, difficulte, etat, nb_echecs, derniere_revision)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [idUtilisateur, idExercice, ...valeursCarte],
      );
    } catch (err: any) {
      // Une requête concurrente a créé la ligne entre le SELECT et l'INSERT
      // (double clic, retry réseau) : la contrainte UNIQUE(id_utilisateur,
      // id_exercice) la rejette ; on bascule sur une mise à jour pour éviter
      // un doublon dans Revisions plutôt que de laisser planter la requête.
      if (err?.code === 'ER_DUP_ENTRY') {
        await pool.execute(
          `UPDATE Revisions SET prochaine_revision = ?, intervalle_jours = ?, nb_revisions = ?,
             stabilite = ?, difficulte = ?, etat = ?, nb_echecs = ?, derniere_revision = ?
           WHERE id_utilisateur = ? AND id_exercice = ?`,
          [...valeursCarte, idUtilisateur, idExercice],
        );
      } else {
        throw err;
      }
    }
  }
};

/**
 * Build the daily quest (up to 10 exercises) for the authenticated user.
 *
 * Priority order:
 *   1. Exercises due for review today (FSRS `prochaine_revision <= today`)
 *   2. Exercises never attempted by the user (random order)
 *
 * Also returns whether the quest is already complete for today.
 *
 * @route GET /api/quete-du-jour
 * @access Private (JWT required)
 */
export const getQueteDuJour = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Non autorisé' });

    const todayStr = today();

    // 1. Exercices à réviser aujourd'hui
    const [revisions] = await pool.execute(
      `SELECT e.id, e.titre, e.niveau, e.type_exercice, e.contenu, e.categorie_id,
              r.intervalle_jours, r.nb_revisions
       FROM Revisions r
       JOIN Exercices e ON r.id_exercice = e.id
       WHERE r.id_utilisateur = ? AND r.prochaine_revision <= ?
       ORDER BY r.prochaine_revision ASC
       LIMIT 10`,
      [userId, todayStr],
    ) as any[];

    let exercices = revisions as any[];

    // 2. Si moins de 10, compléter avec des exercices jamais faits
    if (exercices.length < 10) {
      const deja = exercices.map((e: any) => e.id);
      const placeholders = deja.length > 0 ? `AND e.id NOT IN (${deja.map(() => '?').join(',')})` : '';
      const manquants = 10 - exercices.length;
      const [nouveaux] = await pool.execute(
        `SELECT e.id, e.titre, e.niveau, e.type_exercice, e.contenu, e.categorie_id,
                0 AS intervalle_jours, 0 AS nb_revisions
         FROM Exercices e
         WHERE e.id NOT IN (
           SELECT id_exercice FROM Revisions WHERE id_utilisateur = ?
         )
         ${placeholders}
         ORDER BY RAND()
         LIMIT ${manquants}`,
        [userId, ...deja],
      ) as any[];
      exercices = [...exercices, ...(nouveaux as any[])];
    }

    // 3. La quête est-elle déjà complétée aujourd'hui ?
    const [doneRows] = await pool.execute(
      `SELECT COUNT(DISTINCT id_exercice) as nb
       FROM Resultats
       WHERE id_utilisateur = ? AND DATE(date_session) = ?
         AND id_exercice IN (${exercices.map(() => '?').join(',') || 'NULL'})`,
      exercices.length > 0
        ? [userId, todayStr, ...exercices.map((e: any) => e.id)]
        : [userId, todayStr],
    ) as any[];

    const nbFaitsAujourdhui = (doneRows as any[])[0]?.nb ?? 0;
    const complete = nbFaitsAujourdhui >= exercices.length && exercices.length > 0;

    res.json({ exercices, complete, nbFaits: nbFaitsAujourdhui });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
