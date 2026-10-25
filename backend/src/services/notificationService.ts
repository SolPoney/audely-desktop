import webpush from 'web-push';
import pool from '../config/db.js';
import { MESSAGES_ENCOURAGEANTS, MESSAGES_RELANCE_DOUCE, type MessageRappel } from '../config/notificationMessages.js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// Pas de préférence d'heure par utilisateur en V1 (pas collectée à
// l'onboarding) : un créneau fixe en fin de journée. Le cron externe
// tourne toutes les 15 min mais ce créneau limite l'envoi à une seule
// heure civile par jour.
const HEURE_CIBLE = 18;
const SEUIL_RELANCE_JOURS = 3;

const choisirMessage = (joursDepuisActivite: number, streak: number): MessageRappel => {
  if (joursDepuisActivite >= SEUIL_RELANCE_JOURS) {
    return MESSAGES_RELANCE_DOUCE[Math.floor(Math.random() * MESSAGES_RELANCE_DOUCE.length)];
  }
  if (streak > 0 && Math.random() < 0.5) {
    return {
      id: 'enc_streak',
      titre: 'Audely',
      corps: `Votre série de ${streak} jour${streak > 1 ? 's' : ''} vous attend !`,
    };
  }
  return MESSAGES_ENCOURAGEANTS[Math.floor(Math.random() * MESSAGES_ENCOURAGEANTS.length)];
};

export interface ResultatEnvoi {
  envoyes: number;
  erreurs: number;
  horsCreneau: boolean;
}

/**
 * Envoie un rappel aux utilisateurs abonnés qui n'ont pas encore pratiqué
 * aujourd'hui et n'ont pas déjà reçu de rappel aujourd'hui. Appelée par un
 * cron externe (voir /api/cron/rappels) toutes les 15 minutes — ne fait
 * réellement quelque chose que dans le créneau horaire ciblé.
 */
export const envoyerRappelsDuJour = async (maintenant: Date = new Date()): Promise<ResultatEnvoi> => {
  if (maintenant.getHours() !== HEURE_CIBLE) {
    return { envoyes: 0, erreurs: 0, horsCreneau: true };
  }

  const [rows] = await pool.execute(`
    SELECT a.id_utilisateur, a.endpoint, a.p256dh, a.auth,
      COALESCE(s.serie_actuelle, 0) AS streak,
      COALESCE(DATEDIFF(CURDATE(), s.dernier_jour_actif), 999) AS jours_depuis_activite
    FROM AbonnementPush a
    LEFT JOIN Serie s ON s.id_utilisateur = a.id_utilisateur
    WHERE NOT EXISTS (
      SELECT 1 FROM Resultats r
      WHERE r.id_utilisateur = a.id_utilisateur AND DATE(r.date_session) = CURDATE()
    )
    AND NOT EXISTS (
      SELECT 1 FROM NotificationEnvoyee n
      WHERE n.id_utilisateur = a.id_utilisateur AND DATE(n.envoyee_le) = CURDATE()
    )
  `) as any[];

  let envoyes = 0;
  let erreurs = 0;

  for (const row of rows as any[]) {
    const message = choisirMessage(row.jours_depuis_activite, row.streak);
    try {
      await webpush.sendNotification(
        { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
        JSON.stringify({ titre: message.titre, corps: message.corps }),
      );
      await pool.execute(
        'INSERT INTO NotificationEnvoyee (id_utilisateur, variante) VALUES (?, ?)',
        [row.id_utilisateur, message.id],
      );
      envoyes++;
    } catch (err: any) {
      erreurs++;
      // Abonnement expiré/révoqué côté navigateur : on arrête d'essayer.
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        await pool.execute('DELETE FROM AbonnementPush WHERE endpoint = ?', [row.endpoint]);
      } else {
        console.error('Erreur envoi notification push:', err?.message ?? err);
      }
    }
  }

  return { envoyes, erreurs, horsCreneau: false };
};
