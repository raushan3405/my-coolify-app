const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

// ... (Other routes remain the same)

/**
 * @route   GET /api/services
 * @desc    Get all services, with optional search
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let queryText = 'SELECT fs_code, service_name, category, price FROM services';
    const queryParams = [];
    if (search) {
      queryText += ' WHERE fs_code ILIKE $1 OR service_name ILIKE $1 OR category ILIKE $1';
      queryParams.push(`%${search}%`);
    }
    queryText += ' ORDER BY fs_code ASC';
    const { rows } = await db.query(queryText, queryParams);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/services/:id
 * @desc    Get a single service by its FS-Code
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const queryText = `SELECT *, TO_CHAR(start_date, 'YYYY-MM-DD') as start_date, TO_CHAR(end_date, 'YYYY-MM-DD') as end_date FROM services WHERE fs_code = $1`;
    const { rows } = await db.query(queryText, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Service not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/services
 * @desc    Create a new service
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { fs_code, service_name, price, category, advt_no, start_date, end_date, age_criteria } = req.body;
  if (!fs_code || !service_name || !price) {
    return res.status(400).json({ msg: 'Please provide a Service Code, Name, and Price.' });
  }
  try {
    const queryText = `INSERT INTO services (fs_code, service_name, price, category, advt_no, start_date, end_date, age_criteria) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const queryParams = [fs_code, service_name, price, category || null, advt_no || null, start_date || null, end_date || null, age_criteria || null];
    const { rows } = await db.query(queryText, queryParams);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(400).json({ msg: 'Service Code (FS-Code) already exists.' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/services/:id
 * @desc    Update a service
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { service_name, price, category, advt_no, start_date, end_date, age_criteria } = req.body;

    if (!service_name || !price) {
        return res.status(400).json({ msg: 'Service Name and Price are required fields.' });
    }

    const queryText = `UPDATE services 
                       SET service_name = $1, price = $2, category = $3, advt_no = $4, start_date = $5, end_date = $6, age_criteria = $7, updated_at = CURRENT_TIMESTAMP
                       WHERE fs_code = $8 RETURNING *`;
    
    const queryParams = [service_name, price, category || null, advt_no || null, start_date || null, end_date || null, age_criteria || null, id];

    const { rows } = await db.query(queryText, queryParams);

    if (rows.length === 0) {
        return res.status(404).json({ msg: 'Service not found.' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete a service by its FS-Code
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const queryText = 'DELETE FROM services WHERE fs_code = $1';
    const result = await db.query(queryText, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Service not found.' });
    }
    res.json({ msg: 'Service deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
