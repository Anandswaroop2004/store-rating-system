const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool to MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_rating_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected successfully to MySQL Database:', process.env.DB_NAME || 'store_rating_db');
    connection.release();
  } catch (error) {
    console.error('Failed to connect to MySQL Database:', error.message);
  }
})();

module.exports = pool;
