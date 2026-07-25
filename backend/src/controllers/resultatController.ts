import pool from '../config/db.js';
import { Request, Response } from 'express';
import { updateRevision } from './queteController.js';

/**
 * Save an exercise result and update the spaced-repetition schedule (SM-2).
 *
 * Validates that `id_utilisateur`, `id_exercice` and `score` are present and
 * have the expected types before writing to the database.
 *
 * @route POST /api/resultats
 * @access Private (JWT required)
 */
export const saveResultat = async (req: Request, res: Response) => {
  try {
    const { id_utilisateur, id_exercice, score } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────
    const userId = Number(id_utilisateur);
    const exerciceId = Number(id_exercice);
    const scoreNum = Number(score);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: 'id_utilisateur invalide.' });
    }
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

    // Update spaced-repetition schedule (SM-2 algorithm)
    await updateRevision(userId, exerciceId, scoreNum);

    res.status(201).json({ message: 'Résultat enregistré' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
