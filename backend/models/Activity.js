const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    action: {
        type: String,
        required: true,
        enum: ['login', 'view_video', 'start_exam', 'submit_exam', 'heartbeat']
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: false }, // VideoId or ExamId
    details: { type: mongoose.Schema.Types.Mixed }, // Any extra info
    timestamp: { type: Date, default: Date.now }
});

activitySchema.index({ studentId: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);
