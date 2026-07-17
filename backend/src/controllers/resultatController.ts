import pool from '../config/db.js';
import { Request, Response } from 'express';
import { updateRevision } from './queteController.js';

export const saveResultat = async (req: Request, res: Response) => {
  try {
    const { id_utilisateur, id_exercice, score } = req.body;
    await pool.execute(
      'INSERT INTO Resultats (id_utilisateur, id_exercice, score) VALUES (?, ?, ?)',
      [id_utilisateur, id_exercice, score]
    );

    // Mise à jour de la répétition espacée
    await updateRevision(Number(id_utilisateur), Number(id_exercice), Number(score));

    res.status(201).json({ message: 'Résultat enregistré' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
