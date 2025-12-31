const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const queryText = 'SELECT *, TO_CHAR(created_at, \'DD-MM-YYYY HH12:MI AM\') as formatted_date FROM notifications ORDER BY created_at DESC';
    const { rows } = await db.query(queryText);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Public
 */
router.put('/:id/read', async (req, res) => {
    try {
        const queryText = 'UPDATE notifications SET is_read = true WHERE notification_id = $1 RETURNING *';
        const { rows } = await db.query(queryText, [req.params.id]);
        if(rows.length === 0) {
            return res.status(404).json({ msg: 'Notification not found.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
