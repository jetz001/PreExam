const { sequelize, Plan } = require('../models');

const seedPlans = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const plans = [
            {
                name: 'Premium Monthly',
                price: 59.00,
                duration_days: 30,
                description: 'Full access to all features for 30 days.',
                is_active: true
            },
            {
                name: 'Premium Yearly',
                price: 590.00,
                duration_days: 365,
                description: 'Full access to all features for 365 days. (Save 2 months!)',
                is_active: true
            }
        ];

        for (const plan of plans) {
            const [p, created] = await Plan.findOrCreate({
                where: { name: plan.name },
                defaults: plan
            });
            if (created) {
                console.log(`Created plan: ${plan.name}`);
            } else {
                console.log(`Plan exists: ${plan.name}`);
            }
        }

        console.log('Seeding complete.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedPlans();
