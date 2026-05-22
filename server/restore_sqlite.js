const { sequelize } = require('./models');
const path = require('path');
const fs = require('fs');

async function restore(backupPath) {
    if (!backupPath) {
        console.error("Please provide backup path argument");
        process.exit(1);
    }

    try {
        const absoluteBackupPath = path.resolve(backupPath);
        if (!fs.existsSync(absoluteBackupPath)) {
            console.error(`Backup file not found at: ${absoluteBackupPath}`);
            process.exit(1);
        }

        console.log(`Connecting to Live DB...`);
        await sequelize.authenticate();

        console.log(`Attaching backup: ${absoluteBackupPath}`);
        // Escape single quotes in path just in case
        const safePath = absoluteBackupPath.replace(/'/g, "''");
        await sequelize.query(`ATTACH DATABASE '${safePath}' AS backup_db`);

        const tables = [
            { name: 'Businesses', backupName: 'Businesses' },
            { name: 'business_posts', backupName: 'business_posts' },
            { name: 'BusinessReviews', backupName: 'BusinessReviews' },
            { name: 'UserFollows', backupName: 'UserFollows' },
            { name: 'UserBookmarks', backupName: 'UserBookmarks' },
            { name: 'BusinessPostLikes', backupName: 'BusinessPostLikes' },
            // Community Tables
            { name: 'threads', backupName: 'threads' },
            { name: 'comments', backupName: 'comments' },
            { name: 'polls', backupName: 'polls' },
            { name: 'poll_options', backupName: 'poll_options' },
            { name: 'poll_votes', backupName: 'poll_votes' },
            { name: 'interest_tags', backupName: 'interest_tags' },
            { name: 'thread_tags', backupName: 'thread_tags' },
            { name: 'ThreadLikes', backupName: 'ThreadLikes' },
            // Payment & Ads
            { name: 'PaymentSlips', backupName: 'PaymentSlips' },
            { name: 'SponsorTransactions', backupName: 'SponsorTransactions' },
            { name: 'Transactions', backupName: 'Transactions' },
            { name: 'Ads', backupName: 'Ads' },
            { name: 'AdMetrics', backupName: 'AdMetrics' },
            // Support & System
            { name: 'SupportTickets', backupName: 'SupportTickets' },
            { name: 'SupportMessages', backupName: 'SupportMessages' },
            { name: 'ContactMessages', backupName: 'ContactMessages' }, // Inbox
            { name: 'SystemSettings', backupName: 'SystemSettings' },
            { name: 'ReportedContent', backupName: 'ReportedContent' },
            { name: 'system_logs', backupName: 'system_logs' }
        ];

        for (const table of tables) {
            console.log(`Restoring ${table.name}...`);
            try {
                // Check if source table exists (it should)
                // We use INSERT OR IGNORE to prevent unique constraint errors (e.g. if we run this twice)
                // But if the live table is empty, it works as INSERT.
                const query = `INSERT OR IGNORE INTO main.${table.name} SELECT * FROM backup_db.${table.backupName}`;
                await sequelize.query(query);

                const [countResult] = await sequelize.query(`SELECT count(*) as count FROM main.${table.name}`);
                console.log(`  -> ${table.name} count: ${countResult[0].count}`);
            } catch (tableErr) {
                console.error(`  -> Failed to restore ${table.name}:`, tableErr.message);
                // Continue to next table
            }
        }

        console.log("Restore Complete!");
        process.exit(0);
    } catch (err) {
        console.error("Restore failed:", err);
        process.exit(1);
    }
}

const args = process.argv.slice(2);
restore(args[0]);
