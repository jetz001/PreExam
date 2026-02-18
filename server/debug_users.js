const fs = require('fs');
const { Sequelize, DataTypes, Op } = require('sequelize'); // Import Op

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db_production.sqlite',
    logging: false // Disable SQL logging
});

const User = require('./models/User')(sequelize, DataTypes);
const ExamResult = require('./models/ExamResult')(sequelize, DataTypes);

// Setup associations
User.hasMany(ExamResult, { foreignKey: 'user_id' });
ExamResult.belongsTo(User, { foreignKey: 'user_id' });

async function checkUsers() {
    try {
        // Ensure DB connection
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Sync not needed as we are reading

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { public_id: '28c35b92-0c01-4a7f-81f1-56930e72af8b' },
                    { display_name: 'Guest-guest-17' }
                ]
            },
            include: [{
                model: ExamResult,
            }],
            order: [['created_at', 'DESC']]
        });

        let output = `Found ${users.length} users\n`;

        users.forEach(u => {
            output += `\nID: ${u.id}`;
            output += `\nPublic ID: ${u.public_id}`;
            output += `\nDisplay Name: ${u.display_name}`;
            output += `\nEmail: ${u.email}`;
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
