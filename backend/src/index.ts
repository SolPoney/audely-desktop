import 'dotenv/config';
import express from 'express';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { verifyToken } from './middlewares/authMiddleware.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'Accès autorisé', user: (req as any).user });
});

const PORT = process.env.PORT || 3000;

pool.getConnection()
  .then(() => console.log('Connecté à MySQL'))
  .catch((err) => console.error('Erreur MySQL:', err));

app.listen(PORT, () => console.log(`Serveur lancé sur ${PORT}`));
