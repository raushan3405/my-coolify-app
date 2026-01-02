require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve all static files (CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- API ROUTES ---
// All API routes are defined first, so they are not caught by the page routing logic
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

// --- SECURE PAGE ROUTING ---

// Route for the login page. It should not be protected.
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Catch-all route for the main application.
// This will protect all other routes.
app.get('/*', authMiddleware, (req, res) => {
    // The authMiddleware runs first. It adds `req.user` if the token cookie is valid.
    if (!req.user) {
        // If there's no valid user, they are not logged in. Redirect to the login page.
        return res.redirect('/login');
    }
    
    // If a valid user exists, serve the main application shell.
    // The client-side code will then show the correct page based on the URL.
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server is now running securely on port ${PORT}`);
});
