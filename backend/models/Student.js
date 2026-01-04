const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    grade: { type: Number, required: true, enum: [1, 2, 3] }, // 1st, 2nd, 3rd Secondary
    currentSessionId: { type: String, default: null }, // To handle single device login
    isSubscribed: { type: Boolean, default: false },
    subscriptionExpiry: { type: Date, default: null },
    lastLogin: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
