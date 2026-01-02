const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_super_secret_key';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields.' });
  }

  try {
    const userQuery = 'SELECT * FROM f_team WHERE email = $1 AND is_active = true';
    const { rows } = await db.query(userQuery, [email]);
    if (rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials or account inactive.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }

    const payload = {
      user: {
        id: user.ftm_code,
        role: user.role,
        name: user.name
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ success: true, user: payload.user });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/logout', (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.json({ success: true, msg: 'Logged out successfully.' });
});

module.exports = router;
