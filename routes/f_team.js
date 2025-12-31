const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

/**
 * @route   GET /api/f_team
 * @desc    Get all team members
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const queryText = 'SELECT ftm_code, name, role, email, is_active FROM f_team ORDER BY name ASC';
    const { rows } = await db.query(queryText);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/f_team/:id
 * @desc    Get a single team member by FTM Code
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const queryText = 'SELECT * FROM f_team WHERE ftm_code = $1';
    const { rows } = await db.query(queryText, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Team member not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/f_team
 * @desc    Create a new team member
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { ftm_code, name, role, email } = req.body;
  if (!ftm_code || !name) {
    return res.status(400).json({ msg: 'Team Member Code (FTM Code) and Name are required.' });
  }
  try {
    const queryText = 'INSERT INTO f_team (ftm_code, name, role, email) VALUES ($1, $2, $3, $4) RETURNING *';
    const queryParams = [ftm_code, name, role || null, email || null];
    const { rows } = await db.query(queryText, queryParams);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(400).json({ msg: 'Team Member Code (FTM Code) or Email already exists.' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/f_team/:id
 * @desc    Update a team member
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, is_active } = req.body;
    if (!name) {
      return res.status(400).json({ msg: 'Name is a required field.' });
    }
    const queryText = `UPDATE f_team SET name = $1, role = $2, email = $3, is_active = $4 WHERE ftm_code = $5 RETURNING *`;
    const queryParams = [name, role || null, email || null, is_active, id];
    const { rows } = await db.query(queryText, queryParams);
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Team member not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') { // Handle unique constraint violation on email
      return res.status(400).json({ msg: 'Email already in use by another team member.' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE /api/f_team/:id
 * @desc    Delete a team member
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Note: In a real-world app, you might want to prevent deleting a team member who has assigned orders.
    // You could first check the 'orders' table before deleting.
    const result = await db.query('DELETE FROM f_team WHERE ftm_code = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Team member not found.' });
    }
    res.json({ msg: 'Team member deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    // Handle foreign key constraint violation
    if(err.code === '23503'){
      return res.status(400).json({ msg: 'Cannot delete team member. They are still assigned to existing orders.' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
