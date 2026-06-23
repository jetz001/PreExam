const db = require('./models');

async function syncArcade() {
    try {
        await db.ArcadeGame.sync({ alter: true });
        console.log("ArcadeGame table synced.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

syncArcade();
