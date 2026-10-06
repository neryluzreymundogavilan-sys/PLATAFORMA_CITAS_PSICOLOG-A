const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexiones asíncronas MySQL con promesas
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bd_psicologia_scorza',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Prueba de verificación de la conexión a la Base de Datos
pool.getConnection()
  .then(connection => {
    console.log('[OK] Conexión exitosa a la Base de Datos MySQL (bd_psicologia_scorza)');
    connection.release();
  })
  .catch(err => {
    console.warn('[AVISO] No se pudo conectar a MySQL localmente:', err.message);
  });

module.exports = pool;
