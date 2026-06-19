const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Explicitly load .env from current directory
const result = dotenv.config({ path: path.join(__dirname, '.env') });
if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('.env loaded successfully. Parsing STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Present' : 'Missing');
}

const http = require('http');
const { Server } = require('socket.io');
const { WebSocketServer, WebSocket } = require('ws');
const { db: firestore } = require('./config/firebase');

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
const WORKER_API_BASE = String(process.env.WORKER_API_BASE || '').trim().replace(/\/+$/, '');
const SOLO_FLOW_USE_WORKER = ['1', 'true', 'yes', 'on'].includes(String(process.env.SOLO_FLOW_USE_WORKER || '').trim().toLowerCase()) && Boolean(WORKER_API_BASE);

const shouldProxySoloPath = (pathname = '') => {
    if (!SOLO_FLOW_USE_WORKER) return false;
    return (
        pathname === '/api/auth/register' ||
        pathname === '/api/auth/login' ||
        pathname === '/api/auth/guest' ||
        pathname === '/api/auth/me' ||
        pathname === '/api/questions' ||
        pathname === '/api/questions/subjects' ||
        pathname === '/api/questions/years' ||
        pathname === '/api/questions/sets' ||
        pathname === '/api/questions/categories' ||
        pathname.startsWith('/api/questions/') ||
        pathname.startsWith('/api/exams') ||
        pathname.startsWith('/api/rooms') ||
        pathname.startsWith('/api/ws')
    );
};

const toWorkerUrl = (requestPath) => new URL(requestPath, `${WORKER_API_BASE}/`).toString();

const copyProxyHeaders = (req, { websocket = false } = {}) => {
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];
    delete headers['accept-encoding'];

    if (!websocket) {
        delete headers.connection;
        delete headers.upgrade;
        delete headers['sec-websocket-key'];
        delete headers['sec-websocket-version'];
        delete headers['sec-websocket-extensions'];
        delete headers['sec-websocket-protocol'];
    }

    headers['x-forwarded-host'] = req.headers.host || '';
    headers['x-forwarded-proto'] = req.protocol || 'http';
    return headers;
};

const soloFlowProxy = async (req, res, next) => {
    if (!shouldProxySoloPath(req.path) || req.path.startsWith('/api/ws')) {
        return next();
    }

    try {
        const headers = copyProxyHeaders(req);
        let body;
        if (!['GET', 'HEAD'].includes(req.method)) {
            if (Buffer.isBuffer(req.body)) {
                body = req.body;
            } else if (typeof req.body === 'string') {
                body = req.body;
            } else if (req.body && Object.keys(req.body).length > 0) {
                body = JSON.stringify(req.body);
                if (!headers['content-type']) {
                    headers['content-type'] = 'application/json';
                }
            }
        }

        const upstream = await fetch(toWorkerUrl(req.originalUrl), {
            method: req.method,
            headers,
            body,
            redirect: 'manual'
        });

        res.status(upstream.status);
        upstream.headers.forEach((value, key) => {
            const lower = key.toLowerCase();
            if (['content-length', 'transfer-encoding', 'connection', 'content-encoding'].includes(lower)) return;
            res.setHeader(key, value);
        });

        const buffer = Buffer.from(await upstream.arrayBuffer());
        res.send(buffer);
    } catch (error) {
        console.error('Worker solo-flow proxy error:', error);
        next(error);
    }
};

const wsProxyServer = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
    let pathname = '';
    try {
        pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
    } catch (error) {
        pathname = '';
    }

    if (!shouldProxySoloPath(pathname) || !pathname.startsWith('/api/ws')) {
        return;
    }

    wsProxyServer.handleUpgrade(req, socket, head, (clientSocket) => {
        const targetUrl = toWorkerUrl(req.url).replace(/^http/i, 'ws');
        const upstreamSocket = new WebSocket(targetUrl, {
            headers: copyProxyHeaders(req, { websocket: true })
        });

        const closeBoth = () => {
            try { clientSocket.close(); } catch (e) {}
            try { upstreamSocket.close(); } catch (e) {}
        };

        clientSocket.on('message', (data, isBinary) => {
            if (upstreamSocket.readyState === WebSocket.OPEN) {
                upstreamSocket.send(data, { binary: isBinary });
            }
        });

        upstreamSocket.on('message', (data, isBinary) => {
            if (clientSocket.readyState === WebSocket.OPEN) {
                clientSocket.send(data, { binary: isBinary });
            }
        });

        clientSocket.on('close', closeBoth);
        clientSocket.on('error', closeBoth);
        upstreamSocket.on('close', closeBoth);
        upstreamSocket.on('error', (error) => {
            console.error('Worker WS proxy error:', error);
            closeBoth();
        });
    });
});

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
app.use(soloFlowProxy);

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
const scraperRoutes = require('./routes/scraperRoutes');
const examGeneratorRoutes = require('./routes/examGeneratorRoutes');
const terminalRoutes = require('./routes/terminalRoutes');

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/users', '/users'], userRoutes);
app.use(['/api/questions', '/questions'], questionRoutes);
app.use(['/api/exams', '/exams'], examRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/generator', examGeneratorRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/admin', adminRoutes);
app.use(['/api/payments', '/payments'], paymentRoutes);
app.use(['/api/reports', '/reports'], reportRoutes);
app.use(['/api/friends', '/friends'], friendRoutes);
app.use(['/api/rooms', '/rooms'], roomRoutes);
app.use(['/api/assets', '/assets'], assetRoutes);
app.use(['/api/bookmarks', '/bookmarks'], require('./routes/bookmarkRoutes'));
app.use(['/api/community', '/community'], require('./routes/communityRoutes'));
app.use(['/api/groups', '/groups'], require('./routes/studyGroupRoutes'));
app.use(['/api/chat', '/api/messages', '/chat', '/messages'], require('./routes/chatRoutes'));
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
        // Simple firestore read to check DB
        await firestore.collection('users').limit(1).get();
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
// app.use(express.static(path.join(__dirname, '../client/dist'))); // Handled by Next.js

