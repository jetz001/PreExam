const { SystemLog } = require('../models');

async function countLogs() {
    try {
        const count = await SystemLog.count();
        console.log(`Total System Logs: ${count}`);

        const recent = await SystemLog.findAll({
            limit: 5,
            order: [['created_at', 'DESC']]
        });

        console.log('Recent Logs:');
        recent.forEach(log => {
            console.log(`- [${log.action}] User: ${log.user_id} | ${JSON.stringify(log.details)}`);
        });

    } catch (error) {
        console.error('Error counting logs:', error);
    }
}

countLogs();
