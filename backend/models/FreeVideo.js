const mongoose = require('mongoose');

const freeVideoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    youtubeId: { type: String, required: true },
    description: { type: String },
    sourceType: { type: String, enum: ['youtube', 'dailymotion'], default: 'youtube' }
}, { timestamps: true });

module.exports = mongoose.model('FreeVideo', freeVideoSchema);
