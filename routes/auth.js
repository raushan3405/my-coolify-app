const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Aapko ek secret key ki zaroorat hogi. Ise .env file mein daalna best practice hai.
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_super_secret_key';

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields.' });
  }

  try {
    // Check for existing user
    const userQuery = 'SELECT * FROM f_team WHERE email = $1';
    const { rows } = await db.query(userQuery, [email]);
    if (rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }

    const user = rows[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }

    // User matched, create JWT payload
    const payload = {
      user: {
        id: user.ftm_code,
        role: user.role,
        name: user.name
      },
    };

    // Sign token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '8h' }, // Token expires in 8 hours
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload.user });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
