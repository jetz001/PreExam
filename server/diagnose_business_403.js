const { Business, User } = require('./models');

async function diagnose() {
    try {
        console.log('--- Diagnosis Start ---');
        // Check User 1
        const userId = 1;
        const user = await User.findByPk(userId);
        if (!user) {
            console.log(`User ${userId} NOT FOUND`);
        } else {
            console.log(`User ${userId} FOUND. Role: ${user.role}, Email: ${user.email}`);
        }

        // Check All Businesses
        const businesses = await Business.findAll();
        console.log(`Found ${businesses.length} businesses.`);

        businesses.forEach(b => {
            console.log(`Business ID: ${b.id}, Name: ${b.name}, Owner UID: ${b.owner_uid} (Type: ${typeof b.owner_uid})`);
            if (b.owner_uid == userId) {
                console.log(`-> MATCH: User ${userId} is owner of Business ${b.id}`);
            } else {
                console.log(`-> NO MATCH: User ${userId} is NOT owner of Business ${b.id}`);
            }
        });

        console.log('--- Diagnosis End ---');
    } catch (error) {
        console.error('Diagnosis Error:', error);
    }
}

diagnose();
