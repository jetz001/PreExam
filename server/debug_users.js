const fs = require('fs');
const { Op } = require('sequelize'); // Import Op

// Load models from index.js which handles connection
const db = require('./models');
const { User, ExamResult } = db;

async function checkUsers() {
    try {
        // Ensure DB connection
        await db.sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Sync not needed as we are reading

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { display_name: { [Op.like]: '%guest%' } },
                    { public_id: '28c35b92-0c01-4a7f-81f1-56930e72af8b' } // ID from screenshot
                ]
            },
            include: [{
                model: ExamResult,
                // attributes: ['id', 'score', 'total_questions', 'created_at'] // Let's get all fields just in case
            }],
            order: [['created_at', 'DESC']],
            limit: 20
        });

        let output = `Found ${users.length} users matching 'Guest-guest-17%'\n`;

        users.forEach(u => {
            output += `\nID: ${u.id}`;
            output += `\nCreated: ${u.created_at}`;
            output += `\nLast Active: ${u.last_active_at}`;
            output += `\nRole: ${u.role}`;
            output += `\nExam Results: ${u.ExamResults.length}`;
            u.ExamResults.forEach(r => {
                output += `\n  - Exam ${r.id}: ${r.score}/${r.total_questions} at ${r.created_at}`;
            });
            output += '\n-------------------';
        });

        fs.writeFileSync('debug_output.txt', output);

    } catch (e) {
        fs.writeFileSync('debug_output.txt', `Error: ${e.message}`);
    }
}

checkUsers();
