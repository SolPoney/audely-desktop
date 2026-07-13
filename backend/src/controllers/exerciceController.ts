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
