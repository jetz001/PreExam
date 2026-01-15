const { Question, Sequelize } = require('./models');
const Op = Sequelize.Op;

async function debug() {
    try {
        const subject = 'ท้องถิ่น ภาค ก';
        const category = 'ภาษาอังกฤษ';

        console.log(`Checking for Subject: "${subject}", Category: "${category}"`);

        // 1. Check if Subject exists
        const countSubj = await Question.count({
            where: { subject: { [Op.like]: `%${subject}%` } }
        });
        console.log(`Questions with Subject "${subject}": ${countSubj}`);

        // 2. Check if Category exists in that Subject (Manual Iteration like getCategories)
        const allQuestions = await Question.findAll({
            where: { subject: { [Op.like]: `%${subject}%` } },
            attributes: ['id', 'category', 'catalogs']
        });

        let foundInLoop = false;
        allQuestions.forEach(q => {
            if ((q.category && q.category.includes(category)) ||
                (q.catalogs && JSON.stringify(q.catalogs).includes(category))) {
                foundInLoop = true;
                // console.log(`Found match in Q#${q.id}: Cat="${q.category}", Cats="${JSON.stringify(q.catalogs)}"`);
            }
        });
        console.log(`Found specific category manual match in subject? ${foundInLoop}`);

        // 3. Check Actual Query Logic
        const where = {};
        where.subject = { [Op.like]: `%${subject}%` };
        where[Op.or] = [
            { category: { [Op.like]: `%${category}%` } },
            { catalogs: { [Op.like]: `%${category}%` } }
        ];

        const queryCount = await Question.count({ where });
        console.log(`Questions matching BOTH query logic: ${queryCount}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

debug();
