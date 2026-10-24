/**
 * Script ponctuel : initialise la table `Serie` pour chaque utilisateur
 * existant, à partir de son historique `Resultats`, en reproduisant
 * exactement l'ancien calcul "à la volée" (série actuelle avec délai de
 * grâce) + un calcul de record (plus longue série consécutive jamais
 * atteinte, toute l'historique confondue).
 *
 * Idempotent (ON DUPLICATE KEY UPDATE) : peut être relancé sans risque.
 *
 * Usage : npx tsx backend/scripts/backfillSerie.ts
 * (lit la config DB depuis backend/.env comme le reste de l'app)
 */
import 'dotenv/config';
import pool from '../src/config/db.js';

const jourLocal = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const j = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${j}`;
};

interface Resultat {
  streakActuelle: number;
  record: number;
  dernierJour: string | null;
}

/** Reproduit l'ancien calcul de streak de statsController.getStats, + un record historique. */
const calculerSerie = (joursTriesDesc: string[]): Resultat => {
  if (joursTriesDesc.length === 0) {
    return { streakActuelle: 0, record: 0, dernierJour: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const plusRecent = new Date(`${joursTriesDesc[0]}T00:00:00`);
  const ecart = Math.round((today.getTime() - plusRecent.getTime()) / 86400000);

  let streakActuelle = 0;
  if (ecart <= 1) {
    const expected = new Date(plusRecent);
    for (const jourStr of joursTriesDesc) {
      const jour = new Date(`${jourStr}T00:00:00`);
      if (jour.getTime() === expected.getTime()) {
        streakActuelle++;
        expected.setDate(expected.getDate() - 1);
      } else break;
    }
  }

  // Record historique : plus longue suite de jours consécutifs dans tout l'historique.
  let record = 1;
  let courant = 1;
  for (let i = 1; i < joursTriesDesc.length; i++) {
    const prev = new Date(`${joursTriesDesc[i - 1]}T00:00:00`);
    const cur = new Date(`${joursTriesDesc[i]}T00:00:00`);
    const diff = Math.round((prev.getTime() - cur.getTime()) / 86400000);
    if (diff === 1) {
      courant++;
    } else {
      record = Math.max(record, courant);
      courant = 1;
    }
  }
  record = Math.max(record, courant, streakActuelle);

  return { streakActuelle, record, dernierJour: joursTriesDesc[0] };
};

const main = async () => {
  const [users] = await pool.execute('SELECT id FROM Utilisateur') as any[];
  const aujourdhui = jourLocal(new Date());

  let traites = 0;
  for (const { id } of users as { id: number }[]) {
    const [rows] = await pool.execute(
      'SELECT DISTINCT DATE(date_session) AS jour FROM Resultats WHERE id_utilisateur = ? ORDER BY jour DESC',
      [id],
    ) as any[];
    const jours = (rows as { jour: string }[]).map((r) => {
      const d = new Date(r.jour);
      return jourLocal(d);
    });

    const { streakActuelle, record, dernierJour } = calculerSerie(jours);

    await pool.execute(
      `INSERT INTO Serie (id_utilisateur, serie_actuelle, serie_record, dernier_jour_actif, gels_disponibles, derniere_recharge_gel)
       VALUES (?, ?, ?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE
         serie_actuelle = VALUES(serie_actuelle),
         serie_record = VALUES(serie_record),
         dernier_jour_actif = VALUES(dernier_jour_actif)`,
      [id, streakActuelle, Math.max(record, 0), dernierJour ?? aujourdhui, aujourdhui],
    );
    traites++;
    console.log(`user ${id}: streak=${streakActuelle} record=${record} dernierJour=${dernierJour ?? '(aucun)'}`);
  }

  console.log(`\n${traites} utilisateur(s) traité(s).`);
  await pool.end();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
