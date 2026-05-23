const { sequelize, RoomAsset } = require('./models');

async function checkAssets() {
    try {
        await sequelize.authenticate();
        const assets = await RoomAsset.findAll();
        console.log("Assets in DB:");
        assets.forEach(a => {
            console.log(`ID: ${a.id}, Name: ${a.name}, URL: ${a.url}, Type: ${a.type}`);
        });
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await sequelize.close();
    }
}

checkAssets();
