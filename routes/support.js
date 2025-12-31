const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @route   GET /api/support
 * @desc    Get all support tickets
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT t.*, c.name as customer_name, 
                   TO_CHAR(t.created_at, 'DD-MM-YYYY HH:MI AM') as formatted_created_at,
                   TO_CHAR(t.updated_at, 'DD-MM-YYYY HH:MI AM') as formatted_updated_at
            FROM support_tickets t
            LEFT JOIN customers c ON t.cust_id = c.cust_id
            ORDER BY t.updated_at DESC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/support/:id
 * @desc    Get a single ticket by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const query = 'SELECT * FROM support_tickets WHERE ticket_id = $1';
        const { rows } = await db.query(query, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ msg: 'Ticket not found.' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/support
 * @desc    Create a new support ticket
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        const { subject, description, cust_id, submitter_name, submitter_email, priority } = req.body;
        if (!subject || !description) {
            return res.status(400).json({ msg: 'Subject and Description are required fields.' });
        }

        const query = `
            INSERT INTO support_tickets (subject, description, cust_id, submitter_name, submitter_email, priority)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const params = [subject, description, cust_id || null, submitter_name || null, submitter_email || null, priority || 'Medium'];
        const { rows } = await db.query(query, params);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   PUT /api/support/:id
 * @desc    Update a support ticket (e.g., change status or priority)
 * @access  Public
 */
router.put('/:id', async (req, res) => {
    try {
        const { subject, description, status, priority } = req.body;
        if (!subject || !status || !priority) {
            return res.status(400).json({ msg: 'Subject, Status, and Priority are required.' });
        }
        const query = `
            UPDATE support_tickets 
            SET subject = $1, description = $2, status = $3, priority = $4 
            WHERE ticket_id = $5 RETURNING *
        `;
        const { rows } = await db.query(query, [subject, description, status, priority, req.params.id]);
        if (rows.length === 0) return res.status(404).json({ msg: 'Ticket not found.' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   DELETE /api/support/:id
 * @desc    Delete a support ticket
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM support_tickets WHERE ticket_id = $1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ msg: 'Ticket not found.' });
        res.json({ msg: 'Ticket deleted successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
