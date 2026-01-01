const { Pool } = require('pg');
require('dotenv').config();

// Create a new connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  ssl: false,
});

// Export the pool object along with the query function
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool, // इस लाइन को जोड़ें
};
