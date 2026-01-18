const { User } = require('../models');

async function checkConfig() {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'display_name', 'role', 'status']
        });
        
        console.log('--- User Roles Check ---');
        if (users.length === 0) {
            console.log('No users found in database.');
        } else {
            console.table(users.map(u => u.toJSON()));
        }
        console.log('------------------------');
        
    } catch (error) {
        console.error('Error checking users:', error);
    }
}

checkConfig();
