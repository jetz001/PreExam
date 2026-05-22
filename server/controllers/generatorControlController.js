const generatorService = require('../services/aiGeneratorService');
const path = require('path');
const fs = require('fs');

const GENERATOR_DIR = path.resolve(__dirname, '../../exam-generator');
const LOG_FILE = path.join(GENERATOR_DIR, 'generator.log');

exports.getStatus = async (req, res) => {
    try {
        let logs = [];
        if (fs.existsSync(LOG_FILE)) {
            const data = fs.readFileSync(LOG_FILE, 'utf8');
            logs = data.split('\n').filter(line => line.trim() !== '').slice(-40); // Get last 40 lines
        }

        const isRunning = generatorService.getIsRunning();

        res.json({
            success: true,
            data: {
                isRunning,
                logs,
            }
        });
    } catch (error) {
        console.error('Error fetching generator status:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const { frequency } = req.body;
        res.json({ success: true, message: 'Schedule updated to ' + frequency });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.startGenerator = async (req, res) => {
    try {
        if (generatorService.getIsRunning()) {
            return res.status(400).json({ success: false, message: 'Generator is already running.' });
        }

        console.log('Starting manual generator run via native Node.js service');

        // Fire and forget
        generatorService.runGenerator().catch(console.error);

        res.json({ success: true, message: 'Exam Generator started manually.' });
    } catch (error) {
        console.error('Error starting generator manually:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
