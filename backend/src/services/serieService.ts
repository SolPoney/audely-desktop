import type { PoolConnection } from 'mysql2/promise';

export interface ResultatSerie {
  streakAvant: number;
  streakActuelle: number;
  streakRecord: number;
  gelUtilise: boolean;
  gelsDisponibles: number;
  nouveauRecord: boolean;
}

interface SerieRow {
  serie_actuelle: number;
  serie_record: number;
  dernier_jour_actif: string; // 'YYYY-MM-DD'
  gels_disponibles: number;
  derniere_recharge_gel: string; // 'YYYY-MM-DD'
}

/** Jour local (minuit) au format 'YYYY-MM-DD', même logique que l'ancien calcul de série dans statsController. */
const jourLocal = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const j = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${j}`;
};

/** Nombre de jours calendaires entre deux dates 'YYYY-MM-DD' (b - a). */
const ecartJours = (a: string, b: string): number => {
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db.getTime() - da.getTime()) / 86400000);
};

const RECHARGE_GEL_APRES_JOURS = 7;
const GELS_MAX = 1;

/**
 * Met à jour la série (streak) de l'utilisateur suite à un exercice complété
 * aujourd'hui, avec prise en charge des gels (un jour manqué peut être
 * "couvert" par un gel disponible sans casser la série).
 *
 * Doit être appelée à l'intérieur de la même transaction que l'écriture du
 * `Resultats` correspondant (verrouille la ligne `Serie` avec `FOR UPDATE`
 * pour éviter une double incrémentation en cas de requêtes concurrentes).
 */
export const mettreAJourSerie = async (
  connection: PoolConnection,
  idUtilisateur: number,
): Promise<ResultatSerie> => {
  const aujourdhui = jourLocal();

  const [rows] = await connection.execute(
    `SELECT serie_actuelle, serie_record, dernier_jour_actif, gels_disponibles, derniere_recharge_gel
     FROM Serie WHERE id_utilisateur = ? FOR UPDATE`,
    [idUtilisateur],
  ) as any[];

  const existing: SerieRow | undefined = (rows as SerieRow[])[0];

  if (!existing) {
    await connection.execute(
      `INSERT INTO Serie (id_utilisateur, serie_actuelle, serie_record, dernier_jour_actif, gels_disponibles, derniere_recharge_gel)
       VALUES (?, 1, 1, ?, 1, ?)`,
      [idUtilisateur, aujourdhui, aujourdhui],
    );
    return {
      streakAvant: 0,
      streakActuelle: 1,
      streakRecord: 1,
      gelUtilise: false,
      gelsDisponibles: 1,
      nouveauRecord: true,
    };
  }

  const streakAvant = existing.serie_actuelle;
  const diff = ecartJours(existing.dernier_jour_actif, aujourdhui);

  let serieActuelle = existing.serie_actuelle;
  let dernierJourActif = existing.dernier_jour_actif;
  let gelsDisponibles = existing.gels_disponibles;
  let derniereRechargeGel = existing.derniere_recharge_gel;
  let gelUtilise = false;

  if (diff === 0) {
    // Déjà actif aujourd'hui : aucun changement de série.
  } else if (diff === 1) {
    serieActuelle += 1;
    dernierJourActif = aujourdhui;
  } else if (diff === 2 && gelsDisponibles > 0) {
    // Un jour manqué, couvert par un gel : la série continue sans se casser.
    gelsDisponibles -= 1;
    gelUtilise = true;
    serieActuelle += 1;
    dernierJourActif = aujourdhui;
  } else {
    serieActuelle = 1;
    dernierJourActif = aujourdhui;
  }

  // Recharge automatique d'un gel par semaine d'activité (plafond 1).
  if (gelsDisponibles < GELS_MAX && ecartJours(derniereRechargeGel, aujourdhui) >= RECHARGE_GEL_APRES_JOURS) {
    gelsDisponibles = GELS_MAX;
    derniereRechargeGel = aujourdhui;
  }

  const serieRecord = Math.max(existing.serie_record, serieActuelle);

  await connection.execute(
    `UPDATE Serie SET serie_actuelle = ?, serie_record = ?, dernier_jour_actif = ?, gels_disponibles = ?, derniere_recharge_gel = ?
     WHERE id_utilisateur = ?`,
    [serieActuelle, serieRecord, dernierJourActif, gelsDisponibles, derniereRechargeGel, idUtilisateur],
  );

  return {
    streakAvant,
    streakActuelle: serieActuelle,
    streakRecord: serieRecord,
    gelUtilise,
    gelsDisponibles,
    nouveauRecord: serieRecord > existing.serie_record,
  };
};
