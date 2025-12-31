const { Pool } = require('pg');
require('dotenv').config();

// Create a new connection pool using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export a query function that uses the pool
// This is a common pattern to ensure we can easily use the pool throughout the app
module.exports = {
  query: (text, params) => pool.query(text, params),
};
