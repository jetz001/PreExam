const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const adminController = require('./controllers/adminController');
const { sequelize, User } = require('./models');

async function testController() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // Create user
        const user = await User.create({
            email: 'test_controller_' + Date.now() + '@example.com',
            display_name: 'Controller Test',
            status: 'active',
            password_hash: 'dummy'
        });

        console.log(`Created user ${user.id} with status ${user.status}`);

        // Mock Req/Res
        const req = {
            params: { id: user.id },
            body: { status: 'banned' }
        };

        const res = {
            json: (data) => {
                console.log('Response JSON received');
                if (data.user && data.user.status === 'banned') {
                    console.log('CONTROLLER SUCCESS: Response user status is banned');
                } else {
                    console.log('CONTROLLER FAILURE: Response user status is', data.user ? data.user.status : 'undefined');
                }
            },
            status: (code) => {
                console.log('Response Status:', code);
                return {
                    json: (d) => console.log('Error JSON:', d)
                };
            }
        };

        console.log('Calling updateUserStatus...');
        await adminController.updateUserStatus(req, res);

        // Verify DB
        const refreshed = await User.findByPk(user.id);
        console.log('DB Verification Status:', refreshed.status);

        await user.destroy();

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

testController();
