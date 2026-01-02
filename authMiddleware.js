const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function(req, res, next) {
    // Get token from cookie
    const token = req.cookies.token;

    // If no token, continue without user info
    if (!token) {
        return next();
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        // Add user from payload to request object
        req.user = decoded.user;
        next();
    } catch (err) {
        // Invalid token
        res.cookie('token', '', { httpOnly: true, expires: new Date(0) }); // Clear invalid token
        return next();
    }
};
