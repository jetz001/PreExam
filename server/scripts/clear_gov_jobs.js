const { News } = require('../models');

async function main() {
    try {
        const count = await News.destroy({ where: { category: 'งานราชการ' } });
        console.log(`Deleted ${count} old gov jobs.`);
    } catch (e) {
        console.error(e);
    }
}
main();
