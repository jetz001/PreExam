const { User, Business } = require('./models');

async function check() {
    try {
        const userCount = await User.count();
        const businessCount = await Business.count();
        console.log(`DATA_CHECK_RESULT: Users=${userCount}, Businesses=${businessCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
}

check();
