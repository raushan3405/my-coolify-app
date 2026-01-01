const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../multer-config'); // Import multer configuration
const fs = require('fs');

// --- Helper Function for Customer ID Generation ---
const generateCustId = (mobileNumber) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const lastFour = mobileNumber.slice(-4);
    return `FS${day}${month}${year}${lastFour}`;
};

/**
 * @route   POST /api/customers
 * @desc    Create a new customer with optional documents
 * @access  Public
 */
router.post('/', upload.array('documents'), async (req, res) => {
    const { full_name, email, mobile_number, date_of_birth, gender, mother_name, father_name, caste, address, pin_code, identification_1, identification_2, document_names } = req.body;

    if (!full_name || !mobile_number) {
        return res.status(400).json({ msg: 'Full Name and Mobile Number are required.' });
    }

    const cust_id = generateCustId(mobile_number);
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // Insert customer data
        const customerQuery = `
            INSERT INTO customers (cust_id, full_name, email, mobile_number, date_of_birth, gender, mother_name, father_name, caste, address, pin_code, identification_1, identification_2)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
        `;
        const customerParams = [cust_id, full_name, email || null, mobile_number, date_of_birth || null, gender, mother_name, father_name, caste, address, pin_code, identification_1, identification_2];
        const customerResult = await client.query(customerQuery, customerParams);

        // Insert document metadata if files are uploaded
        if (req.files && req.files.length > 0) {
            const docQuery = 'INSERT INTO customer_documents (cust_id, document_name, file_path) VALUES ($1, $2, $3)';
            for (let i = 0; i < req.files.length; i++) {
                const docName = Array.isArray(document_names) ? document_names[i] : document_names;
                const filePath = req.files[i].path;
                await client.query(docQuery, [cust_id, docName, filePath]);
            }
        }

        await client.query('COMMIT');
        res.status(201).json(customerResult.rows[0]);

    } catch (err) {
        await client.query('ROLLBACK');
        // Cleanup uploaded files on error
        if (req.files) {
            req.files.forEach(file => fs.unlinkSync(file.path));
        }
        if (err.code === '23505') { // Unique violation
            const detail = err.detail.toLowerCase();
            if (detail.includes('email')) return res.status(409).json({ msg: 'This email is already registered.' });
            if (detail.includes('mobile')) return res.status(409).json({ msg: 'This mobile number is already registered.' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
});

/**
 * @route   GET /api/customers
 * @desc    Get a simplified list of all customers
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT cust_id, full_name, email, mobile_number, gender, caste, address FROM customers ORDER BY created_at DESC';
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/customers/:cust_id
 * @desc    Get full details for a single customer, including documents
 * @access  Public
 */
router.get('/:cust_id', async (req, res) => {
    try {
        const customerQuery = 'SELECT *, TO_CHAR(date_of_birth, \'YYYY-MM-DD\') as date_of_birth FROM customers WHERE cust_id = $1';
        const documentsQuery = 'SELECT * FROM customer_documents WHERE cust_id = $1 ORDER BY uploaded_at DESC';

        const customerResult = await db.query(customerQuery, [req.params.cust_id]);
        if (customerResult.rows.length === 0) return res.status(404).json({ msg: 'Customer not found.' });

        const documentsResult = await db.query(documentsQuery, [req.params.cust_id]);

        const customer = customerResult.rows[0];
        customer.documents = documentsResult.rows;

        res.json(customer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// NOTE: PUT and DELETE endpoints would be refactored similarly to handle documents, but are omitted here to focus on the core new requirements.

module.exports = router;
