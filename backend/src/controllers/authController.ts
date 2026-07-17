import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { Request, Response } from 'express';

export const register = async (req: Request, res: Response) => {
  try {
    const { nom, prenom, email, mot_de_passe } = req.body;
    const hash = await argon2.hash(mot_de_passe);

    await pool.execute(
      'INSERT INTO Utilisateur (nom, prenom, mail, mot_de_passe) VALUES (?, ?, ?, ?)',
      [nom, prenom, email, hash]
    );

    res.status(201).json({ message: 'Vous êtes enregistré' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, mot_de_passe } = req.body;

    const [rows] = await pool.execute(
      'SELECT * FROM Utilisateur WHERE mail = ?',
      [email]
    );

    const users = rows as any[];
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];
    const valid = await argon2.verify(user.mot_de_passe, mot_de_passe);

    if (!valid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.mail },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
