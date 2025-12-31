const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

// ... (GET all and POST routes remain the same)

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices with customer details
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const queryText = `SELECT i.invoice_id, i.invoice_number, i.order_id, i.cust_id, c.name as customer_name, TO_CHAR(i.issue_date, 'DD-MM-YYYY') as issue_date, TO_CHAR(i.due_date, 'DD-MM-YYYY') as due_date, i.grand_total, i.status FROM invoices i LEFT JOIN customers c ON i.cust_id = c.cust_id ORDER BY i.invoice_id DESC`;
    const { rows } = await db.query(queryText);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/invoices/:id
 * @desc    Get a single, detailed invoice for viewing/printing
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const queryText = `
        SELECT
            i.invoice_id, i.invoice_number, i.status,
            TO_CHAR(i.issue_date, 'DD Mon, YYYY') as issue_date,
            TO_CHAR(i.due_date, 'DD Mon, YYYY') as due_date,
            c.name as customer_name, c.address as customer_address, c.email as customer_email, c.mob_no as customer_mob_no,
            s.service_name,
            o.govt_cost,
            o.service_cost,
            i.subtotal,
            i.tax_rate,
            i.tax_amount,
            i.grand_total
        FROM invoices i
        JOIN orders o ON i.order_id = o.order_id
        JOIN customers c ON i.cust_id = c.cust_id
        JOIN services s ON o.fs_code = s.fs_code
        WHERE i.invoice_id = $1
    `;
    const { rows } = await db.query(queryText, [id]);

    if (rows.length === 0) {
        return res.status(404).json({ msg: 'Invoice not found.' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


/**
 * @route   POST /api/invoices
 * @desc    Generate a new invoice from a completed order
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) {
    return res.status(400).json({ msg: 'Order ID is required.' });
  }
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const existingInvoice = await client.query('SELECT order_id FROM invoices WHERE order_id = $1', [order_id]);
    if (existingInvoice.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ msg: 'An invoice for this order already exists.' });
    }
    const orderRes = await client.query('SELECT * FROM orders WHERE order_id = $1 AND status = \'Completed\'', [order_id]);
    if (orderRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ msg: 'Completed order not found.' });
    }
    const order = orderRes.rows[0];
    const lastInvoiceRes = await client.query('SELECT invoice_number FROM invoices ORDER BY invoice_id DESC LIMIT 1');
    let newInvoiceNumber = 'INV-2024-0001';
    if (lastInvoiceRes.rowCount > 0) {
      const lastNum = parseInt(lastInvoiceRes.rows[0].invoice_number.split('-')[2]);
      const newNum = (lastNum + 1).toString().padStart(4, '0');
      newInvoiceNumber = `INV-2024-${newNum}`;
    }
    const subtotal = parseFloat(order.govt_cost) + parseFloat(order.service_cost);
    const tax_rate = 18.00;
    const tax_amount = subtotal * (tax_rate / 100);
    const grand_total = subtotal + tax_amount;
    const queryText = `INSERT INTO invoices (invoice_number, order_id, cust_id, subtotal, tax_rate, tax_amount, grand_total, issue_date, due_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', 'Unpaid') RETURNING *`;
    const queryParams = [newInvoiceNumber, order_id, order.cust_id, subtotal, tax_rate, tax_amount, grand_total];
    const { rows } = await client.query(queryText, queryParams);
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

module.exports = router;
