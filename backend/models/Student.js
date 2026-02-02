const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: false }, // Optional until activated
    code: { type: String, required: true, unique: true },
    grade: { type: Number, required: true, enum: [1, 2, 3] }, // 1st, 2nd, 3rd Secondary
    track: { type: String, enum: ['عام', 'علمي', 'أدبي'], default: 'عام' },
    phone: { type: String },
    parentPhone: { type: String },
    isActivated: { type: Boolean, default: false },
    currentSessionId: { type: String, default: null }, // To handle single device login
    deviceId: { type: String, default: null }, // Unique device identifier
    isBanned: { type: Boolean, default: false }, // Auto-ban on security violation
    banReason: { type: String, default: null },
    deviceMismatchAttempts: { type: Number, default: 0 },
    lastDeviceMismatch: { type: Date, default: null },
    isSubscribed: { type: Boolean, default: false },
    subscriptionExpiry: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
    lastActive: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    accessibleVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    accessibleExams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
