import pool from '../config/db.js';
import { Request, Response } from 'express';

/** Objectifs quotidiens proposés à l'onboarding (en XP). */
const OBJECTIFS_VALIDES = [20, 30, 50, 80];

/**
 * Enregistre le choix d'objectif quotidien fait à l'onboarding et marque
 * celui-ci comme terminé — l'écran ne sera plus présenté à cet utilisateur.
 *
 * @route PUT /api/utilisateur/onboarding
 * @access Private (JWT required)
 */
export const completerOnboarding = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const objectif = Number(req.body?.objectif_quotidien_xp);
    if (!OBJECTIFS_VALIDES.includes(objectif)) {
      return res.status(400).json({ message: 'Objectif quotidien invalide.' });
    }

    await pool.execute(
      'UPDATE Utilisateur SET objectif_quotidien_xp = ?, onboarding_fait = 1 WHERE id = ?',
      [objectif, userId],
    );

    res.status(200).json({ message: 'Préférences enregistrées', objectif_quotidien_xp: objectif });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
