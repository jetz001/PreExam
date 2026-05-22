const { SearchLog, Thread } = require('../models');

async function check() {
    try {
        console.log('Checking SearchLog...');
        if (SearchLog) {
            console.log('SearchLog model loaded successfully.');
        } else {
            console.error('SearchLog model is UNDEFINED.');
        }

        console.log('Checking Thread...');
        const threads = await Thread.findAll({ limit: 1 });
        console.log(`Threads found: ${threads.length}`);

    } catch (error) {
        console.error('Error during check:', error);
    }
}

check();
