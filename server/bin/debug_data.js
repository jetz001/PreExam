const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Setup Sequelize (assuming sqlite)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
});

const Room = require('./models/Room')(sequelize, DataTypes);
const RoomAsset = require('./models/RoomAsset')(sequelize, DataTypes);

async function debugData() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const rooms = await Room.findAll();
        console.log('--- ROOMS (with themes) ---');
        rooms.forEach((r, i) => {
            if (r.theme) {
                console.log(`\nRoom [${r.id}] ${r.name}`);
                console.log(`Theme Type: ${typeof r.theme}`);
                console.log(`Theme Content: ${typeof r.theme === 'string' ? r.theme : JSON.stringify(r.theme)}`);
            }
        });

        const asset1 = await RoomAsset.findByPk(1);
        if (asset1) {
            console.log('\n--- ASSET 1 ---');
            console.log(`ID: ${asset1.id}`);
            console.log(`URL: ${asset1.url}`);

            // Check if file exists
            const fs = require('fs');
            // Extract filename from URL
            let filename;
            if (asset1.url.includes('/uploads/')) {
                filename = asset1.url.split('/uploads/')[1];
            }
            if (filename) {
                const filePath = path.join(__dirname, 'uploads', filename);
                console.log(`File Path: ${filePath}`);
                console.log(`File Exists: ${fs.existsSync(filePath)}`);
            } else {
                console.log('Could not parse filename from URL');
            }
        } else {
            console.log('\nAsset 1 not found');
        }

        const allAssets = await RoomAsset.findAll({ limit: 5, order: [['id', 'DESC']] });
        console.log('\n--- LATEST 5 ASSETS ---');
        allAssets.forEach(a => {
            console.log(`[${a.id}] ${a.url}`);
        });

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

debugData();
