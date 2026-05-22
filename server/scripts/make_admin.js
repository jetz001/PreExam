require('dotenv').config();
const { User } = require('../models');

async function makeAdmin(email) {
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        const oldRole = user.role;
        user.role = 'admin';
        await user.save();
        console.log(`User ${email} role updated from '${oldRole}' to 'admin'.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating user:', error);
        process.exit(1);
    }
}

makeAdmin('jimwar02@gmail.com');
