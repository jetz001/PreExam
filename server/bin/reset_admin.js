const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');
const fs = require('fs');

async function resetAdmin() {
    let output = '';
    try {
        await sequelize.authenticate();
        output += 'Database connected.\n';

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash('admin1234', salt);

        const [admin, created] = await User.findOrCreate({
            where: { email: 'admin@preexam.com' },
            defaults: {
                password_hash,
                display_name: 'Super Admin',
                role: 'admin',
                plan_type: 'premium'
            }
        });

        if (created) {
            output += 'New admin created: admin@preexam.com / admin1234\n';
        } else {
            admin.password_hash = password_hash;
            admin.role = 'admin'; // Ensure role is admin
            await admin.save();
            output += 'Existing admin updated: admin@preexam.com / admin1234\n';
        }

        fs.writeFileSync('admin_reset_status.txt', output);
        console.log('Done');
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('admin_reset_status.txt', `Error: ${e.message}\n${e.stack}`);
        process.exit(1);
    }
}

resetAdmin();
