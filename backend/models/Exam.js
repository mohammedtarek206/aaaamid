const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    grade: { type: Number, required: true, enum: [1, 2, 3] },
    duration: { type: Number, required: true }, // in minutes
    attemptsAllowed: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    showResultImmediately: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
