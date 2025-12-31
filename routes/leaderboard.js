const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

/**
 * @route   GET /api/leaderboard
 * @desc    Get ranked team members based on total sales
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // This query calculates the total sales for each team member and ranks them.
    const queryText = `
      SELECT
        RANK() OVER (ORDER BY SUM(s.sale_amount) DESC) as rank,
        s.ftm_name,
        s.ftm_code,
        SUM(s.sale_amount) as total_income
        -- You can add COUNT(*) as total_orders, AVG(reviews) as avg_review etc. here later
      FROM sales s
      WHERE s.ftm_code IS NOT NULL
      GROUP BY s.ftm_code, s.ftm_name
      ORDER BY rank ASC;
    `;

    const { rows } = await db.query(queryText);
    res.json(rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
