const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const { sequelize, User } = require('./models');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // Create a test user
        const timestamp = Date.now();
        const user = await User.create({
            email: `test_ban_${timestamp}@example.com`,
            display_name: 'Test Ban User',
            status: 'active',
            password_hash: 'dummy'
        });

        console.log(`User created: ID=${user.id}, Status=${user.status}`);

        // Update status to banned
        user.status = 'banned';
        await user.save();

        console.log(`User object after save: Status=${user.status}`);

        // Re-fetch to verify DB state
        const refreshed = await User.findByPk(user.id);
        console.log(`User refetched from DB: Status=${refreshed.status}`);

        if (refreshed.status === 'banned') {
            console.log('SUCCESS: DB allows status update to "banned"');
        } else {
            console.error('FAILURE: Status did not update in DB');
        }

        // Clean up
        await user.destroy();
        console.log('Test user deleted');

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await sequelize.close();
    }
}

test();
