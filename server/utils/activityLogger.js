const { db: firestore } = require('../config/firebase');

const logsRef = firestore.collection('system_logs');

/**
 * Logs a system activity or user action.
 * @param {string} action - The action code (e.g., 'BTN_LOGIN', 'BTN_START_EXAM')
 * @param {object} details - Additional details (e.g., ip_address, exam_id)
 * @param {string|null} userId - The ID of the user performing the action (optional)
 * @param {string} status - 'SUCCESS', 'FAILED', or 'PENDING' (default: 'SUCCESS')
 */
const logActivity = async (arg1, arg2 = {}, arg3 = null, arg4 = 'SUCCESS') => {
    try {
        let action, details, userId, status;

        // Check if arg1 is a Request object (has headers or method)
        if (arg1 && (arg1.headers || arg1.method)) {
            const req = arg1;
            action = arg2;
            details = arg3 || {};
            status = arg4;

            // Extract context from req
            userId = req.user ? req.user.id.toString() : null;

            // Add IP to details if not present
            if (!details.ip_address) {
                details.ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
            }
            // Add User Agent
            if (!details.user_agent) {
                details.user_agent = req.headers['user-agent'];
            }

        } else {
            // Legacy signature: (action, details, userId, status)
            action = arg1;
            details = arg2;
            userId = arg3 ? arg3.toString() : null;
            status = arg4;
        }

        const newLogRef = logsRef.doc();
        await newLogRef.set({
            id: newLogRef.id,
            action,
            details: details || {},
            user_id: userId,
            status,
            created_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to create system log:', error);
        // We don't want to crash the request if logging fails, just log the error
    }
};

module.exports = { logActivity };
