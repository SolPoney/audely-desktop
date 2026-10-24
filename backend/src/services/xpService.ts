import type { PoolConnection } from 'mysql2/promise';

const MULTIPLICATEUR_NIVEAU: Record<string, number> = {
  facile: 0.15,
  moyen: 0.25,
  difficile: 0.35,
};

// Score ≥ ce seuil : bonus "bonne performance", en plus de l'XP de base.
// Purement additif — ne peut jamais faire baisser le total XP de quelqu'un.
const SEUIL_BONUS_SCORE = 80;
const BONUS_SCORE = 5;

export interface ResultatXP {
  montantBase: number;
  bonus: number;
  total: number;
}

/**
 * Enregistre le(s) gain(s) d'XP suite à un résultat d'exercice, dans la
 * même transaction que l'écriture de `Resultats`.
 *
 * Formule identique à l'ancien calcul "à la volée" (score × multiplicateur
 * de niveau), pour que le total affiché ne change pas pour les
 * utilisateurs existants — seul le stockage change.
 */
export const enregistrerGainXP = async (
  connection: PoolConnection,
  idUtilisateur: number,
  idResultat: number,
  score: number,
  niveau: string,
): Promise<ResultatXP> => {
  const multiplicateur = MULTIPLICATEUR_NIVEAU[niveau] ?? MULTIPLICATEUR_NIVEAU.facile;
  const montantBase = Math.round(score * multiplicateur);

  await connection.execute(
    `INSERT INTO GainXP (id_utilisateur, source, montant, id_resultat) VALUES (?, 'exercice', ?, ?)`,
    [idUtilisateur, montantBase, idResultat],
  );

  let bonus = 0;
  if (score >= SEUIL_BONUS_SCORE) {
    bonus = BONUS_SCORE;
    await connection.execute(
      `INSERT INTO GainXP (id_utilisateur, source, montant, id_resultat) VALUES (?, 'bonus_score', ?, ?)`,
      [idUtilisateur, bonus, idResultat],
    );
  }

  return { montantBase, bonus, total: montantBase + bonus };
};
