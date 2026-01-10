require('dotenv').config();
const { Worker } = require('bullmq');
const { redisConfig } = require('./services/redis-prod');

// Database Import (Assuming we use the same models)
const db = require('./models');

// Worker Implementation
const startWorker = async () => {
    console.log('🚀 Worker Service Starting...');

    // 1. Exam Submission Processor
    const examWorker = new Worker('exam-submission', async (job) => {
        console.log(`[${job.id}] Processing Exam Submission for User: ${job.data.userId}`);

        // Simulation: Calculate Score
        // In real V2, we would query DB, grade answers, and update UserRankingStats
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log(`[${job.id}] Grading Complete. Score: ${job.data.score}`);
        return { status: 'graded', score: job.data.score };
    }, { connection: redisConfig });

    // 2. Notification Sender
    const notificationWorker = new Worker('notifications', async (job) => {
        console.log(`[${job.id}] Sending Notification to: ${job.data.target} Msg: ${job.data.message}`);
        // Logic to push notification via Socket or Push Service
    }, { connection: redisConfig });

    examWorker.on('completed', (job) => {
        console.log(`✅ Job ${job.id} has completed!`);
    });

    examWorker.on('failed', (job, err) => {
        console.error(`❌ Job ${job.id} has failed with ${err.message}`);
    });
};

// Connect DB then Start
db.sequelize.authenticate()
    .then(() => {
        console.log('Database connected for Worker');
        startWorker();
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
