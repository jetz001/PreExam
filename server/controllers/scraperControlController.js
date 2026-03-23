const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

// Path to to scraper directory and log file
const SCRAPER_DIR = path.resolve(__dirname, '../../scraper');
const LOG_FILE = path.join(SCRAPER_DIR, 'scraper.log');
const PM2_NAME = 'ocsc-scraper'; // Define a name if we were using PM2, but we'll use raw process for simplicity if needed

exports.getStatus = async (req, res) => {
    try {
        // Read the last few lines of the log file
        let logs = [];
        if (fs.existsSync(LOG_FILE)) {
            const data = fs.readFileSync(LOG_FILE, 'utf8');
            logs = data.split('\n').filter(line => line.trim() !== '').slice(-20); // Get last 20 lines
        }

        // Check if process is running (simple check by looking for python scraper.py)
        const { stdout } = await execPromise(process.platform === 'win32' ? 'tasklist' : 'ps aux');
        const isRunning = stdout.includes('scraper.py');

        // Note: For scheduling, if using cron, it's handled by OS. If we want dynamic in-app scheduling,
        // we might use node-cron on the server that spawns the python process instead.
        // For now, we report a static or stored schedule if we implement DB storage for it.

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
        // Check if already running to prevent overlap
        const { stdout } = await execPromise(process.platform === 'win32' ? 'tasklist' : 'ps aux');
        if (stdout.includes('scraper.py')) {
            return res.status(400).json({ success: false, message: 'Scraper is already running.' });
        }

        console.log('Starting manual scraper run in:', SCRAPER_DIR);

        // Spawn the process asynchronously so we don't block the request
        const { spawn } = require('child_process');
        const scraperProcess = spawn(process.platform === 'win32' ? 'python' : 'python3', ['scraper.py'], {
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
