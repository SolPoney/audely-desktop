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

    // 1. Score moyen par type d'exercice
    const [parType] = await pool.execute(`
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
    `, [userId]);

    // 2. 10 dernières sessions
    const [historique] = await pool.execute(`
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
    `, [userId]);

    // 3. Global
    const [global] = await pool.execute(`
      SELECT
        COUNT(*)            AS total_sessions,
        ROUND(AVG(score))   AS score_global,
        MAX(score)          AS meilleur_score
      FROM Resultats
      WHERE id_utilisateur = ?
    `, [userId]) as any[];

    // 4. Streak
    const [jours] = await pool.execute(`
      SELECT DISTINCT DATE(date_session) AS jour
      FROM Resultats
      WHERE id_utilisateur = ?
      ORDER BY jour DESC
    `, [userId]) as any[];

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < (jours as any[]).length; i++) {
      const jour = new Date((jours as any[])[i].jour);
      jour.setHours(0, 0, 0, 0);
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (jour.getTime() === expected.getTime()) streak++;
      else break;
    }

    // 5. XP
    const [xpRes] = await pool.execute(`
      SELECT COALESCE(SUM(
        r.score * CASE e.niveau WHEN 'facile' THEN 0.15 WHEN 'moyen' THEN 0.25 ELSE 0.35 END
      ), 0) AS total_xp
      FROM Resultats r JOIN Exercices e ON r.id_exercice = e.id
      WHERE r.id_utilisateur = ?
    `, [userId]) as any[];
    const totalXP = Math.round((xpRes as any[])[0].total_xp);
    const niveauInfo = getNiveau(totalXP);

    // 6. Données pour les badges
    const [maxScoreRes] = await pool.execute(
      'SELECT COALESCE(MAX(score), 0) as max_score, COUNT(*) as total_sessions FROM Resultats WHERE id_utilisateur = ?', [userId]
    ) as any[];
    const [facileDoneRes] = await pool.execute(`
      SELECT COUNT(DISTINCT r.id_exercice) as done
      FROM Resultats r JOIN Exercices e ON r.id_exercice = e.id
      WHERE r.id_utilisateur = ? AND e.niveau = 'facile'
    `, [userId]) as any[];
    const [facileTotalRes] = await pool.execute(
      "SELECT COUNT(*) as total FROM Exercices WHERE niveau='facile'", []
    ) as any[];
    const [moyenRes] = await pool.execute(`
      SELECT COUNT(DISTINCT r.id_exercice) as nb
      FROM Resultats r JOIN Exercices e ON r.id_exercice = e.id
      WHERE r.id_utilisateur = ? AND e.niveau = 'moyen'
    `, [userId]) as any[];

    const maxScore = (maxScoreRes as any[])[0].max_score;
    const totalSessions = (maxScoreRes as any[])[0].total_sessions;
    const facileDone = (facileDoneRes as any[])[0].done;
    const facileTotal = (facileTotalRes as any[])[0].total;
    const moyenNb = (moyenRes as any[])[0].nb;

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
        id: 'serie_3',
        emoji: '🔥',
        titre: 'Régulier',
        description: '3 jours consécutifs de pratique',
        unlocked: streak >= 3,
      },
      {
        id: 'serie_7',
        emoji: '⚡',
        titre: 'Acharné',
        description: '7 jours consécutifs de pratique',
        unlocked: streak >= 7,
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
    ];

    // 7. Historique des 20 dernières sessions pour le graphique
    const [progression] = await pool.execute(`
      SELECT r.score, DATE_FORMAT(r.date_session, '%d/%m') AS date_label
      FROM Resultats r
      WHERE r.id_utilisateur = ?
      ORDER BY r.date_session DESC
      LIMIT 20
    `, [userId]);

    res.json({
      global: (global as any[])[0],
      parType,
      historique,
      streak,
      xp: totalXP,
      niveau: niveauInfo,
      badges,
      progression: (progression as any[]).reverse(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
