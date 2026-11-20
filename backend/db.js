const mongoose = require('mongoose');

/**
 * Redacts credentials from MongoDB connection URI for safe logging.
 * Matches: mongodb(+srv)://username:password@host...
 */
function sanitizeMongoUri(uri) {
    if (!uri) return '(not defined)';
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/i, '$1****$3');
}

/**
 * Serverless connection caching:
 * Cache the connection on global object across Vercel Lambda invocations
 */
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const MONGOOSE_OPTIONS = {
    // Disable command buffering in serverless to prevent queries hanging for 10s on disconnect
    bufferCommands: false,
    // Fast server selection timeout for serverless
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    // Pool settings optimized for Vercel functions
    maxPoolSize: 10,
    minPoolSize: 0,
};

/**
 * Internal helper to attempt connection with retry
 */
async function attemptConnect(uri, maxRetries = 2, delayMs = 600) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await mongoose.connect(uri, MONGOOSE_OPTIONS);
        } catch (err) {
            lastError = err;
            console.error(`⚠️ [MongoDB] Connect attempt ${attempt}/${maxRetries} failed: ${err.message}`);
            if (attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
            }
        }
    }
    throw lastError;
}

/**
 * Connect to MongoDB with caching and retry logic
 */
async function connectDB() {
    // 1. If mongoose is already connected, return existing connection
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    // 2. If a connection is already in progress, await that promise
    if (cached.promise) {
        return await cached.promise;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is not defined!');
    }

    // 3. Initiate new connection attempt with retry
    const safeUri = sanitizeMongoUri(uri);
    console.log(`⏳ [MongoDB] Initiating connection to: ${safeUri}`);

    cached.promise = attemptConnect(uri, 2, 600)
        .then((m) => {
            console.log('✅ [MongoDB] Connected successfully');
            cached.conn = m;
            return m;
        })
        .catch((err) => {
            console.error('❌ [MongoDB] Connection failed after retries:', err.message);
            cached.promise = null;
            cached.conn = null;
            throw err;
        });

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (err) {
        cached.promise = null;
        cached.conn = null;
        throw err;
    }
}

// Listen to connection lifecycle events to keep cache updated
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ [MongoDB] Disconnected from cluster. Resetting connection cache.');
    if (cached) {
        cached.conn = null;
        cached.promise = null;
    }
});

mongoose.connection.on('error', (err) => {
    console.error('❌ [MongoDB] Runtime error:', err.message);
});

module.exports = {
    connectDB,
    sanitizeMongoUri,
    isConnected: () => mongoose.connection.readyState === 1
};
