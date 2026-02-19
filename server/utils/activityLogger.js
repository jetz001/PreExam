const db = require('../models');
const { SystemLog } = db;

/**
 * Logs a system activity or user action.
 * @param {string} action - The action code (e.g., 'BTN_LOGIN', 'BTN_START_EXAM')
 * @param {object} details - Additional details (e.g., ip_address, exam_id)
 * @param {number|null} userId - The ID of the user performing the action (optional)
 * @param {string} status - 'SUCCESS', 'FAILED', or 'PENDING' (default: 'SUCCESS')
 */
const logActivity = async (action, details = {}, userId = null, status = 'SUCCESS') => {
    try {
        await SystemLog.create({
            action,
            details: details,
            user_id: userId,
            status
        });
    } catch (error) {
        console.error('Failed to create system log:', error);
        // We don't want to crash the request if logging fails, just log the error
    }
};

module.exports = { logActivity };
