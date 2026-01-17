const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize } = require('./models');

// Explicitly load .env from current directory
const result = dotenv.config({ path: path.join(__dirname, '.env') });
if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('.env loaded successfully. Parsing STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Present' : 'Missing');
}

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev, restrict in prod
        methods: ["GET", "POST"]
    }
});

// Make io accessible globally or pass to routes
app.set('io', io);

// Socket Handler
const socketHandler = require('./socket/socketHandler');
socketHandler(io);

// Init Cron Jobs
require('./services/cronService')();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
});
// Stripe Webhook must be parsed as raw buffer BEFORE express.json
app.use(['/api/payments/webhook', '/payments/webhook'], express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const examRoutes = require('./routes/examRoutes');
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const friendRoutes = require('./routes/friendRoutes');
const roomRoutes = require('./routes/roomRoutes');
const assetRoutes = require('./routes/assetRoutes');
const publicRoutes = require('./routes/publicRoutes');

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/users', '/users'], userRoutes);
app.use(['/api/questions', '/questions'], questionRoutes);
app.use(['/api/exams', '/exams'], examRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);
app.use(['/api/payments', '/payments'], paymentRoutes);
app.use(['/api/reports', '/reports'], reportRoutes);
app.use(['/api/friends', '/friends'], friendRoutes);
app.use(['/api/rooms', '/rooms'], roomRoutes);
app.use(['/api/assets', '/assets'], assetRoutes);
app.use(['/api/bookmarks', '/bookmarks'], require('./routes/bookmarkRoutes'));
app.use(['/api/community', '/community'], require('./routes/communityRoutes'));
app.use(['/api/groups', '/groups'], require('./routes/studyGroupRoutes'));
app.use(['/api/messages', '/messages'], require('./routes/chatRoutes'));
app.use(['/api/public', '/public'], publicRoutes);
app.use(['/api/ads', '/ads'], require('./routes/adsRoutes'));
app.use('/api/business', require('./routes/businessRoutes')); // Learning Center
app.use(['/api/support', '/support'], require('./routes/supportRoutes'));
app.use(['/api/legal', '/legal'], require('./routes/legalRoutes'));


app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to PreExam API' });
});

