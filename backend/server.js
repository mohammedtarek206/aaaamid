const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// Load environment variables from backend/.env and current working directory
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const { connectDB } = require('./db');

const app = express();

// 1. Normalize Vercel Serverless internal rewritten paths
app.use((req, res, next) => {
    if (req.url.startsWith('/api/index.js') || req.url.startsWith('/server.js')) {
        const matchedPath = req.headers['x-matched-path'] || req.headers['x-now-route-matches'];
        if (matchedPath) {
            req.url = matchedPath;
        }
    }
    next();
});

// 2. Comprehensive, safe CORS configuration
const defaultAllowedOrigins = [
    'https://mrahmed-shendy.com',
    'https://www.mrahmed-shendy.com',
    'https://el-amid-platform.vercel.app',
    'https://el-amid.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
];

// Add origins from environment variables if present
const envOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
]
    .filter(Boolean)
    .map(o => o.trim().replace(/\/+$/, ''));

const allowedOriginsSet = new Set([...defaultAllowedOrigins, ...envOrigins]);

const isAllowedOrigin = (origin) => {
    // Allow non-browser requests (e.g. server-to-server, curl, Postman, mobile apps)
    if (!origin) return true;

    const normalized = origin.trim().replace(/\/+$/, '');
    if (allowedOriginsSet.has(normalized)) return true;

    // Safely allow all Vercel preview and production deployments (*.vercel.app)
    if (/^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(normalized)) {
        return true;
    }

    return false;
};

const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }
        console.warn(`⚠️ [CORS Blocked] Unauthorized origin: ${origin}`);
        // Return null, false to reject CORS cleanly without throwing a 500 error
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-device-id',
        'Accept',
        'Origin',
        'X-Requested-With'
    ],
    exposedHeaders: ['set-cookie'],
    optionsSuccessStatus: 200,
    maxAge: 86400 // Cache preflight for 24 hours
};

// Mount CORS and explicitly handle preflight requests
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 3. Body and cookie parsing middlewares
app.use(express.json());
app.use(cookieParser());

// 4. Database connection middleware for requests
app.use(async (req, res, next) => {
    // OPTIONS preflight requests and health checks do not require database access
    if (req.method === 'OPTIONS' || req.path === '/api/health' || req.path === '/health') {
        return next();
    }

    try {
        await connectDB();
        next();
    } catch (err) {
        console.error(`🔥 Database unavailable for ${req.method} ${req.originalUrl || req.url}:`, err.message);
        return res.status(503).json({
            error: 'Database connection failed',
            message: 'Unable to connect to database cluster. Please try again in a few moments.'
        });
    }
});

// Non-blocking initial connection attempt for local/standalone servers
if (!process.env.VERCEL) {
    connectDB().catch((err) => {
        console.error('Initial DB connect attempt failed:', err.message);
    });
}

// 5. Mount API Routes (supporting both /api/* and /* prefixes to prevent rewrite/proxy mismatches)
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const publicRoutes = require('./routes/publicRoutes');

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/student', '/student'], studentRoutes);
app.use(['/api/public', '/public'], publicRoutes);

// 6. Monitoring & Health Check
app.get(['/api/health', '/health'], (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

app.get(['/', '/server.js'], (req, res) => {
    res.send('El-Amid Platform API is running smoothly...');
});

// 7. 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl || req.url });
});

// 8. Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error('🔥 GLOBAL ERROR:', err.stack || err.message);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : (err.message || 'Unknown Server Error')
    });
});

// 9. Process Safety: Never exit process in serverless environments
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION:', err.name, err.message);
    if (!process.env.VERCEL) {
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason) => {
    console.error('💥 UNHANDLED REJECTION:', reason);
    if (!process.env.VERCEL) {
        process.exit(1);
    }
});

// 10. Start local HTTP server outside Vercel
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL && require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    });
}

module.exports = app;
