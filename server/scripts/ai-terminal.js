const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const aiGeneratorService = require('../services/aiGeneratorService');

// Simple CLI tool to interact with the AI Generator
const main = async () => {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("\n--- PreExam AI Terminal ---");
        console.log("Usage: node scripts/ai-terminal.js \"Your Prompt Here\"");
        console.log("Example: node scripts/ai-terminal.js \"สร้างข้อสอบวิชาภาษาไทย เรื่องคำราชาศัพท์ 1 ข้อ พร้อมเฉลย\"\n");
        process.exit(0);
    }

    const customPrompt = args.join(' ');
    console.log(`\n>>> Sending Prompt to AI: "${customPrompt}"`);
    console.log(">>> Please wait...\n");

    try {
        // We call runGenerator with the custom prompt
        // This will handle the API call, validation, and saving to DB
        await aiGeneratorService.runGenerator(customPrompt);
        
        console.log("\n>>> Execution Completed Successfully!");
        console.log(">>> The question has been saved to your database as a draft.");
        console.log(">>> You can check it in the Admin Panel -> Question Bank.\n");
        process.exit(0);
    } catch (error) {
        console.error(`\n>>> Error occurred: ${error.message}`);
        process.exit(1);
    }
};

main();
