const { Plan, sequelize } = require('./models');

async function seedPlans() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Monthly Plan
        const monthly = await Plan.findOne({ where: { name: 'Premium Monthly' } });
        if (!monthly) {
            await Plan.create({
                name: 'Premium Monthly',
                price: 59,
                duration_days: 30,
                is_active: true
            });
            console.log('Created Monthly Plan (59 THB)');
        } else {
            await monthly.update({ price: 59, duration_days: 30 });
            console.log('Updated Monthly Plan to 59 THB');
        }

        // Yearly Plan
        const yearly = await Plan.findOne({ where: { name: 'Premium Yearly' } });
        if (!yearly) {
            await Plan.create({
                name: 'Premium Yearly',
                price: 590,
                duration_days: 365,
                is_active: true
            });
            console.log('Created Yearly Plan (590 THB)');
        } else {
            await yearly.update({ price: 590, duration_days: 365 });
            console.log('Updated Yearly Plan to 590 THB');
        }

    } catch (error) {
        console.error('Seeding failed:', error);
    }
}

seedPlans();
