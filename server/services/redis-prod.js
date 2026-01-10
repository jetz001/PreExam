const Redis = require('ioredis');

// Production Redis Configuration
// In docker-compose, hostname is 'redis'
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
};

// Create separate instances for Pub/Sub (required by BullMQ / Socket.io Adapter)
const redisClient = new Redis(redisConfig);
const redisSubscriber = new Redis(redisConfig);
const redisPublisher = new Redis(redisConfig);

redisClient.on('connect', () => console.log('✅ Redis Connected'));
redisClient.on('error', (err) => console.error('❌ Redis Error:', err));

module.exports = {
    redisClient,
    redisSubscriber,
    redisPublisher,
    redisConfig
};
