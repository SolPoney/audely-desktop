import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // Recycle les connexions avant que l'hébergeur MySQL ne les coupe lui-même
  // (évite les erreurs PROTOCOL_CONNECTION_LOST sur connexion inactive).
  idleTimeout: 60000,
  maxIdle: 10,
});

// Sans ce listener, une connexion coupée côté serveur (inactivité, hébergeur
// qui ferme le socket) émet un 'error' non catché qui crashe tout le process.
pool.on('connection', (connection) => {
  connection.on('error', (err) => {
    console.error('Connexion MySQL perdue (pool), sera recréée:', err.message);
  });
});

export default pool;
