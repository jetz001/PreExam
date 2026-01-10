const db = require('./models');

async function checkAssociations() {
    try {
        console.log('Checking associations for Thread...');

        const threadAssoc = db.Thread.associations;
        const assocNames = Object.keys(threadAssoc);
        console.log('Thread associations:', assocNames);

        if (!threadAssoc.User) console.error('FAIL: Thread -> User missing');
        if (!threadAssoc.InterestTags) console.error('FAIL: Thread -> InterestTags missing'); // check naming
        if (!threadAssoc.Comments) console.error('FAIL: Thread -> Comments missing'); // check naming
        if (!threadAssoc.Poll) console.error('FAIL: Thread -> Poll missing');

        console.log('Checking associations for Poll...');
        const pollAssoc = db.Poll.associations;
        console.log('Poll associations:', Object.keys(pollAssoc));
        if (!pollAssoc.Options) console.error('FAIL: Poll -> Options (as Options) missing');

        process.exit(0);
    } catch (error) {
        console.error('Error checking associations:', error);
        process.exit(1);
    }
}

checkAssociations();