// Health Check Endpoint for Uptime Kuma
app.get('/api/health', async (req, res) => {
    try {
        await sequelize.query('SELECT 1');
        const memory = process.memoryUsage();
        res.status(200).json({
            status: 'ok',
            uptime: process.uptime(),
            memory: memory.rss,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Health Check Failed:', error);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

// Serve Request static build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React Routing, return all requests to React app
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected!');
        // Sync models
        // Sync models
        // Sync models
        await sequelize.sync();

        // Manual column addition for SQLite stability (replacing flaky alter: true)
        try {
            await sequelize.query("ALTER TABLE threads ADD COLUMN image_url VARCHAR(255);");
            console.log("Added image_url column to threads table");
        } catch (err) {
            // Ignore error if column already exists
            if (!err.message.includes('duplicate column name')) {
                console.log("Column image_url likely exists or another error:", err.message);
            }
        }

        try {
            await sequelize.query("ALTER TABLE users ADD COLUMN avatar VARCHAR(255);");
            console.log("Added avatar column to users table");
        } catch (err) {
            if (!err.message.includes('duplicate column name')) {
                console.log("Column avatar likely exists or another error:", err.message);
            }
        }

        try {
            await sequelize.query("ALTER TABLE threads ADD COLUMN shared_news_id INTEGER;");
            console.log("Added shared_news_id column to threads table");
        } catch (err) {
            if (!err.message.includes('duplicate column name')) {
                console.log("Column shared_news_id likely exists or another error:", err.message);
            }
        }

        try {
            await sequelize.query("ALTER TABLE threads ADD COLUMN shared_business_post_id INTEGER;");
            console.log("Added shared_business_post_id column to threads table");
        } catch (err) {
            if (!err.message.includes('duplicate column name')) {
                console.log("Column shared_business_post_id likely exists or another error:", err.message);
            }
        }

        // New User Profile Columns
        const newColumns = [
            "ADD COLUMN bio TEXT",
            "ADD COLUMN phone_number VARCHAR(255)",
            "ADD COLUMN target_exam VARCHAR(255)",
            "ADD COLUMN target_exam_date DATETIME",
            "ADD COLUMN streak_count INTEGER DEFAULT 0",
            "ADD COLUMN last_active_at DATETIME",
            "ADD COLUMN is_public_stats BOOLEAN DEFAULT 1",
            "ADD COLUMN is_online_visible BOOLEAN DEFAULT 1",
            "ADD COLUMN allow_friend_request BOOLEAN DEFAULT 1",
            "ADD COLUMN notify_study_group BOOLEAN DEFAULT 1",
            "ADD COLUMN notify_friend_request BOOLEAN DEFAULT 1",
            "ADD COLUMN notify_news_update BOOLEAN DEFAULT 1",
            "ADD COLUMN theme_preference VARCHAR(20) DEFAULT 'system'",
            "ADD COLUMN font_size_preference VARCHAR(20) DEFAULT 'medium'",
            "ADD COLUMN xp_points INTEGER DEFAULT 0",
            "ADD COLUMN rank_level VARCHAR(50) DEFAULT 'Newbie'",
            "ADD COLUMN mistake_history TEXT",
            "ADD COLUMN business_name VARCHAR(255)",
            "ADD COLUMN tax_id VARCHAR(50)",
            "ADD COLUMN wallet_balance DECIMAL(10, 2) DEFAULT 0.00"
        ];

        // Manual updates for Study Groups
        const studyGroupColumns = [
            "ADD COLUMN subject VARCHAR(255)",
            "ADD COLUMN max_members INTEGER DEFAULT 10",
            "ADD COLUMN is_private BOOLEAN DEFAULT 0",
            "ADD COLUMN password VARCHAR(255)"
        ];

        for (const col of studyGroupColumns) {
            try {
                await sequelize.query(`ALTER TABLE study_groups ${col};`);
                console.log(`Executed: ALTER TABLE study_groups ${col}`);
            } catch (err) {
                // Ignore if already exists
            }
        }

        // Room Customization
        try {
            await sequelize.query("ALTER TABLE rooms ADD COLUMN theme_color VARCHAR(50);");
            console.log("Added theme_color column to rooms table");
        } catch (err) {
            if (!err.message.includes('duplicate column name')) {
                // console.log("Column likely exists:", err.message);
            }
        }

        try {
            await sequelize.query("ALTER TABLE rooms ADD COLUMN background_url VARCHAR(255);");
            console.log("Added background_url column to rooms table");
        } catch (err) {
            if (!err.message.includes('duplicate column name')) {
                // console.log("Column likely exists:", err.message);
            }
        }

        try {
            await sequelize.query("ALTER TABLE questions ADD COLUMN skill VARCHAR(255);");
            console.log("Added skill column to questions table");
        } catch (err) {
            if (!err.message.includes('duplicate column name')) {
                // console.log("Column likely exists:", err.message);
            }
        }

        try {
            await sequelize.query("ALTER TABLE exam_results ADD COLUMN skill_scores TEXT;");
            console.log("Added skill_scores column to exam_results table");
        } catch (err) {
            if (!err.message.includes('duplicate column name')) {
                // console.log("Column likely exists:", err.message);
            }
        }

        try {
            await sequelize.query("ALTER TABLE questions ADD COLUMN catalogs TEXT;"); // Store JSON as TEXT in SQLite/MySQL if JSON type varies
            console.log("Added catalogs column to questions table");
        } catch (err) {
            if (!err.message.includes('duplicate column name')) {
                // console.log("Column likely exists:", err.message);
            }
        }

        try {
            await sequelize.query("ALTER TABLE questions ADD COLUMN exam_year INTEGER;");
            console.log("Added exam_year column to questions table");
        } catch (err) {
            if (!err.message.includes('duplicate column name')) {
                // console.log("Column likely exists:", err.message);
            }
        }

        try {
            await sequelize.query("ALTER TABLE questions ADD COLUMN exam_set VARCHAR(50);");
            console.log("Added exam_set column to questions table");
        } catch (err) {
            if (!err.message.includes('duplicate column name')) {
                // console.log("Column likely exists:", err.message);
            }
        }

        // --- Ad System Migrations ---
        try {
            await sequelize.query("ALTER TABLE users ADD COLUMN plan_type VARCHAR(20) DEFAULT 'free';");
            console.log("Added plan_type column to users table");
        } catch (err) {
            // Ignore if exists
        }

        try {
            await sequelize.query("ALTER TABLE users ADD COLUMN premium_expiry DATETIME;");
            console.log("Added premium_expiry column to users table");
        } catch (err) {
            // Ignore if exists
        }

        try {
            await sequelize.query("ALTER TABLE ads ADD COLUMN link_url VARCHAR(255);");
            console.log("Added link_url column to ads table");
        } catch (err) {
            // Ignore if exists
        }
        try {
            await sequelize.query("ALTER TABLE ads ADD COLUMN image_url VARCHAR(255);");
            console.log("Added image_url column to ads table");
        } catch (err) {
            // Ignore
        }

        try {
            await sequelize.query("ALTER TABLE users ADD COLUMN premium_start_date DATETIME;");
            console.log("Added premium_start_date column to users table");
        } catch (err) {
            // Ignore if exists
        }

        try {
            await sequelize.query("ALTER TABLE BusinessPosts ADD COLUMN ad_status VARCHAR(20) DEFAULT 'pending';");
            console.log("Added ad_status column to BusinessPosts table");
        } catch (err) {
            // Ignore
        }

        try {
            await sequelize.query("ALTER TABLE Businesses ADD COLUMN verification_documents TEXT;");
            console.log("Added verification_documents column to Businesses table");
        } catch (err) {
            // Ignore
        }

        try {
            await sequelize.query("ALTER TABLE Businesses ADD COLUMN verification_status VARCHAR(20) DEFAULT 'unverified';");
            console.log("Added verification_status column to Businesses table");
        } catch (err) {
            // Ignore
        }

        for (const col of newColumns) {
            try {
                await sequelize.query(`ALTER TABLE users ${col};`);
                console.log(`Executed: ALTER TABLE users ${col}`);
            } catch (err) {
                if (!err.message.includes('duplicate column name')) {
                    // console.log("Column likely exists:", err.message);
                }
            }
        }

        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT} (0.0.0.0)`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = app;
