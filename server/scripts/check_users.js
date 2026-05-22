const { User } = require('../models');

async function checkUsers() {
    try {
        const users = await User.findAll();
        console.log('--- User List ---');
        if (users.length === 0) {
            console.log('No users found in database.');
        } else {
            users.forEach(user => {
                console.log(`ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Name: ${user.display_name}`);
            });
        }
        console.log('-----------------');
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

checkUsers();