// Dynamic OG Image Generator
const sharp = require('sharp');
app.get('/api/og/thread/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const threadDoc = await firestore.collection('threads').doc(id.toString()).get();

        if (!threadDoc.exists) {
            return res.status(404).send('Not proper thread');
        }

        const thread = threadDoc.data();
        const bgStyle = thread.background_style || 'c1'; // Default to c1
        const bgPath = path.join(__dirname, `../client/dist/og/${bgStyle}.png`);

        if (!fs.existsSync(bgPath)) {
            return res.redirect('https://preexam.online/favicon.png');
        }

        const title = thread.title || "PreExam Community";
        const width = 1200;
        const height = 630;

        const escapeXml = (unsafe) => {
            return unsafe.replace(/[<>&'"]/g, c => {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '\'': return '&apos;';
                    case '"': return '&quot;';
                }
            });
        };

        const safeTitle = escapeXml(title);

        const svgText = `
        <svg width="${width}" height="${height}">
            <style>
                .title { fill: white; font-size: 72px; font-family: "Loma", "Waree", "Garuda", "Noto Sans Thai", sans-serif; font-weight: bold; }
            </style>
            <text x="50%" y="40%" text-anchor="middle" dominant-baseline="middle" class="title">
                ${safeTitle.length > 50 ? safeTitle.substring(0, 47) + '...' : safeTitle}
            </text>
            <text x="50%" y="85%" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="30" font-family="sans-serif">
                PREEXAM.ONLINE
            </text>
        </svg>
        `;

        const buffer = await sharp(bgPath)
            .composite([
                { input: Buffer.from(svgText), top: 0, left: 0 }
            ])
            .toFormat('png')
            .toBuffer();

        res.set('Content-Type', 'image/png');
        res.send(buffer);

    } catch (error) {
        console.error('OG Image Generation Error:', error);
        res.status(500).send('Error generating image');
    }
});

// Handle Facebook Crawler / Open Graph for Threads
app.get('/community', async (req, res) => {
    const threadId = req.query.threadId; // e.g. /community?threadId=123

    // If no threadId, just serve index.html
    if (!threadId || isNaN(threadId)) {
        return res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    }

    try {
        const threadDoc = await firestore.collection('threads').doc(threadId.toString()).get();

        if (!threadDoc.exists) {
            return res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
        }
        
        const thread = threadDoc.data();

        // Read index.html
        const indexPath = path.join(__dirname, '../client/dist', 'index.html');
        fs.readFile(indexPath, 'utf8', async (err, htmlData) => {
            if (err) {
                console.error('Error reading index.html', err);
                return res.status(500).send('Error loading page');
            }

            // Construct OG Tags
            const title = thread.title;
            const description = thread.content ? thread.content.substring(0, 150) + '...' : 'PreExam Community Thread';
            let imageUrl = "https://preexam.online/favicon.png"; // Default fallback

            if (thread.image_url) {
                if (!thread.image_url.startsWith('http')) {
                    imageUrl = `https://preexam.online${thread.image_url}`;
                } else {
                    imageUrl = thread.image_url;
                }
            } else if (thread.background_style) {
                const style = thread.background_style || 'c1';
                imageUrl = `https://preexam.online/og/${style}.png`;
            } else if (thread.shared_news_id) {
                const newsDoc = await firestore.collection('news').doc(thread.shared_news_id.toString()).get();
                if (newsDoc.exists && newsDoc.data().image_url) {
                    imageUrl = newsDoc.data().image_url;
                }
            }

            const url = `https://preexam.online/community?threadId=${threadDoc.id}`;

            const ogTags = `
                <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
                <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
                <meta property="og:image" content="${imageUrl}" />
                <meta property="og:url" content="${url}" />
                <meta property="og:type" content="article" />
            `;

            const modifiedHtml = htmlData.replace('</head>', `${ogTags}\n</head>`);
            res.send(modifiedHtml);
        });
    } catch (error) {
        console.error('Error fetching thread for OG tags:', error);
        res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    }
});


// Next.js Integration
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: path.join(__dirname, '..') });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
    // Error Handling Middleware for API
    app.use('/api', (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    });

    // 404 Fallback for unhandled API routes
    app.use('/api', (req, res) => {
        res.status(404).json({ success: false, message: 'API Route Not Found' });
    });

    // Handle React Routing with Next.js
    app.use((req, res) => {
        return handle(req, res);
    });

    // Start Server
    const startServer = async () => {
        try {
            console.log('Firebase connected!');
            server.listen(PORT, '0.0.0.0', () => {
                console.log(`> Next.js + Express server running on port ${PORT} (0.0.0.0)`);
            });
        } catch (error) {
            console.error('Unable to start the server:', error);
        }
    };

    if (require.main === module) {
        startServer();
    }
});

module.exports = app;
