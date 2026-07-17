import pool from '../config/db.js';
import { Request, Response } from 'express';

const today = () => new Date().toISOString().slice(0, 10);

/* ── Algorithme SM-2 simplifié ────────────────────────────────── */
const prochainIntervalle = (score: number, intervalleActuel: number): number => {
  if (score >= 80) return Math.min(Math.max(intervalleActuel * 2, 7), 30);
  if (score >= 50) return 3;
  return 1;
};

const addDays = (date: string, days: number): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/* ── Mise à jour / création d'une révision après un résultat ─── */
export const updateRevision = async (
  idUtilisateur: number,
  idExercice: number,
  score: number,
): Promise<void> => {
  const [rows] = await pool.execute(
    'SELECT intervalle_jours, nb_revisions FROM Revisions WHERE id_utilisateur = ? AND id_exercice = ?',
    [idUtilisateur, idExercice],
  ) as any[];

  const existing = (rows as any[])[0];
  const intervalleActuel = existing?.intervalle_jours ?? 1;
  const nouvelIntervalle = prochainIntervalle(score, intervalleActuel);
  const prochaine = addDays(today(), nouvelIntervalle);

  if (existing) {
    await pool.execute(
      `UPDATE Revisions SET prochaine_revision = ?, intervalle_jours = ?, nb_revisions = nb_revisions + 1
       WHERE id_utilisateur = ? AND id_exercice = ?`,
      [prochaine, nouvelIntervalle, idUtilisateur, idExercice],
    );
  } else {
    await pool.execute(
      `INSERT INTO Revisions (id_utilisateur, id_exercice, prochaine_revision, intervalle_jours, nb_revisions)
       VALUES (?, ?, ?, ?, 1)`,
      [idUtilisateur, idExercice, prochaine, nouvelIntervalle],
    );
  }
};

/* ── GET /api/quete-du-jour ──────────────────────────────────── */
export const getQueteDuJour = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Non autorisé' });

    const todayStr = today();

    // 1. Exercices à réviser aujourd'hui
    const [revisions] = await pool.execute(
      `SELECT e.id, e.titre, e.niveau, e.type_exercice, e.contenu, e.categorie_id,
              r.intervalle_jours, r.nb_revisions
       FROM Revisions r
       JOIN Exercices e ON r.id_exercice = e.id
       WHERE r.id_utilisateur = ? AND r.prochaine_revision <= ?
       ORDER BY r.prochaine_revision ASC
       LIMIT 3`,
      [userId, todayStr],
    ) as any[];

    let exercices = revisions as any[];

    // 2. Si moins de 3, compléter avec des exercices jamais faits
    if (exercices.length < 3) {
      const deja = exercices.map((e: any) => e.id);
      const placeholders = deja.length > 0 ? `AND e.id NOT IN (${deja.map(() => '?').join(',')})` : '';
      const manquants = 3 - exercices.length;
      const [nouveaux] = await pool.execute(
        `SELECT e.id, e.titre, e.niveau, e.type_exercice, e.contenu, e.categorie_id,
                0 AS intervalle_jours, 0 AS nb_revisions
         FROM Exercices e
         WHERE e.id NOT IN (
           SELECT id_exercice FROM Revisions WHERE id_utilisateur = ?
         )
         ${placeholders}
         ORDER BY RAND()
         LIMIT ${manquants}`,
        [userId, ...deja],
      ) as any[];
      exercices = [...exercices, ...(nouveaux as any[])];
    }

    // 3. La quête est-elle déjà complétée aujourd'hui ?
    const [doneRows] = await pool.execute(
      `SELECT COUNT(DISTINCT id_exercice) as nb
       FROM Resultats
       WHERE id_utilisateur = ? AND DATE(date_session) = ?
         AND id_exercice IN (${exercices.map(() => '?').join(',') || 'NULL'})`,
      exercices.length > 0
        ? [userId, todayStr, ...exercices.map((e: any) => e.id)]
        : [userId, todayStr],
    ) as any[];

    const nbFaitsAujourdhui = (doneRows as any[])[0]?.nb ?? 0;
    const complete = nbFaitsAujourdhui >= exercices.length && exercices.length > 0;

    res.json({ exercices, complete, nbFaits: nbFaitsAujourdhui });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
