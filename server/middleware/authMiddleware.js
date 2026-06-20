const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const getWorkerApiBase = () => {
    return String(process.env.WORKER_API_BASE || '').trim().replace(/\/+$/, '');
};

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        const workerApiBase = getWorkerApiBase();
        if (!workerApiBase) {
             // Fallback to decode JWT locally if worker API base isn't set
             const token = authHeader.split(' ')[1];
             const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
             req.user = { id: decoded.id };
             return next();
        }

        // Call the worker API to verify the token and get the user object
        const response = await fetch(`${workerApiBase}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token from worker' });
        }

        const userData = await response.json();
        if (!userData || !userData.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
        }

        req.user = userData.user;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
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

        const workerApiBase = getWorkerApiBase();
        if (!workerApiBase) {
             const token = authHeader.split(' ')[1];
             const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
             req.user = { id: decoded.id };
             return next();
        }

        const response = await fetch(`${workerApiBase}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userData = await response.json();
            if (userData && userData.user) {
                req.user = userData.user;
            }
        }
        next();
    } catch (error) {
        // Proceed as guest on invalid token
        next();
    }
};

module.exports = { authMiddleware, optionalAuthMiddleware, adminMiddleware };
