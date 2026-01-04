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

const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean);
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB with optimized production settings
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        const Admin = require('./models/Admin');
        const bcrypt = require('bcryptjs');
        let existingAdmin = await Admin.findOne({ username: 'admin' });
        const hashedPassword = await bcrypt.hash('admin123', 10);
        if (!existingAdmin) {
            await new Admin({ username: 'admin', password: hashedPassword }).save();
            console.log('🚀 Admin account created: admin / admin123');
        } else {
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log('🔄 Admin account updated to password: admin123');
        }
    })
    .catch(err => {
        console.error('❌ Could not connect to MongoDB', err);
        process.exit(1);
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
