const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    grade: { type: Number, required: true, enum: [1, 2, 3] },
    duration: { type: Number, required: true }, // in minutes
    attemptsAllowed: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    track: { type: String, enum: ['عام', 'علمي', 'أدبي'], default: 'عام' },
    showResultImmediately: { type: Boolean, default: true },
    driveLink: { type: String, default: null },
    isGlobal: { type: Boolean, default: false } // If true, visible to all students in grade
}, { timestamps: true });

examSchema.index({ grade: 1, isActive: 1, track: 1 });

module.exports = mongoose.model('Exam', examSchema);
