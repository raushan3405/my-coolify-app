const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// --- GET all team members ---
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

// --- GET single team member ---
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const queryText = 'SELECT ftm_code, name, role, email, is_active FROM f_team WHERE ftm_code = $1';
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
 * @desc    Create a new team member with a hashed default password
 * @access  (Should be Admin only)
 */
router.post('/', async (req, res) => {
  const { ftm_code, name, role, email } = req.body;
  if (!ftm_code || !name) {
    return res.status(400).json({ msg: 'FTM Code and Name are required.' });
  }

  try {
    // Hash the FTM code to be used as the default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ftm_code, salt);

    const queryText = 'INSERT INTO f_team (ftm_code, name, role, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const queryParams = [ftm_code, name, role || 'Employee', email || null, hashedPassword];
    
    const { rows } = await db.query(queryText, queryParams);
    
    // Do not return the password in the response
    const newUser = { ...rows[0] };
    delete newUser.password;

    res.status(201).json(newUser);

  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(400).json({ msg: 'FTM Code or Email already exists.' });
    }
    res.status(500).send('Server Error');
  }
});

// --- PUT and DELETE routes will be updated later with authorization ---
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, email, is_active } = req.body;

  if (!name) {
    return res.status(400).json({ msg: 'Name is required.' });
  }

  const normalizedRole = role ? String(role).trim() : 'Employee';
  const normalizedEmail = email ? String(email).trim() : null;

  let activeValue = null;
  if (typeof is_active !== 'undefined') {
    if (typeof is_active === 'boolean') {
      activeValue = is_active;
    } else {
      const s = String(is_active).trim().toLowerCase();
      activeValue = s === 'true' || s === '1' || s === 'yes';
    }
  }

  try {
    const queryText = `
      UPDATE f_team
      SET name = $1,
          role = $2,
          email = $3,
          is_active = COALESCE($4, is_active)
      WHERE ftm_code = $5
      RETURNING ftm_code, name, role, email, is_active
    `;
    const queryParams = [name, normalizedRole, normalizedEmail, activeValue, id];
    const { rows } = await db.query(queryText, queryParams);

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Team member not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(400).json({ msg: 'FTM Code or Email already exists.' });
    }
    res.status(500).send('Server Error');
  }
});
router.delete('/:id', async (req, res) => { /* ... existing code ... */ });

module.exports = router;
