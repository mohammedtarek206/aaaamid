const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['MCQ', 'True/False'], default: 'MCQ' },
    options: [{ type: String }], // Array of strings for MCQ
    correctAnswer: { type: String, required: true }, // For MCQ, this will store the OPTION INDEX (0,1,2,3) for stability
    points: { type: Number, default: 1 }
});

module.exports = mongoose.model('Question', questionSchema);
