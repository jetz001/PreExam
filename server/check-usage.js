require('dotenv').config();
const { db } = require('./config/firebase');

async function run() {
    const configsDoc = await db.collection('system_settings').doc('animation_asset_configs').get();
    const usageDoc = await db.collection('system_settings').doc('animation_usage_map').get();
    
    let usageMap = {};
    if (usageDoc.exists) {
        usageMap = usageDoc.data().value || {};
    }
    
    let assetConfigs = {};
    if (configsDoc.exists) {
        assetConfigs = configsDoc.data().value || {};
    }

    const skipFirstKeys = usageMap['examSkipFirstAnswer'] || [];
    console.log('Keys for examSkipFirstAnswer:', skipFirstKeys);
    
    for (const key of skipFirstKeys) {
        const config = assetConfigs[key];
        if (config) {
            console.log(`Asset ${key} has url? ${!!config.animationUrl}`);
            if (config.animationUrl) {
                console.log(`URL prefix: ${config.animationUrl.substring(0, 30)}...`);
            }
        } else {
            console.log(`Asset ${key} has NO config!`);
        }
    }
}

run().then(() => process.exit(0)).catch(console.error);
