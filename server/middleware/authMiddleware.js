const jwt = require('jsonwebtoken');
const { db: firestore } = require('../config/firebase');

const usersRef = firestore.collection('users');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');

        const userDoc = await usersRef.doc(decoded.id.toString()).get();
        if (!userDoc.exists) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
        }

        const user = { id: userDoc.id, ...userDoc.data() };
        req.user = user;

        const now = new Date();
        if (!user.last_active_at || (now - new Date(user.last_active_at) > 60000)) {
            await userDoc.ref.update({ last_active_at: now.toISOString() });
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
        const userDoc = await usersRef.doc(decoded.id.toString()).get();

        if (userDoc.exists) {
            const user = { id: userDoc.id, ...userDoc.data() };
            console.log('OptionalAuth: User found', user.id);
            req.user = user;
        } else {
            console.log('OptionalAuth: User NOT found for token');
        }
        next();
    } catch (error) {
        console.log('OptionalAuth: Error', error.message);
        next();
    }
};

module.exports = { authMiddleware, optionalAuthMiddleware, adminMiddleware };
