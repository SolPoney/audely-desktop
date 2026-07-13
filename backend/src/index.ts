import "dotenv/config";
import pool from './config/db.js';
import express from "express";
import authRoutes from './routes/authRoutes.js';


const app = express();

app.use(express.json())
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 3000;

pool.getConnection()
  .then(() => console.log('Connecté à MySQL'))
  .catch((err) => console.error('Erreur MySQL:', err));

app.listen(PORT, () => console.log(`Serveur lancé sur ${PORT}`))