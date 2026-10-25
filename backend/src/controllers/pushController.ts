import pool from '../config/db.js';
import { Request, Response } from 'express';
import { envoyerRappelsDuJour } from '../services/notificationService.js';

/** @route GET /api/push/vapid-public-key — clé publique VAPID (publique par nature). */
export const getVapidPublicKey = (_req: Request, res: Response) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

/**
 * Enregistre (ou met à jour) l'abonnement push de l'utilisateur courant.
 * @route POST /api/push/subscribe
 * @access Private (JWT required)
 */
export const subscribe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const { endpoint, keys } = req.body ?? {};
    if (!endpoint || typeof endpoint !== 'string' || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: 'Abonnement push invalide.' });
    }

    // ON DUPLICATE KEY sur `endpoint` : si cet appareil était abonné pour un
    // autre compte (appareil partagé, reconnexion), l'abonnement bascule
    // sur l'utilisateur actuel plutôt que d'échouer.
    await pool.execute(
      `INSERT INTO AbonnementPush (id_utilisateur, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id_utilisateur = VALUES(id_utilisateur), p256dh = VALUES(p256dh), auth = VALUES(auth)`,
      [userId, endpoint, keys.p256dh, keys.auth],
    );

    res.status(201).json({ message: 'Abonnement enregistré' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Supprime l'abonnement push de l'utilisateur courant pour cet appareil.
 * @route POST /api/push/unsubscribe
 * @access Private (JWT required)
 */
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const { endpoint } = req.body ?? {};
    if (!endpoint || typeof endpoint !== 'string') {
      return res.status(400).json({ message: 'endpoint requis.' });
    }

    await pool.execute(
      'DELETE FROM AbonnementPush WHERE id_utilisateur = ? AND endpoint = ?',
      [userId, endpoint],
    );
    res.status(200).json({ message: 'Désabonné' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Déclenche l'envoi des rappels du jour. Appelée par un cron externe
 * (cron-job.org ou équivalent) toutes les 15 minutes — protégée par un
 * secret partagé (pas de JWT, l'appelant n'est pas un utilisateur).
 * @route POST /api/cron/rappels
 * @access Secret partagé (en-tête X-Cron-Secret ou ?secret=)
 */
export const declencherRappels = async (req: Request, res: Response) => {
  try {
    const secret = req.header('X-Cron-Secret') ?? req.query.secret;
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const resultat = await envoyerRappelsDuJour();
    res.status(200).json(resultat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
