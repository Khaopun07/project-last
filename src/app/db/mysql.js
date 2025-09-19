// src/app/db/mysql.ts หรือ wherever you placed
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'cs652021049',
  password: process.env.DB_PASSWORD || 'cs652021049',
  database: process.env.DB_NAME || 'guidance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

