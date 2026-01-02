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
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['New', 'In Progress', 'Completed', 'Site Crash', 'Cancelled'];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ msg: 'Invalid status.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      `SELECT o.order_id, o.cust_id, o.fs_code, o.ftm_code, o.status, o.govt_cost, o.service_cost,
              c.name as customer_name, s.service_name, ft.name as ftm_name
         FROM orders o
         LEFT JOIN customers c ON o.cust_id = c.cust_id
         LEFT JOIN services s ON o.fs_code = s.fs_code
         LEFT JOIN f_team ft ON o.ftm_code = ft.ftm_code
        WHERE o.order_id = $1`,
      [id]
    );

    if (orderRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ msg: 'Order not found.' });
    }

    const order = orderRes.rows[0];
    const previousStatus = order.status;

    const updatedOrderRes = await client.query(
      'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *',
      [status, id]
    );

    if (status === 'Completed') {
      const saleAmount = (parseFloat(order.govt_cost) || 0) + (parseFloat(order.service_cost) || 0);
      await client.query(
        `INSERT INTO sales (order_id, cust_id, fs_code, ftm_code, sale_amount, customer_name, service_name, ftm_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (order_id) DO UPDATE SET
           cust_id = EXCLUDED.cust_id,
           fs_code = EXCLUDED.fs_code,
           ftm_code = EXCLUDED.ftm_code,
           sale_amount = EXCLUDED.sale_amount,
           customer_name = EXCLUDED.customer_name,
           service_name = EXCLUDED.service_name,
           ftm_name = EXCLUDED.ftm_name`,
        [
          order.order_id,
          order.cust_id,
          order.fs_code,
          order.ftm_code,
          saleAmount,
          order.customer_name || null,
          order.service_name || null,
          order.ftm_name || null,
        ]
      );
    } else if (previousStatus === 'Completed') {
      await client.query('DELETE FROM sales WHERE order_id = $1', [id]);
    }

    await client.query('COMMIT');
    res.json({ success: true, order: updatedOrderRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

module.exports = router;
