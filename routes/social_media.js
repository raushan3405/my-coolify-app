const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @route   GET /api/social_media
 * @desc    Get all social media posts
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const query = "SELECT *, TO_CHAR(scheduled_post_date, 'DD-MM-YYYY HH:MI AM') as formatted_post_date FROM social_media_posts ORDER BY scheduled_post_date DESC";
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/social_media/:id
 * @desc    Get a single post by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const query = "SELECT *, TO_CHAR(scheduled_post_date, 'YYYY-MM-DD\"T\"HH24:MI') as scheduled_post_date FROM social_media_posts WHERE post_id = $1";
        const { rows } = await db.query(query, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ msg: 'Post not found.' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/social_media
 * @desc    Create a new social media post
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        const { platform, content, image_url, link_url, scheduled_post_date, status } = req.body;
        if (!platform || !content) {
            return res.status(400).json({ msg: 'Platform and Content are required fields.' });
        }
        const query = `INSERT INTO social_media_posts (platform, content, image_url, link_url, scheduled_post_date, status)
                       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const params = [platform, content, image_url || null, link_url || null, scheduled_post_date || null, status || 'Draft'];
        const { rows } = await db.query(query, params);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   PUT /api/social_media/:id
 * @desc    Update a social media post
 * @access  Public
 */
router.put('/:id', async (req, res) => {
    try {
        const { platform, content, image_url, link_url, scheduled_post_date, status } = req.body;
        if (!platform || !content || !status) {
            return res.status(400).json({ msg: 'Platform, Content, and Status are required.' });
        }
        const query = `UPDATE social_media_posts 
                       SET platform = $1, content = $2, image_url = $3, link_url = $4, scheduled_post_date = $5, status = $6
                       WHERE post_id = $7 RETURNING *`;
        const params = [platform, content, image_url || null, link_url || null, scheduled_post_date || null, status, req.params.id];
        const { rows } = await db.query(query, params);
        if (rows.length === 0) return res.status(404).json({ msg: 'Post not found.' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   DELETE /api/social_media/:id
 * @desc    Delete a social media post
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM social_media_posts WHERE post_id = $1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ msg: 'Post not found.' });
        res.json({ msg: 'Post deleted successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
