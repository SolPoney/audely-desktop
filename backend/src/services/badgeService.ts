import type { PoolConnection } from 'mysql2/promise';
import { BADGES, estDebloque, type BadgeDef } from '../config/badges.js';

/**
 * Vérifie quels badges viennent d'être débloqués par ce résultat et les
 * enregistre dans `BadgeObtenu` (idempotent : un badge déjà obtenu n'est
 * jamais réévalué ni réinséré). Doit être appelée dans la même transaction
 * que l'écriture de `Resultats`/`Serie`/`GainXP`.
 *
 * `streak` est passé directement (déjà connu via `mettreAJourSerie`) plutôt
 * que recalculé, pour éviter une requête supplémentaire.
 *
 * @returns la liste des badges nouvellement débloqués à ce tour (pour la
 *          révélation sur l'écran de fin — voir ResultScreen.tsx)
 */
export const verifierNouveaux = async (
  connection: PoolConnection,
  idUtilisateur: number,
  streak: number,
): Promise<BadgeDef[]> => {
  const [globalRows] = await connection.execute(
    `SELECT COUNT(*) AS total_sessions, COALESCE(MAX(score), 0) AS max_score
     FROM Resultats WHERE id_utilisateur = ?`,
    [idUtilisateur],
  ) as any[];
  const { total_sessions: totalSessions, max_score: maxScore } = (globalRows as any[])[0];

  const [facileDoneRows] = await connection.execute(
    `SELECT COUNT(DISTINCT r.id_exercice) AS done
     FROM Resultats r JOIN Exercices e ON r.id_exercice = e.id
     WHERE r.id_utilisateur = ? AND e.niveau = 'facile'`,
    [idUtilisateur],
  ) as any[];
  const facileDone = (facileDoneRows as any[])[0].done;

  const [facileTotalRows] = await connection.execute(
    "SELECT COUNT(*) AS total FROM Exercices WHERE niveau = 'facile'",
  ) as any[];
  const facileTotal = (facileTotalRows as any[])[0].total;

  const [moyenRows] = await connection.execute(
    `SELECT COUNT(DISTINCT r.id_exercice) AS nb
     FROM Resultats r JOIN Exercices e ON r.id_exercice = e.id
     WHERE r.id_utilisateur = ? AND e.niveau = 'moyen'`,
    [idUtilisateur],
  ) as any[];
  const moyenNb = (moyenRows as any[])[0].nb;

  const statsPourBadges = { totalSessions, maxScore, facileDone, facileTotal, moyenNb, streak };

  const [existingRows] = await connection.execute(
    'SELECT id_badge FROM BadgeObtenu WHERE id_utilisateur = ?',
    [idUtilisateur],
  ) as any[];
  const dejaObtenus = new Set((existingRows as any[]).map((r: any) => r.id_badge));

  const nouveaux: BadgeDef[] = [];
  for (const badge of BADGES) {
    if (dejaObtenus.has(badge.id)) continue;
    if (!estDebloque(badge.id, statsPourBadges)) continue;
    await connection.execute(
      'INSERT INTO BadgeObtenu (id_utilisateur, id_badge) VALUES (?, ?)',
      [idUtilisateur, badge.id],
    );
    nouveaux.push(badge);
  }

  return nouveaux;
};
