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
app.use(cookieParser()); // Use cookie-parser
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// --- API ROUTES ---
app.use('/api/auth', require('./routes/auth'));
// Add authMiddleware to all protected API routes in the future
app.use('/api/customers', require('./routes/customers'));
// ... other API routes

// --- SECURE PAGE ROUTING ---

// 1. Login page route (does not need authentication)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 2. Secure routes for all other pages
// A function to create a secure route
const createSecureRoute = (urlPath) => {
    app.get(urlPath, authMiddleware, (req, res) => {
        if (!req.user) {
            // If middleware finds no valid user, redirect to login
            return res.redirect('/login');
        }
        // If user is valid, send the requested file
        // The urlPath needs to match the filename
        res.sendFile(path.join(__dirname, 'public', `${urlPath}.html`));
    });
};

// Create secure routes for all your pages
createSecureRoute('/'); // For the root, it should serve index.html
createSecureRoute('/customers');
createSecureRoute('/my-orders');
createSecureRoute('/services');
createSecureRoute('/sales');
createSecureRoute('/invoices');
createSecureRoute('/leaderboard');
createSecureRoute('/budget-track');
createSecureRoute('/settings');
createSecureRoute('/notifications');
createSecureRoute('/support');
createSecureRoute('/social-media');
// etc. for all sub-pages like new-customer, edit-customer...

// Special case for root, redirect to index.html logic
app.get('/', authMiddleware, (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
