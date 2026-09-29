import pool from '../config/db.js';
import { Request, Response } from 'express';
import { updateRevision } from './queteController.js';

/**
 * Save an exercise result and update the spaced-repetition schedule (FSRS).
 *
 * The user id is taken from the verified JWT (`req.user.id`), never from the
 * request body — a client cannot write results for another account.
 * Validates that `id_exercice` and `score` are present and have the expected
 * types before writing to the database.
 *
 * @route POST /api/resultats
 * @access Private (JWT required)
 */
export const saveResultat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const { id_exercice, score } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────
    const exerciceId = Number(id_exercice);
    const scoreNum = Number(score);

    if (!Number.isInteger(exerciceId) || exerciceId <= 0) {
      return res.status(400).json({ message: 'id_exercice invalide.' });
    }
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      return res.status(400).json({ message: 'Le score doit être compris entre 0 et 100.' });
    }

    await pool.execute(
      'INSERT INTO Resultats (id_utilisateur, id_exercice, score) VALUES (?, ?, ?)',
      [userId, exerciceId, scoreNum]
    );

    // Update spaced-repetition schedule (FSRS algorithm)
    await updateRevision(userId, exerciceId, scoreNum);

    res.status(201).json({ message: 'Résultat enregistré' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
