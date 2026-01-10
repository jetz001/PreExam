const { sequelize, Question } = require('./models');

async function checkSubjects() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const questions = await Question.findAll({
            attributes: ['subject', 'skill', 'category']
        });

        const subjectSet = new Set();
        const existingSkills = new Set();

        questions.forEach(q => {
            if (q.subject) subjectSet.add(q.subject);
            if (q.skill) existingSkills.add(q.skill);
        });

        console.log('--- Unique Subjects ---');
        console.log(Array.from(subjectSet));

        console.log('\n--- Existing Skills ---');
        console.log(Array.from(existingSkills));

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

checkSubjects();
