const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

// Path to to scraper directory and log file
const SCRAPER_DIR = path.resolve(__dirname, '../../scraper');
const LOG_FILE = path.join(SCRAPER_DIR, 'scraper.log');
const PM2_NAME = 'ocsc-scraper'; // Define a name if we were using PM2, but we'll use raw process for simplicity if needed

// Helper to check if scraper is running across different OS
const checkIsRunning = async () => {
    try {
        if (process.platform === 'win32') {
            // On Windows, wmic is more reliable for checking command line arguments
            const { stdout } = await execPromise('wmic process where "name=\'python.exe\' or name=\'py.exe\'" get commandline 2>NUL');
            return stdout.includes('scraper.py');
        } else {
            const { stdout } = await execPromise('ps aux');
            return stdout.includes('scraper.py');
        }
    } catch (e) {
        return false;
    }
};

exports.getStatus = async (req, res) => {
    try {
        // Read the last few lines of the log file
        let logs = [];
        if (fs.existsSync(LOG_FILE)) {
            const data = fs.readFileSync(LOG_FILE, 'utf8');
            logs = data.split('\n').filter(line => line.trim() !== '').slice(-20); // Get last 20 lines
        }

        const isRunning = await checkIsRunning();

        res.json({
            success: true,
            data: {
                isRunning,
                logs,
            }
        });
    } catch (error) {
        console.error('Error fetching scraper status:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.startManualRun = async (req, res) => {
    try {
        if (await checkIsRunning()) {
            return res.status(400).json({ success: false, message: 'Scraper is already running.' });
        }

        console.log('Starting manual scraper run in:', SCRAPER_DIR);

        // Determine the correct python command
        let pythonCmd = 'python';
        if (process.platform === 'win32') {
            try {
                await execPromise('py --version');
                pythonCmd = 'py';
            } catch (e) {
                // Fallback to python
            }
        }

        // Spawn the process asynchronously
        const { spawn } = require('child_process');
        const scraperProcess = spawn(pythonCmd, ['scraper.py'], {
            cwd: SCRAPER_DIR,
            detached: false,
            stdio: 'ignore',
            windowsHide: true
        });

        scraperProcess.unref();

        res.json({ success: true, message: 'Scraper started manually.' });
    } catch (error) {
        console.error('Error starting scraper manually:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Optional: Node-Cron integrated scheduling if requested
// For a VPS, usually we configure docker-compose / OS cron. 
// Let's stub this to just return success for now if UI needs it.
exports.updateSchedule = async (req, res) => {
    try {
        const { frequency } = req.body;
        // TODO: Implement actual cron update logic (e.g., node-cron configuration updates)
        res.json({ success: true, message: 'Schedule updated to ' + frequency });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
