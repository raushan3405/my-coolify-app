require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// 1. Serve static assets (CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- API ROUTES (These remain the same) ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/services', require('./routes/services'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/f_team', require('./routes/f_team'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/support', require('./routes/support'));
app.use('/api/social_media', require('./routes/social_media'));

// --- Page Routing ---
// Any request that is not for an API route will serve the main index.html file.
// The client-side routing (in auth.js) will handle showing the correct content or redirecting to login.
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
