/**
 * Script ponctuel : enregistre dans `BadgeObtenu` tous les badges déjà
 * mérités par les utilisateurs existants, pour que leur prochain exercice
 * ne les fasse pas réapparaître comme "nouvellement débloqués".
 *
 * Idempotent (INSERT IGNORE) : peut être relancé sans risque.
 *
 * Usage : npx tsx backend/scripts/backfillBadges.ts
 * (lit la config DB depuis backend/.env comme le reste de l'app)
 */
import 'dotenv/config';
import pool from '../src/config/db.js';
import { BADGES, estDebloque } from '../src/config/badges.js';

const main = async () => {
  const [facileTotalRows] = await pool.execute(
    "SELECT COUNT(*) AS total FROM Exercices WHERE niveau = 'facile'",
  ) as any[];
  const facileTotal = (facileTotalRows as any[])[0].total;

  const [users] = await pool.execute('SELECT id FROM Utilisateur') as any[];

  let totalInseres = 0;
  for (const { id } of users as { id: number }[]) {
    const [globalRows] = await pool.execute(
      `SELECT COUNT(*) AS total_sessions, COALESCE(MAX(score), 0) AS max_score
       FROM Resultats WHERE id_utilisateur = ?`,
      [id],
    ) as any[];
    const { total_sessions: totalSessions, max_score: maxScore } = (globalRows as any[])[0];

    const [facileDoneRows] = await pool.execute(
      `SELECT COUNT(DISTINCT r.id_exercice) AS done
       FROM Resultats r JOIN Exercices e ON r.id_exercice = e.id
       WHERE r.id_utilisateur = ? AND e.niveau = 'facile'`,
      [id],
    ) as any[];
    const facileDone = (facileDoneRows as any[])[0].done;

    const [moyenRows] = await pool.execute(
      `SELECT COUNT(DISTINCT r.id_exercice) AS nb
       FROM Resultats r JOIN Exercices e ON r.id_exercice = e.id
       WHERE r.id_utilisateur = ? AND e.niveau = 'moyen'`,
      [id],
    ) as any[];
    const moyenNb = (moyenRows as any[])[0].nb;

    const [serieRows] = await pool.execute(
      'SELECT serie_record FROM Serie WHERE id_utilisateur = ?',
      [id],
    ) as any[];
    // Le record (pas la série actuelle) détermine les paliers déjà atteints
    // au moins une fois — un badge de série obtenu puis la série retombée
    // reste acquis.
    const streak = (serieRows as any[])[0]?.serie_record ?? 0;

    const statsPourBadges = { totalSessions, maxScore, facileDone, facileTotal, moyenNb, streak };

    let inseresPourUser = 0;
    for (const badge of BADGES) {
      if (!estDebloque(badge.id, statsPourBadges)) continue;
      const [result] = await pool.execute(
        'INSERT IGNORE INTO BadgeObtenu (id_utilisateur, id_badge) VALUES (?, ?)',
        [id, badge.id],
      ) as any[];
      if ((result as any).affectedRows > 0) inseresPourUser++;
    }
    totalInseres += inseresPourUser;
    console.log(`user ${id}: ${inseresPourUser} badge(s) enregistré(s)`);
  }

  console.log(`\n${totalInseres} ligne(s) BadgeObtenu créée(s) au total.`);
  await pool.end();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
