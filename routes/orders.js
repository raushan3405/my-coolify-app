const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

// ... (GET and PUT routes remain the same) ...

/**
 * @route   GET /api/orders
 * @desc    Get all orders with customer, service, and team details
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const queryText = `
      SELECT 
        o.order_id, TO_CHAR(o.created_at, 'DD-MM-YYYY') as date, TO_CHAR(o.created_at, 'HH12:MI AM') as time,
        o.cust_id, c.name as customer_name, o.fs_code, s.service_name, o.ftm_code, ft.name as ftm_name, o.status
      FROM orders o
      LEFT JOIN customers c ON o.cust_id = c.cust_id
      LEFT JOIN services s ON o.fs_code = s.fs_code
      LEFT JOIN f_team ft ON o.ftm_code = ft.ftm_code
      ORDER BY o.created_at DESC
    `;
    const { rows } = await db.query(queryText);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/orders
 * @desc    Create a new order and a notification
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { cust_id, fs_code, ftm_code, govt_cost, service_cost } = req.body;
  if (!cust_id || !fs_code) {
    return res.status(400).json({ msg: 'Customer and Service are required.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create the Order
    const orderQuery = `INSERT INTO orders (cust_id, fs_code, ftm_code, govt_cost, service_cost, status) VALUES ($1, $2, $3, $4, $5, 'New') RETURNING *`;
    const orderParams = [cust_id, fs_code, ftm_code || null, govt_cost || 0, service_cost || 0];
    const orderResult = await client.query(orderQuery, orderParams);
    const newOrder = orderResult.rows[0];

    // 2. Create a Notification for the new order
    const customer = await client.query('SELECT name FROM customers WHERE cust_id = $1', [newOrder.cust_id]);
    const customerName = customer.rows.length > 0 ? customer.rows[0].name : 'A customer';
    const notificationMessage = `New order #${newOrder.order_id} created for ${customerName}`;
    const notificationLink = `/my-orders.html?highlight=${newOrder.order_id}`;

    const notificationQuery = 'INSERT INTO notifications (message, link_url) VALUES ($1, $2)';
    await client.query(notificationQuery, [notificationMessage, notificationLink]);

    await client.query('COMMIT');
    res.status(201).json(newOrder);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    if (err.code === '23503') {
      return res.status(404).json({ msg: 'Customer, Service, or Team member not found.' });
    }
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});


/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update the status of an order
 * @access  Public
 */
router.put('/:id/status', async (req, res) => {
  // ... (existing PUT logic remains the same)
});

module.exports = router;
