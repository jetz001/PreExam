const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { sequelize } = require('../models');

// Configuration
const BACKUP_DIR = '/backups'; // On VPS
const RESTORE_SCRIPT = path.join(__dirname, '../restore_sqlite.js');
const BACKUP_SCRIPT = '/root/PreExam/scripts/backup.sh'; // On VPS

exports.getBackups = async (req, res) => {
    try {
        if (!fs.existsSync(BACKUP_DIR)) {
            return res.json({ success: true, backups: [] });
        }

        const files = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.endsWith('.zip'))
            .map(file => {
                const stats = fs.statSync(path.join(BACKUP_DIR, file));
                return {
                    name: file,
                    size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
                    created_at: stats.birthtime,
                    path: path.join(BACKUP_DIR, file) // Internal path
                };
            })
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json({ success: true, backups: files });
    } catch (error) {
        console.error('Get Backups Error:', error);
        res.status(500).json({ success: false, message: 'Failed to list backups' });
    }
};

exports.createBackup = async (req, res) => {
    try {
        // Execute shell script
        exec(`bash ${BACKUP_SCRIPT}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Backup Script Error: ${error.message}`);
                return res.status(500).json({ success: false, message: 'Backup failed', error: error.message });
            }
            if (stderr) {
                console.warn(`Backup Script Stderr: ${stderr}`);
            }
            console.log(`Backup Script Output: ${stdout}`);

            // Return success immediately (or wait? wait is better for UI feedback)
            res.json({ success: true, message: 'Backup created successfully' });
        });
    } catch (error) {
        console.error('Create Backup Error:', error);
        res.status(500).json({ success: false, message: 'Failed to trigger backup' });
    }
};

exports.restoreBackup = async (req, res) => {
    try {
        const { filename } = req.body; // If restoring from existing
        let filePath;

        // Verify Admin Password/Security? (Middleware handles auth)

        if (req.file) {
            // Uploaded file
            filePath = req.file.path;
        } else if (filename) {
            // Existing file in /backups
            filePath = path.join(BACKUP_DIR, filename);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ success: false, message: 'Backup file not found' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'No backup file provided' });
        }

        // Create Temp Dir for Restore
        const RESTORE_TEMP = path.join(__dirname, '../../restore_temp_' + Date.now());
        if (!fs.existsSync(RESTORE_TEMP)) fs.mkdirSync(RESTORE_TEMP);

        // This assumes specific zip password from script
        const ZIP_PASSWORD = 'CHANGE_ME_TO_STRONG_PASSWORD';

        // Command to unzip and run restore
        const cmd = `unzip -o -P "${ZIP_PASSWORD}" "${filePath}" -d "${RESTORE_TEMP}" && node "${RESTORE_SCRIPT}" "${path.join(RESTORE_TEMP, 'temp.sqlite')}"`;

        console.log('Restoring executing:', cmd);

        exec(cmd, async (error, stdout, stderr) => {
            // Cleanup temp dir
            fs.rmSync(RESTORE_TEMP, { recursive: true, force: true });
            // If uploaded file, delete it too
            if (req.file) fs.unlinkSync(req.file.path);

            if (error) {
                console.error(`Restore Error: ${error.message}`);
                return res.status(500).json({ success: false, message: 'Restore failed', error: error.message, logs: stderr });
            }

            console.log(`Restore Output: ${stdout}`);

            // Restart PM2 to reload DB connection/cache
            // exec('pm2 restart all'); // Dangerous to do inside request, response might fail.
            // Better to respond first.

            res.json({ success: true, message: 'Restore successful. Server restarting...' });

            // Trigger restart after delay
            setTimeout(() => {
                exec('pm2 restart all');
            }, 2000);
        });

    } catch (error) {
        console.error('Restore Error:', error);
        res.status(500).json({ success: false, message: 'Restore process failed', error: error.message });
    }
};
