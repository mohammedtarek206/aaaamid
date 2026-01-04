const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    grade: { type: Number, required: true, enum: [1, 2, 3] },
    unit: { type: String, required: true },
    lesson: { type: String, required: true },
    dailymotionId: { type: String, required: true },
    views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
