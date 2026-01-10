const { Question, sequelize } = require('./server/models');

const seedQuestion = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const question = await Question.create({
            question_text: 'Which of the following implies "Critical Thinking"?',
            choice_a: 'Accepting everything as true',
            choice_b: 'Analyzing facts to form a judgment',
            choice_c: 'Memorizing without understanding',
            choice_d: 'Guessing randomly',
            correct_answer: 'B',
            subject: 'General',
            category: 'General',
            skill: 'Critical Thinking',
            catalogs: ['General'],
            explanation: 'Critical thinking is the objective analysis and evaluation of an issue in order to form a judgment.',
            difficulty: 50
        });

        console.log(`Question created with ID: ${question.id} and Skill: ${question.skill}`);
    } catch (error) {
        console.error('Error seeding question:', error);
    } finally {
        await sequelize.close();
    }
};

seedQuestion();
