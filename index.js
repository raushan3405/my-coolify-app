require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Frmply API!' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      success: true,
      serverTime: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// --- API ROUTES ---
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const customerRoutes = require('./routes/customers');
app.use('/api/customers', customerRoutes);

const serviceRoutes = require('./routes/services');
app.use('/api/services', serviceRoutes);

const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

const fTeamRoutes = require('./routes/f_team');
app.use('/api/f_team', fTeamRoutes);

const salesRoutes = require('./routes/sales');
app.use('/api/sales', salesRoutes);

const invoiceRoutes = require('./routes/invoices');
app.use('/api/invoices', invoiceRoutes);

const leaderboardRoutes = require('./routes/leaderboard');
app.use('/api/leaderboard', leaderboardRoutes);

const budgetRoutes = require('./routes/budget');
app.use('/api/budget', budgetRoutes);

const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

const supportRoutes = require('./routes/support');
app.use('/api/support', supportRoutes);

const socialMediaRoutes = require('./routes/social_media');
app.use('/api/social_media', socialMediaRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
