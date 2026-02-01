const express = require('express');
const { auth } = require('../middleware/auth');
const Video = require('../models/Video');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Activity = require('../models/Activity');
const Student = require('../models/Student');

const router = express.Router();

router.use(auth);

// Get videos for student's grade
router.get('/videos', async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        // Admin now has strict control. Students only see what is in accessibleVideos.
        if (!student || !student.accessibleVideos || student.accessibleVideos.length === 0) {
            return res.json([]);
        }

        const videos = await Video.find({ _id: { $in: student.accessibleVideos } }).sort({ createdAt: -1 });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get exams for student's grade
router.get('/exams', async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        // Admin now has strict control. Students only see what is in accessibleExams.
        if (!student || !student.accessibleExams || student.accessibleExams.length === 0) {
            return res.json([]);
        }

        const exams = await Exam.find({ _id: { $in: student.accessibleExams }, isActive: true }).sort({ createdAt: -1 });
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

// Activity Logging
router.post('/activity/log', async (req, res) => {
    try {
        const { action, targetId, details } = req.body;
        const activity = new Activity({
            studentId: req.user.id,
            action,
            targetId,
            details
        });
        await activity.save();

        // Update lastActive on student
        await Student.findByIdAndUpdate(req.user.id, { lastActive: Date.now() });

        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
