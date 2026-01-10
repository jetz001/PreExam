const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
        }

        req.user = user;

        // Update last_active_at if > 1 minute
        const now = new Date();
        if (!user.last_active_at || (now - new Date(user.last_active_at) > 60000)) {
            await User.update({ last_active_at: now }, { where: { id: user.id } });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
};

const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // No token, proceed as guest
        }

        const token = authHeader.split(' ')[1];
        if (!token) return next();

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        const user = await User.findByPk(decoded.id);

        if (user) {
            console.log('OptionalAuth: User found', user.id);
            req.user = user;
            // Update activity (optional here, maybe skip for read-only to save DB writes)
        } else {
            console.log('OptionalAuth: User NOT found for token');
        }
        next();
    } catch (error) {
        // Invalid token - treat as guest rather than error? 
        console.log('OptionalAuth: Error', error.message);
        next();
    }
};

module.exports = { authMiddleware, optionalAuthMiddleware, adminMiddleware };
