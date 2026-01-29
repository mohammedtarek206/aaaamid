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

app.use(cors({
    origin: true, // Allow all origins for easier deployment setup
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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

const connectDB = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
        console.log('✅ Connected to MongoDB');

        // Initial Admin Setup
        console.log('⏳ Checking Admin account...');
        let existingAdmin = await Admin.findOne({ username: 'admin' });
        const hashedPassword = await bcrypt.hash('admin123', 10);

        if (!existingAdmin) {
            await new Admin({ username: 'admin', password: hashedPassword }).save();
            console.log('🚀 Admin account created: admin / admin123');
        } else {
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log('🔄 Admin account password RESET to: admin123');
        }

        // Start Server ONLY after successful DB connection
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
        });

    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('🔄 Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// Monitor connection status
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected!');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err);
});

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const publicRoutes = require('./routes/publicRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/public', publicRoutes);

app.get('/', (req, res) => {
    res.send('El-Amid Platform API is running...');
});

module.exports = app;
