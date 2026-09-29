import pool from '../config/db.js';
import { Request, Response } from 'express';

export const getExercices = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Exercices');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Categorie');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Version allégée de tous les exercices (id, niveau, categorie_id seulement,
 * sans le contenu JSON) — utilisée pour calculer le déblocage/progression
 * côté client sans télécharger tout le contenu de chaque exercice.
 */
export const getExercicesMinimal = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute('SELECT id, niveau, categorie_id FROM Exercices');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getExercicesParNiveau = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Exercices WHERE niveau = ?', [req.params.niveau]);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getExerciceById = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Exercices WHERE id = ?', [req.params.id]);
    const exercices = rows as any[];
    if (exercices.length === 0) return res.status(404).json({ message: 'Exercice non trouvé' });
    res.status(200).json(exercices[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getExercicesByCategorie = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Exercices WHERE categorie_id = ? ORDER BY FIELD(niveau, "facile", "moyen", "difficile"), id',
      [req.params.id]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

