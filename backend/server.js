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

// 2. Allowed origins list (explicitly allowing production frontend domains)
const defaultAllowedOrigins = [
    'https://www.mrahmed-shendy.com',
    'https://mrahmed-shendy.com',
    'https://el-amid-platform.vercel.app',
    'https://el-amid.vercel.app',
    'https://elamid.vercel.app',
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

const isOriginAllowed = (origin) => {
    // Allow non-browser requests (e.g. server-to-server, curl, Postman, mobile apps)
    if (!origin) return true;

    const normalized = origin.trim().replace(/\/+$/, '');
    if (allowedOriginsSet.has(normalized)) return true;

    // Safely allow all Vercel preview and deployment URLs (*.vercel.app)
    if (/^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(normalized)) {
        return true;
    }

    return false;
};

// 3. FIRST-PRIORITY CORS & PREFLIGHT OPTIONS HANDLER
// Registered BEFORE body parsing, database middleware, auth, and routes
app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (isOriginAllowed(origin)) {
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
    } else if (origin) {
        console.warn(`⚠️ [CORS Blocked] Unauthorized origin: ${origin} on ${req.method} ${req.url}`);
        if (req.method === 'OPTIONS') {
            return res.status(403).end();
        }
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-device-id, Accept, Origin, X-Requested-With');
    res.setHeader('Access-Control-Expose-Headers', 'set-cookie');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Return HTTP 204 immediately for preflight OPTIONS requests without touching DB
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    next();
});

// Also register standard cors middleware for full Express compatibility
const corsOptions = {
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-device-id',
        'Accept',
        'Origin',
        'X-Requested-With'
    ],
    exposedHeaders: ['set-cookie'],
    optionsSuccessStatus: 204,
    maxAge: 86400
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 4. Body and cookie parsing middlewares
app.use(express.json());
app.use(cookieParser());

// 5. Database connection middleware for actual API requests
app.use(async (req, res, next) => {
    // OPTIONS preflight requests and health checks do NOT touch the database
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

// 6. Mount API Routes (supporting both /api/* and /* prefixes to prevent rewrite/proxy mismatches)
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const publicRoutes = require('./routes/publicRoutes');

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/student', '/student'], studentRoutes);
app.use(['/api/public', '/public'], publicRoutes);

// 7. Monitoring & Health Check
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

// 8. 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl || req.url });
});

// 9. Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error('🔥 GLOBAL ERROR:', err.stack || err.message);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : (err.message || 'Unknown Server Error')
    });
});

// 10. Process Safety: Never exit process in serverless environments
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

// 11. Start local HTTP server outside Vercel
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL && require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    });
}

module.exports = app;
