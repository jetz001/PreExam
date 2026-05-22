const { sequelize, User, Question, News, Thread } = require('../models');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected!');

        // Force sync to clear db
        await sequelize.sync({ force: true });
        console.log('Database synced!');

        // Create Admin
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || 'admin1234', salt);

        await User.create({
            email: 'admin@preexam.com',
            password_hash,
            display_name: 'Super Admin',
            role: 'admin',
            plan_type: 'premium',
        });
        console.log('Admin created!');

        // Create Demo Questions
        const questions = [
            {
                question_text: 'ข้อใดคือเมืองหลวงของประเทศไทย?',
                choice_a: 'เชียงใหม่',
                choice_b: 'กรุงเทพมหานคร',
                choice_c: 'ภูเก็ต',
                choice_d: 'ขอนแก่น',
                correct_answer: 'B',
                explanation: 'กรุงเทพมหานครเป็นเมืองหลวงของประเทศไทย',
                category: 'local_gov',
                subject: 'thai',
                difficulty: 10,
            },
            {
                question_text: '1 + 1 เท่ากับเท่าไหร่?',
                choice_a: '1',
                choice_b: '2',
                choice_c: '3',
                choice_d: '4',
                correct_answer: 'B',
                explanation: '1 บวก 1 เท่ากับ 2',
                category: 'ocsc',
                subject: 'math',
                difficulty: 5,
            },
            // Add more demo questions here
        ];

        await Question.bulkCreate(questions);
        console.log('Questions seeded!');

        // Create Demo News
        await News.create({
            title: 'ประกาศวันสอบท้องถิ่น 2567',
            content: 'รายละเอียดการสอบท้องถิ่นประจำปี 2567...',
            image_url: 'https://via.placeholder.com/300',
        });
        console.log('News seeded!');

        // Create Demo Threads
        await Thread.create({
            user_id: 1, // Admin
            title: 'ยินดีต้อนรับสู่ PreExam',
            content: 'พื้นที่สำหรับพูดคุยแลกเปลี่ยนความรู้...',
            category: 'general',
        });
        console.log('Threads seeded!');

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
