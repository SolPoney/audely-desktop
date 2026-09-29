import pool from '../config/db.js';
import { Request, Response } from 'express';

export const getExercicesCompletes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Non autorisé' });
    const [rows] = await pool.execute(
      'SELECT DISTINCT id_exercice FROM Resultats WHERE id_utilisateur = ?',
      [userId]
    ) as any[];
    res.json((rows as any[]).map((r: any) => r.id_exercice));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/* ── Calcul du niveau à partir de l'XP ── */
const THRESHOLDS = [0, 100, 300, 600, 1000, 1500];
const NOMS = ['Débutant', 'Apprenti', 'Intermédiaire', 'Confirmé', 'Expert', 'Maître'];

const getNiveau = (xp: number) => {
  let lvl = 0;
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (xp >= THRESHOLDS[i]) lvl = i;
  }
  const prevXP = THRESHOLDS[lvl];
  const nextXP = THRESHOLDS[lvl + 1] ?? null;
  const xpPct = nextXP === null ? 100 : Math.round((xp - prevXP) / (nextXP - prevXP) * 100);
  return { nom: NOMS[lvl], niveau: lvl + 1, prevXP, nextXP, xpPct };
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Non autorisé' });

    // Toutes ces requêtes ne dépendent que de userId (aucune des autres) :
    // elles partent en parallèle plutôt qu'en 9 allers-retours séquentiels
    // vers la base distante (pool limité à 4 connexions simultanées, donc
    // toujours plus rapide qu'un enchaînement séquentiel).
    const [
      [parType],
      [historique],
      [global],
      [jours],
      [xpRes],
      [facileDoneRes],
      [facileTotalRes],
      [moyenRes],
      [progressionRaw],
    ] = await Promise.all([
      // 1. Score moyen par type d'exercice
      pool.execute(`
        SELECT
          e.type_exercice,
          COUNT(r.id)          AS nb_sessions,
          ROUND(AVG(r.score))  AS score_moyen,
          MAX(r.score)         AS meilleur_score
        FROM Resultats r
        JOIN Exercices e ON r.id_exercice = e.id
        WHERE r.id_utilisateur = ?
        GROUP BY e.type_exercice
        ORDER BY score_moyen DESC
      `, [userId]),

      // 2. 10 dernières sessions
      pool.execute(`
        SELECT
          r.id,
          r.score,
          r.date_session,
          e.titre,
          e.type_exercice,
          e.niveau
        FROM Resultats r
        JOIN Exercices e ON r.id_exercice = e.id
        WHERE r.id_utilisateur = ?
        ORDER BY r.date_session DESC
        LIMIT 10
      `, [userId]),

      // 3. Global
      pool.execute(`
        SELECT
          COUNT(*)                     AS total_sessions,
          ROUND(AVG(score))            AS score_global,
          COALESCE(MAX(score), 0)      AS meilleur_score
        FROM Resultats
        WHERE id_utilisateur = ?
      `, [userId]),

      // 4. Streak (dates distinctes des sessions)
      pool.execute(`
        SELECT DISTINCT DATE(date_session) AS jour
        FROM Resultats
        WHERE id_utilisateur = ?
        ORDER BY jour DESC
      `, [userId]),

      // 5. XP
      pool.execute(`
        SELECT COALESCE(SUM(
          r.score * CASE e.niveau WHEN 'facile' THEN 0.15 WHEN 'moyen' THEN 0.25 ELSE 0.35 END
        ), 0) AS total_xp
        FROM Resultats r JOIN Exercices e ON r.id_exercice = e.id
        WHERE r.id_utilisateur = ?
      `, [userId]),

      // 6. Données pour les badges (le max/total_sessions réutilise "global" ci-dessus)
      pool.execute(`
        SELECT COUNT(DISTINCT r.id_exercice) as done
        FROM Resultats r JOIN Exercices e ON r.id_exercice = e.id
        WHERE r.id_utilisateur = ? AND e.niveau = 'facile'
      `, [userId]),
      pool.execute("SELECT COUNT(*) as total FROM Exercices WHERE niveau='facile'", []),
      pool.execute(`
        SELECT COUNT(DISTINCT r.id_exercice) as nb
        FROM Resultats r JOIN Exercices e ON r.id_exercice = e.id
        WHERE r.id_utilisateur = ? AND e.niveau = 'moyen'
      `, [userId]),

      // 7. Historique des 20 dernières sessions pour le graphique
      pool.execute(`
        SELECT r.score, DATE_FORMAT(r.date_session, '%d/%m') AS date_label
        FROM Resultats r
        WHERE r.id_utilisateur = ?
        ORDER BY r.date_session DESC
        LIMIT 20
      `, [userId]),
    ]) as any[];

    // Le jour le plus récent avec un exercice doit être aujourd'hui OU hier
    // (délai de grâce : ne pas casser une série de 30 jours juste parce que
    // l'utilisateur n'a pas encore fait son exercice du jour au moment de l'appel).
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const joursList = jours as any[];
    if (joursList.length > 0) {
      const plusRecent = new Date(joursList[0].jour);
      plusRecent.setHours(0, 0, 0, 0);
      const ecartJours = Math.round((today.getTime() - plusRecent.getTime()) / 86400000);
      if (ecartJours <= 1) {
        const expected = new Date(plusRecent);
        for (let i = 0; i < joursList.length; i++) {
          const jour = new Date(joursList[i].jour);
          jour.setHours(0, 0, 0, 0);
          if (jour.getTime() === expected.getTime()) {
            streak++;
            expected.setDate(expected.getDate() - 1);
          } else break;
        }
      }
    }

    const totalXP = Math.round((xpRes as any[])[0].total_xp);
    const niveauInfo = getNiveau(totalXP);

    const maxScore = (global as any[])[0].meilleur_score;
    const totalSessions = (global as any[])[0].total_sessions;
    const facileDone = (facileDoneRes as any[])[0].done;
    const facileTotal = (facileTotalRes as any[])[0].total;
    const moyenNb = (moyenRes as any[])[0].nb;

    // Est-ce que l'utilisateur a fait un exercice aujourd'hui ?
    const todayStr = new Date().toISOString().slice(0, 10);
    const questDuJour = (jours as any[]).length > 0 &&
      new Date((jours as any[])[0].jour).toISOString().slice(0, 10) === todayStr;

    const badges = [
      {
        id: 'premier_pas',
        emoji: '🚀',
        titre: 'Premier pas',
        description: 'Complétez votre premier exercice',
        unlocked: totalSessions >= 1,
      },
      {
        id: 'score_parfait',
        emoji: '🏆',
        titre: 'Oreille d\'or',
        description: 'Obtenez 100% sur un exercice',
        unlocked: maxScore >= 100,
      },
      {
        id: 'dix_sessions',
        emoji: '💪',
        titre: 'Persévérant',
        description: '10 sessions au total',
        unlocked: totalSessions >= 10,
      },
      {
        id: 'facile_maitrise',
        emoji: '⭐',
        titre: 'Bases solides',
        description: 'Terminez tous les exercices Facile',
        unlocked: facileTotal > 0 && facileDone >= facileTotal,
      },
      {
        id: 'niveau_moyen',
        emoji: '🎯',
        titre: 'En progression',
        description: 'Commencez les exercices Moyen',
        unlocked: moyenNb >= 1,
      },
      // Paliers de série
      { id: 'serie_3',   emoji: '🔥', titre: 'Star',          description: '3 jours consécutifs',   unlocked: streak >= 3   },
      { id: 'serie_5',   emoji: '🔥', titre: 'Superstar',     description: '5 jours consécutifs',   unlocked: streak >= 5   },
      { id: 'serie_7',   emoji: '⚡', titre: 'Champion',      description: '7 jours consécutifs',   unlocked: streak >= 7   },
      { id: 'serie_14',  emoji: '⚡', titre: 'Enflammé',      description: '14 jours consécutifs',  unlocked: streak >= 14  },
      { id: 'serie_31',  emoji: '🏅', titre: 'Icône',         description: '31 jours consécutifs',  unlocked: streak >= 31  },
      { id: 'serie_50',  emoji: '🥇', titre: 'Éminence',      description: '50 jours consécutifs',  unlocked: streak >= 50  },
      { id: 'serie_100', emoji: '🛡️', titre: 'Invincible',    description: '100 jours consécutifs', unlocked: streak >= 100 },
      { id: 'serie_365', emoji: '🌟', titre: 'Interstellaire', description: '365 jours consécutifs', unlocked: streak >= 365 },
    ];

    res.json({
      global: (global as any[])[0],
      parType,
      historique,
      streak,
      questDuJour,
      xp: totalXP,
      niveau: niveauInfo,
      badges,
      progression: (progressionRaw as any[]).reverse(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
