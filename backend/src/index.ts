import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import exerciceRoutes from './routes/exerciceRoutes.js';
import resultatRoutes from "./routes/resultatRoutes.js"
import ttsRoutes from './routes/ttsRoutes.js'
import statsRoutes from './routes/statsRoutes.js'
import queteRoutes from './routes/queteRoutes.js'

import { verifyToken } from './middlewares/authMiddleware.js';

const app = express();

// Security headers (OWASP best practices). Le frontend est hébergé sur un
// domaine différent (Vercel) et charge l'audio TTS directement depuis cette
// API (<audio src="...">) : la valeur par défaut de Helmet pour
// Cross-Origin-Resource-Policy ("same-origin") bloquait silencieusement ce
// chargement côté navigateur. L'accès cross-origin est déjà restreint par
// CORS (CORS_ORIGIN) ; on autorise donc explicitement le chargement de
// ressources cross-origin.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? '*',
}));

// Global rate limiter: max 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes, réessayez dans 15 minutes.' },
});
app.use(globalLimiter);

// Stricter limiter for auth routes: max 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion, réessayez dans 15 minutes.' },
});

app.use(express.json({ limit: '10kb' }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', exerciceRoutes);
app.use("/api", resultatRoutes)
app.use('/api', ttsRoutes)
app.use('/api', statsRoutes)
app.use('/api', queteRoutes)

app.get('/api/ping', (_req, res) => res.json({ ok: true }));

app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'Accès autorisé', user: (req as any).user });
});


const PORT = process.env.PORT || 3000;

pool.getConnection()
  .then((connection) => {
    connection.release();
    console.log('Connecté à MySQL');
  })
  .catch((err) => console.error('Erreur MySQL:', err));

app.listen(PORT, () => console.log(`Serveur lancé sur ${PORT}`));
