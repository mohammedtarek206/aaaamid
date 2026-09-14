const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Fix Vercel Serverless URL mutation (e.g. /server.js -> original request path)
app.use((req, res, next) => {
    if (req.url.startsWith('/server.js')) {
        const matchedPath = req.headers['x-matched-path'] || req.headers['x-now-route-matches'];
        if (matchedPath) {
            req.url = matchedPath;
        } else {
            const stripped = req.url.replace('/server.js', '');
            req.url = stripped || '/';
        }
    }
    next();
});

app.use(cors({
    origin: true, // Allow all origins for easier deployment setup
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id']
}));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB with optimized production settings
const mongooseOptions = {
    // These options are now default in Mongoose 6+, but kept for clarity/compatibility
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Robust settings for VPS/Serverless
    serverSelectionTimeoutMS: 10000, // Wait up to 10s for server selection
    socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
    family: 4                       // Skip trying IPv6
};

// Mongoose settings
mongoose.set('bufferCommands', true); // Re-enable buffering but we will handle it better

const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

let dbConnectionPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;

    if (!dbConnectionPromise) {
        dbConnectionPromise = (async () => {
            try {
                console.log('⏳ Connecting to MongoDB...');
                await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
                console.log('✅ Connected to MongoDB');

                // Initial Admin Setup & Sync
                try {
                    let existingAdmin = await Admin.findOne({ username: 'admin' });
                    const hashedPassword = await bcrypt.hash('admin123', 10);
                    if (!existingAdmin) {
                        await new Admin({ username: 'admin', password: hashedPassword }).save();
                        console.log('🚀 Admin account created: admin / admin123');
                    } else {
                        existingAdmin.password = hashedPassword;
                        await existingAdmin.save();
                        console.log('✅ Admin account password synced: admin / admin123');
                    }
                } catch (adminErr) {
                    console.error('⚠️ Admin check error:', adminErr.message);
                }
            } catch (err) {
                console.error('❌ MongoDB Connection Error:', err.message);
                dbConnectionPromise = null;
                throw err;
            }
        })();
    }
    return dbConnectionPromise;
};

// Initial connection attempt
connectDB().catch(err => console.error('Initial DB connect attempt failed:', err.message));

// Middleware to ensure DB connection for serverless function invocations
app.use(async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
        next();
    } catch (err) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Start local HTTP server if running outside Vercel
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    });
}

// Monitor connection status
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected!');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err);
});

// Routes - Multi-mounting (/api/auth, /auth, /api, /) to prevent Vercel rewrite 404s
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const publicRoutes = require('./routes/publicRoutes');

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/', authRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/student', studentRoutes);
app.use('/student', studentRoutes);

app.use('/api/public', publicRoutes);
app.use('/public', publicRoutes);

// Health Check Endpoint for Monitoring
app.get(['/api/health', '/health'], (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

app.get(['/', '/server.js'], (req, res) => {
    res.send('El-Amid Platform API is running smoothly...');
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error('🔥 GLOBAL ERROR:', err.stack);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : err.message
    });
});

// Handle Uncaught Exceptions to prevent server from dying silently
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('💥 UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

module.exports = app;
