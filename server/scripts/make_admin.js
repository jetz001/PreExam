const { sequelize, User } = require('../models');

const makeAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address.');
        console.log('Usage: node scripts/make_admin.js <email>');
        process.exit(1);
    }

    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.error(`User with email "${email}" not found.`);
            process.exit(1);
        }

        if (user.role === 'admin') {
            console.log(`User "${user.display_name}" (${email}) is already an ADMIN.`);
            process.exit(0);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Successfully updated user "${user.display_name}" (${email}) to ADMIN role.`);
    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await sequelize.close();
    }
};

makeAdmin();
