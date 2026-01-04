const express = require('express');
const { auth } = require('../middleware/auth');
const Video = require('../models/Video');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');

const router = express.Router();

router.use(auth);

// Get videos for student's grade
router.get('/videos', async (req, res) => {
    try {
        const videos = await Video.find({ grade: req.user.grade }).sort({ createdAt: -1 });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get exams for student's grade
router.get('/exams', async (req, res) => {
    try {
        const exams = await Exam.find({ grade: req.user.grade, isActive: true });
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get specific exam with questions
router.get('/exams/:id', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam || exam.grade !== req.user.grade) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const questions = await Question.find({ examId: exam._id });
        res.json({ exam, questions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit Exam
router.post('/exams/:id/submit', async (req, res) => {
    try {
        const { answers } = req.body; // Array of { questionId, selectedAnswer }
        const questions = await Question.find({ examId: req.params.id });

        let score = 0;
        let totalPoints = 0;
        const processedAnswers = [];

        questions.forEach(q => {
            totalPoints += q.points;
            const studentAns = answers.find(a => a.questionId === q._id.toString());
            // For MCQ, we compare indexes if both are strings representing numbers, or fallback to exact match
            const isCorrect = studentAns && (studentAns.selectedAnswer === q.correctAnswer);
            if (isCorrect) score += q.points;

            processedAnswers.push({
                questionId: q._id,
                selectedAnswer: studentAns ? studentAns.selectedAnswer : null,
                isCorrect
            });
        });

        const result = new Result({
            studentId: req.user._id,
            examId: req.params.id,
            score,
            totalPoints,
            answers: processedAnswers
        });

        await result.save();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
