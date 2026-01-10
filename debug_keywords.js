const { Sequelize, DataTypes, Op } = require('sequelize');
const config = require('./server/config/config.json')['development'];
const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

const News = require('./server/models/News')(sequelize, DataTypes);

async function checkData() {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        console.log('Checking news since:', oneMonthAgo);

        const recentNews = await News.findAll({
            where: {
                published_at: {
                    [Op.gte]: oneMonthAgo
                }
            },
            attributes: ['id', 'title', 'keywords', 'published_at']
        });

        console.log(`Found ${recentNews.length} news items.`);
        recentNews.forEach(n => {
            console.log(`[${n.id}] ${n.title} | Keywords: ${n.keywords}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

checkData();
