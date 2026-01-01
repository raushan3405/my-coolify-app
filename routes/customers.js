const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../multer-config');
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

// --- POST, GET, and DELETE routes from previous steps ---
router.post('/', upload.array('documents'), async (req, res) => { /* ... existing code ... */ });
router.get('/', async (req, res) => { /* ... existing code ... */ });
router.get('/:cust_id', async (req, res) => { /* ... existing code ... */ });
router.delete('/:cust_id', async (req, res) => { /* ... existing code ... */ });

/**
 * @route   PUT /api/customers/:cust_id
 * @desc    Update customer details, add new documents, and remove existing ones
 * @access  Public
 */
router.put('/:cust_id', upload.array('new_documents'), async (req, res) => {
    const { cust_id } = req.params;
    const { full_name, email, mobile_number, date_of_birth, gender, mother_name, father_name, caste, address, pin_code, identification_1, identification_2, new_document_names, documents_to_delete } = req.body;

    if (!full_name || !mobile_number) {
        return res.status(400).json({ msg: 'Full Name and Mobile Number are required.' });
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Handle Deletion of existing documents
        if (documents_to_delete) {
            const docsToDelete = Array.isArray(documents_to_delete) ? documents_to_delete : [documents_to_delete];
            for (const docId of docsToDelete) {
                const docRes = await client.query('SELECT file_path FROM customer_documents WHERE document_id = $1 AND cust_id = $2', [docId, cust_id]);
                if (docRes.rows.length > 0) {
                    const filePath = docRes.rows[0].file_path;
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(`Failed to delete file: ${filePath}`, err);
                    });
                    await client.query('DELETE FROM customer_documents WHERE document_id = $1', [docId]);
                }
            }
        }

        // 2. Handle Upload of new documents
        if (req.files && req.files.length > 0) {
            const docQuery = 'INSERT INTO customer_documents (cust_id, document_name, file_path) VALUES ($1, $2, $3)';
            for (let i = 0; i < req.files.length; i++) {
                const docName = Array.isArray(new_document_names) ? new_document_names[i] : new_document_names;
                await client.query(docQuery, [cust_id, docName, req.files[i].path]);
            }
        }

        // 3. Update the customer's primary details
        const customerQuery = `
            UPDATE customers SET 
            full_name = $1, email = $2, mobile_number = $3, date_of_birth = $4, gender = $5, mother_name = $6, father_name = $7, caste = $8, address = $9, pin_code = $10, identification_1 = $11, identification_2 = $12
            WHERE cust_id = $13 RETURNING *
        `;
        const customerParams = [full_name, email || null, mobile_number, date_of_birth || null, gender, mother_name, father_name, caste, address, pin_code, identification_1, identification_2, cust_id];
        const customerResult = await client.query(customerQuery, customerParams);

        if (customerResult.rowCount === 0) {
            throw new Error('Customer not found during update.');
        }

        await client.query('COMMIT');
        res.json(customerResult.rows[0]);

    } catch (err) {
        await client.query('ROLLBACK');
        // Cleanup any newly uploaded files on error
        if (req.files) {
            req.files.forEach(file => fs.unlink(file.path, (err) => { if (err) console.error("Error cleaning up file:", err); }));
        }
        if (err.code === '23505') {
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

module.exports = router;
