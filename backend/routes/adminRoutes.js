const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const Student = require('../models/Student');
const Video = require('../models/Video');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const crypto = require('crypto');

const router = express.Router();

router.use(auth, isAdmin);

// Student Management
router.post('/students', async (req, res) => {
    try {
        const { name, grade } = req.body;
        // Generate a random 6-character code if not provided
        const code = crypto.randomBytes(3).toString('hex').toUpperCase();
        const student = new Student({ name, grade, code });
        await student.save();
        res.status(201).json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/students', async (req, res) => {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
});

router.put('/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/students/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.patch('/students/:id/toggle-status', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        student.isActive = !student.isActive;
        await student.save();
        res.json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Video Management
router.post('/videos', async (req, res) => {
    try {
        const video = new Video(req.body);
        await video.save();
        res.status(201).json(video);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/videos', async (req, res) => {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
});

router.put('/videos/:id', async (req, res) => {
    try {
        const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(video);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/videos/:id', async (req, res) => {
    try {
        await Video.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Exam Management
router.post('/exams', async (req, res) => {
    try {
        const exam = new Exam(req.body);
        await exam.save();
        res.status(201).json(exam);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/exams/:examId/questions', async (req, res) => {
    try {
        const question = new Question({ ...req.body, examId: req.params.examId });
        await question.save();
        res.status(201).json(question);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/exams', async (req, res) => {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json(exams);
});

router.get('/exams/:id', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        res.json(exam);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/exams/:id', async (req, res) => {
    try {
        const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(exam);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/exams/:id', async (req, res) => {
    try {
        await Exam.findByIdAndDelete(req.params.id);
        // Also delete associated questions
        await Question.deleteMany({ examId: req.params.id });
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/exams/:examId/questions', async (req, res) => {
    try {
        const questions = await Question.find({ examId: req.params.examId });
        res.json(questions);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/questions/:id', async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(question);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/questions/:id', async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/results', async (req, res) => {
    try {
        const Result = require('../models/Result');
        const results = await Result.find()
            .populate('studentId', 'name')
            .populate('examId', 'title grade')
            .sort({ completedAt: -1 });
        res.json(results);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/results/:id', async (req, res) => {
    try {
        const Result = require('../models/Result');
        await Result.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

const FreeVideo = require('../models/FreeVideo');

// Free Video Management (YouTube)
router.post('/free-videos', async (req, res) => {
    try {
        const freeVideo = new FreeVideo(req.body);
        await freeVideo.save();
        res.status(201).json(freeVideo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/free-videos', async (req, res) => {
    try {
        const freeVideos = await FreeVideo.find().sort({ createdAt: -1 });
        res.json(freeVideos);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/free-videos/:id', async (req, res) => {
    try {
        const freeVideo = await FreeVideo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(freeVideo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/free-videos/:id', async (req, res) => {
    try {
        await FreeVideo.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
