const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');
const fs = require('fs');

async function findAdmin() {
    try {
        await sequelize.authenticate();
        const admins = await User.findAll({ where: { role: 'admin' } });
        let output = `Found ${admins.length} admins:\n`;
        admins.forEach(a => {
            output += `- Email: ${a.email}, ID: ${a.id}, DisplayName: ${a.display_name}\n`;
        });

        // If no admin, or user wants to reset, we can do it here.
        // For now just list.
        fs.writeFileSync('admin_find_result.txt', output);
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('admin_find_result.txt', `Error: ${e.message}`);
        process.exit(1);
    }
}

findAdmin();
