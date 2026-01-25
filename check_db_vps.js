const { RoomAsset } = require('./models');
(async () => {
    try {
        const assets = await RoomAsset.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']]
        });
        console.log(JSON.stringify(assets, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();
