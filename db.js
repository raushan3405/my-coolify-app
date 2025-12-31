const { Pool } = require('pg');
require('dotenv').config();

// Create a new connection pool using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Export a query function that uses the pool
// This is a common pattern to ensure we can easily use the pool throughout the app
module.exports = {
  query: (text, params) => pool.query(text, params),
};
