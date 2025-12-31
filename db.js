const { Pool } = require('pg');
require('dotenv').config();

// Create a new connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

// Export a query function that uses the pool
// This is a common pattern to ensure we can easily use the pool throughout the app
module.exports = {
  query: (text, params) => pool.query(text, params),
};
