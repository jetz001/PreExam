require('dotenv').config();
const aiProviderFactory = require('../services/aiProviderFactory');
const aiGeneratorService = require('../services/aiGeneratorService');

async function testProviders() {
    const providers = ['google', 'deepseek', 'openai'];
    
    for (const p of providers) {
        console.log(`\n--- Testing Provider: ${p} ---`);
        const success = aiProviderFactory.setProvider(p);
        if (!success) {
            console.error(`Failed to set provider: ${p}`);
            continue;
        }

        try {
            console.log(`Generating with ${p}... (Please wait)`);
            const question = await aiGeneratorService.generateExamQuestion("ภาษาไทย", "ไม่มีประวัติ");
            console.log(`✅ Success with ${p}!`);
            console.log(`Question: ${question.question_text.substring(0, 50)}...`);
        } catch (error) {
            console.error(`❌ Failed with ${p}:`, error.message);
        }
    }
}

testProviders();
