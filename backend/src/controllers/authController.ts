import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { Request, Response } from 'express';

/** Regex: basic email format validation */
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register a new user.
 *
 * Validates that `nom`, `prenom`, `email` and `mot_de_passe` are present and
 * well-formed before hashing the password with Argon2 and persisting the user.
 *
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { nom, prenom, email, mot_de_passe } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!nom || typeof nom !== 'string' || nom.trim().length < 1) {
      return res.status(400).json({ message: 'Le nom est requis.' });
    }
    if (!prenom || typeof prenom !== 'string' || prenom.trim().length < 1) {
      return res.status(400).json({ message: 'Le prénom est requis.' });
    }
    if (!email || !RE_EMAIL.test(email)) {
      return res.status(400).json({ message: 'Adresse e-mail invalide.' });
    }
    if (!mot_de_passe || typeof mot_de_passe !== 'string' || mot_de_passe.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    const hash = await argon2.hash(mot_de_passe);

    await pool.execute(
      'INSERT INTO Utilisateur (nom, prenom, mail, mot_de_passe) VALUES (?, ?, ?, ?)',
      [nom.trim(), prenom.trim(), email.toLowerCase(), hash]
    );

    res.status(201).json({ message: 'Vous êtes enregistré' });
  } catch (err: any) {
    // MySQL duplicate entry (email already used)
    if (err?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Cette adresse e-mail est déjà utilisée.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Authenticate a user and return a signed JWT.
 *
 * Uses a constant-time password comparison (Argon2) to prevent timing attacks.
 * Returns the same generic error message for both unknown email and wrong
 * password to avoid user enumeration.
 *
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, mot_de_passe } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!email || !RE_EMAIL.test(email)) {
      return res.status(400).json({ message: 'Adresse e-mail invalide.' });
    }
    if (!mot_de_passe || typeof mot_de_passe !== 'string') {
      return res.status(400).json({ message: 'Mot de passe requis.' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM Utilisateur WHERE mail = ?',
      [email.toLowerCase()]
    );

    const users = rows as any[];

    // Generic error message to prevent user enumeration
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
