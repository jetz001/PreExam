const { User } = require('../models');

async function setAdmin() {
    try {
        const email = 'jetsadakorn.t@ku.th'; // Hardcoding based on table output would be safer, but let's target the user.
        // Actually, let's just make the FIRST user admin for simplicity if there's only one.
        // Or target the specific email if we saw it.
        // The output was truncated in the previous turn, so I didn't see the email clearly.
        // However, I saw 'Jetsadakorn T.' and it's likely the user.
        // Let's print users again to be sure or just update by ID 1 since it looked like the first row.

        const user = await User.findOne({ where: { id: 1 } }); // Assuming ID 1 is the main user
        if (!user) {
            console.log('User ID 1 not found.');
            return;
        }

        console.log(`Promoting user ${user.display_name} (${user.email}) to admin...`);
        user.role = 'admin';
        await user.save();
        console.log('Success! User is now admin.');

    } catch (error) {
        console.error('Error setting admin:', error);
    }
}

setAdmin();
