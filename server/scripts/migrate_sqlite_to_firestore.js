const { db: firestore } = require('../config/firebase');
const db = require('../models');

async function migrateUsers() {
    console.log('Migrating Users...');
    const users = await db.User.findAll({ raw: true });
    let count = 0;
    const batchSize = 400;
    
    for (let i = 0; i < users.length; i += batchSize) {
        const batch = firestore.batch();
        const chunk = users.slice(i, i + batchSize);
        
        for (const user of chunk) {
            const docRef = firestore.collection('users').doc(user.id.toString());
            // Convert Date objects if necessary, Firestore handles Date natively but JSON fields might need parsing
            if (typeof user.mistake_history === 'string') {
                try { user.mistake_history = JSON.parse(user.mistake_history); } catch(e) { user.mistake_history = []; }
            }
            if (typeof user.admin_permissions === 'string') {
                try { user.admin_permissions = JSON.parse(user.admin_permissions); } catch(e) { user.admin_permissions = []; }
            }
            if (typeof user.business_info === 'string') {
                try { user.business_info = JSON.parse(user.business_info); } catch(e) { user.business_info = null; }
            }
            batch.set(docRef, { ...user });
        }
        await batch.commit();
        count += chunk.length;
        console.log(`Migrated ${count} users...`);
    }
    console.log(`Total migrated users: ${users.length}`);
}

async function migrateQuestions() {
    console.log('Migrating Questions...');
    const questions = await db.Question.findAll({ raw: true });
    let count = 0;
    const batchSize = 400;
    
    for (let i = 0; i < questions.length; i += batchSize) {
        const batch = firestore.batch();
        const chunk = questions.slice(i, i + batchSize);
        
        for (const q of chunk) {
            const docRef = firestore.collection('questions').doc(q.id.toString());
            // Parse JSON fields
            if (typeof q.catalogs === 'string') {
                try { q.catalogs = JSON.parse(q.catalogs); } catch(e) { q.catalogs = []; }
            }
            batch.set(docRef, { ...q });
        }
        await batch.commit();
        count += chunk.length;
        console.log(`Migrated ${count} questions...`);
    }
    console.log(`Total migrated questions: ${questions.length}`);
}

async function run() {
    try {
        console.log('Starting Migration to Firestore...');
        await migrateUsers();
        await migrateQuestions();
        console.log('Migration Phase 1 Completed Successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

run();
