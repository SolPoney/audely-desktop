/**
 * Script ponctuel : remplit le journal `GainXP` à partir de l'historique
 * `Resultats`, avec exactement la même formule que l'ancien calcul "à la
 * volée" (score × multiplicateur de niveau), pour que le total XP affiché
 * ne change pas au moment du déploiement — seul le stockage change.
 *
 * N'ajoute pas le bonus "score ≥ 80" rétroactivement : ce bonus est une
 * nouveauté, il ne s'applique qu'aux résultats enregistrés à partir de
 * maintenant (comme pour toute amélioration non rétroactive).
 *
 * Idempotent par construction : vide la table avant de la repeupler, donc
 * peut être relancé sans créer de doublons.
 *
 * Usage : npx tsx backend/scripts/backfillGainXP.ts
 * (lit la config DB depuis backend/.env comme le reste de l'app)
 */
import 'dotenv/config';
import pool from '../src/config/db.js';

const MULTIPLICATEUR: Record<string, number> = {
  facile: 0.15,
  moyen: 0.25,
  difficile: 0.35,
};

const main = async () => {
  const [countRows] = await pool.execute('SELECT COUNT(*) as n FROM GainXP') as any[];
  const dejaRempli = (countRows as any[])[0].n;
  if (dejaRempli > 0) {
    console.log(`GainXP contient déjà ${dejaRempli} ligne(s) — vidage avant repeuplement (idempotence).`);
    await pool.execute('DELETE FROM GainXP');
  }

  const [resultats] = await pool.execute(`
    SELECT r.id AS id_resultat, r.id_utilisateur, r.score, e.niveau, r.date_session
    FROM Resultats r
    JOIN Exercices e ON r.id_exercice = e.id
    ORDER BY r.id ASC
  `) as any[];

  let inseres = 0;
  for (const r of resultats as any[]) {
    const multiplicateur = MULTIPLICATEUR[r.niveau] ?? MULTIPLICATEUR.facile;
    const montant = Math.round(r.score * multiplicateur);
    await pool.execute(
      `INSERT INTO GainXP (id_utilisateur, source, montant, id_resultat, created_at)
       VALUES (?, 'exercice', ?, ?, ?)`,
      [r.id_utilisateur, montant, r.id_resultat, r.date_session],
    );
    inseres++;
  }

  console.log(`${inseres} ligne(s) GainXP créée(s) à partir de ${resultats.length} résultat(s) historique(s).`);
  await pool.end();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
