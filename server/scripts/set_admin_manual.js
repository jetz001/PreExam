const { User, sequelize } = require('../models');

async function setAdmin() {
    try {
        const publicId = '4271a589-1479-48d6-837f-3ce57b5c0bcd';
        const user = await User.findOne({ where: { public_id: publicId } });
        
        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log(`Found user: ${user.display_name} (${user.email})`);
        console.log(`Current Role: ${user.role}`);

        user.role = 'admin';
        user.admin_permissions = [
            'manage_users', 
            'manage_exams', 
            'manage_business', 
            'manage_finance', 
            'manage_content', 
            'manage_settings', 
            'view_logs'
        ];
        
        await user.save();
        
        console.log('-----------------------------------');
        console.log('User role updated to ADMIN successfully.');
        console.log(`New Role: ${user.role}`);
        console.log('Permissions:', user.admin_permissions);
        console.log('-----------------------------------');

    } catch (error) {
        console.error('Error setting admin:', error);
    } finally {
        await sequelize.close();
    }
}

setAdmin();
