const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

// ... (GET all, GET by ID, POST, DELETE routes remain the same)

/**
 * @route   GET /api/customers
 * @desc    Get all customers, with optional search
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let queryText = 'SELECT cust_id, name, email, mob_no, gender, caste, address FROM customers';
    const queryParams = [];
    if (search) {
      queryText += ' WHERE cust_id ILIKE $1 OR name ILIKE $1 OR email ILIKE $1 OR mob_no ILIKE $1';
      queryParams.push(`%${search}%`);
    }
    queryText += ' ORDER BY cust_id ASC';
    const { rows } = await db.query(queryText, queryParams);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/customers/:id
 * @desc    Get a single customer by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const queryText = 'SELECT *, TO_CHAR(dob, \'YYYY-MM-DD\') as dob FROM customers WHERE cust_id = $1';
    const { rows } = await db.query(queryText, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Customer not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/customers
 * @desc    Create a new customer
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { cust_id, name, email, mob_no, dob, gender, caste, address } = req.body;
  if (!cust_id || !name) {
    return res.status(400).json({ msg: 'Please provide a Customer ID and Name.' });
  }
  try {
    const queryText = 'INSERT INTO customers (cust_id, name, email, mob_no, dob, gender, caste, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
    const queryParams = [cust_id, name, email || null, mob_no || null, dob || null, gender || null, caste || null, address || null];
    const { rows } = await db.query(queryText, queryParams);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(400).json({ msg: 'Customer ID already exists.' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/customers/:id
 * @desc    Update a customer
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mob_no, dob, gender, caste, address } = req.body;

    if (!name) {
        return res.status(400).json({ msg: 'Name is a required field.' });
    }

    const queryText = `UPDATE customers 
                       SET name = $1, email = $2, mob_no = $3, dob = $4, gender = $5, caste = $6, address = $7, updated_at = CURRENT_TIMESTAMP
                       WHERE cust_id = $8 RETURNING *`;
    
    const queryParams = [name, email || null, mob_no || null, dob || null, gender || null, caste || null, address || null, id];

    const { rows } = await db.query(queryText, queryParams);

    if (rows.length === 0) {
        return res.status(404).json({ msg: 'Customer not found.' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete a customer by ID
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const queryText = 'DELETE FROM customers WHERE cust_id = $1';
    const result = await db.query(queryText, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Customer not found.' });
    }
    res.json({ msg: 'Customer deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
