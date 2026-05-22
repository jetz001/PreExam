const express = require('express');
const router = express.Router();
const aiGeneratorService = require('../services/aiGeneratorService');
const aiProviderFactory = require('../services/aiProviderFactory');
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
            const provider = aiProviderFactory.getProvider();
            return res.json({ 
                success: true, 
                message: isRunning ? `>>> Status: Generating (Using ${provider.name})...` : `>>> Status: Idle (Active Provider: ${provider.name})` 
            });
        }

        if (cmdLower === 'providers' || cmdLower === 'ls') {
            const providers = aiProviderFactory.getAllProviders();
            const list = providers.map(p => `${p.active ? '◉' : '○'} ${p.id.padEnd(12)} | ${p.name.padEnd(15)} | ${p.model}`).join('\n');
            return res.json({
                success: true,
                message: `--- Available AI Providers ---\n${list}\n\n>>> Tip: Type "use [id]" to switch.`
            });
        }

        if (cmdLower.startsWith('use ')) {
            const providerId = command.substring(4).trim().toLowerCase();
            const success = aiProviderFactory.setProvider(providerId);
            if (success) {
                const provider = aiProviderFactory.getProvider();
                return res.json({
                    success: true,
                    message: `>>> Switched to Provider: ${provider.name}\n>>> Active Model: ${provider.model}`
                });
            } else {
                return res.json({
                    success: false,
                    message: `❌ Invalid Provider ID: "${providerId}". Type "providers" to see the list.`
                });
            }
        }

        if (cmdLower === 'help') {
            return res.json({ 
                success: true, 
                message: `--- AI Terminal Commands ---\n- gen [prompt]: Generate a new exam question\n- status: Check generator status\n- providers: List available AI engines (DeepSeek, Gemini, etc.)\n- use [id]: Switch to a specific AI engine\n- help: Show this help message`
            });
        }

        return res.status(400).json({ success: false, message: `Unknown command: ${command}. Type 'help' for available commands.` });

    } catch (error) {
        console.error('Terminal Command Error:', error);
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
});

module.exports = router;
