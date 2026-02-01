const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                console.warn(`[AUTH FAIL] User not found for ID: ${decoded.id}`);
                return res.status(401).json({ message: 'User no longer exists' });
            }

            req.user = user;
            console.log(`[AUTH SUCCESS] User: ${user.email}, Role: ${user.role}, Path: ${req.path}`);
            return next();
        } catch (error) {
            console.error(`[AUTH ERROR] ${error.message} - Path: ${req.path}`);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.warn(`[AUTH FAIL] No token provided - Path: ${req.path}`);
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorize };
