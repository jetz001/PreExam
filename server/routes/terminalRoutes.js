const express = require('express');
const router = express.Router();
const aiGeneratorService = require('../services/aiGeneratorService');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Endpoint to handle "Virtual Terminal" style commands
router.post('/command', authMiddleware, adminMiddleware, async (req, res) => {
    const { command } = req.body;
    
    if (!command) {
        return res.status(400).json({ success: false, message: 'Command is required' });
    }

    // Basic command parser for the virtual terminal
    const cmdLower = command.trim().toLowerCase();
    
    try {
        if (cmdLower.startsWith('gen ') || cmdLower === 'gen' || cmdLower.startsWith('generate ') || cmdLower === 'generate') {
            let prompt = null;
            if (cmdLower.includes(' ')) {
                prompt = command.substring(command.indexOf(' ') + 1).trim();
            }

            if (!prompt) {
                return res.json({ 
                    success: true, 
                    message: "🤖 Starting automated generation (no specific prompt provided).\n>>> The AI will pick a category from rotation."
                });
            }

            await aiGeneratorService.runGenerator(prompt);
            return res.json({ 
                success: true, 
                message: `🤖 AI Generator started with prompt: "${prompt}"\n>>> The question is being generated and will be saved to the database.`,
                output: `>>> AI generated result for: ${prompt}`
            });
        }
        
        if (cmdLower === 'status') {
            const isRunning = aiGeneratorService.getIsRunning();
            return res.json({ 
                success: true, 
                message: isRunning ? '>>> Status: Generating...' : '>>> Status: Idle' 
            });
        }

        if (cmdLower === 'help') {
            return res.json({ 
                success: true, 
                message: `--- Terminal Commands ---\n- gen [prompt]: Generate a new exam question\n- status: Check generator status\n- help: Show this help message`
            });
        }

        return res.status(400).json({ success: false, message: `Unknown command: ${command}. Type 'help' for available commands.` });

    } catch (error) {
        console.error('Terminal Command Error:', error);
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
});

module.exports = router;
