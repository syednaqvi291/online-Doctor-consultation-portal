const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT and protect routes.
 * This ensures that only logged-in users can access specific dashboard data.
 */
const authMiddleware = (req, res, next) => {
    // Get token from the request header
    const token = req.header('x-auth-token');

    // Check if no token is present
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify token using the secret key from your .env file
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add the user data (id and role) from the payload to the request object
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

/**
 * Role-based access control middleware.
 * Use this to restrict routes to specific roles (e.g., only Admins can approve doctors).
 */
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Access denied: Unauthorized role' });
        }
        next();
    };
};

module.exports = { authMiddleware, checkRole };