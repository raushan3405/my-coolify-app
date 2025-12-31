const express = require('express');
const path = require('path');

const app = express();

// Use the PORT environment variable for cloud platforms, default to 3000
const PORT = process.env.PORT || 3000;

// --- Middleware ---

// 1. Serve static files from the 'public' directory (for HTML, CSS, client-side JS)
app.use(express.static(path.join(__dirname, 'public')));

// 2. Enable JSON body parsing for API requests
app.use(express.json());

// --- API Routes ---

// A test endpoint to confirm the API is working
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Frmply API!' });
});

// Import and use module-specific API routes
const customerRoutes = require('./routes/customers');
app.use('/api/customers', customerRoutes);

const serviceRoutes = require('./routes/services');
app.use('/api/services', serviceRoutes);


// --- Server Start ---

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
