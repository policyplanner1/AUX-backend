const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables from .env file when available
dotenv.config();

/**
 * Create a pooled MySQL connection.  Using a pool is
 * recommended for backend APIs because it re‑uses database
 * connections instead of constantly opening new ones.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'health_insurance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;