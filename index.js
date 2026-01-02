require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// CORRECTED: Serve all static files from the 'public' directory at the root level
app.use(express.static(path.join(__dirname, 'public')));

// --- API ROUTES ---
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

// Specific route for the login page to prevent redirect loop
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Catch-all route for the main application shell
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
