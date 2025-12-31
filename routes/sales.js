const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

/**
 * @route   GET /api/sales
 * @desc    Get all sales records with detailed information
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // This query joins multiple tables to get all the details required by the Sales UI
    const queryText = `
      SELECT 
        s.sale_id,
        TO_CHAR(s.completion_date, 'DD-MM-YYYY') as date,
        TO_CHAR(s.completion_date, 'HH12:MI AM') as time,
        s.cust_id,
        c.name as customer_name,
        c.gender,
        c.mob_no,
        c.caste,
        s.fs_code,
        sv.service_name,
        sv.category,
        s.ftm_code,
        s.ftm_name,
        o.govt_cost,
        o.service_cost,
        s.sale_amount
      FROM sales s
      LEFT JOIN orders o ON s.order_id = o.order_id
      LEFT JOIN customers c ON s.cust_id = c.cust_id
      LEFT JOIN services sv ON s.fs_code = sv.fs_code
      ORDER BY s.completion_date DESC
    `;

    const { rows } = await db.query(queryText);
    res.json(rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
