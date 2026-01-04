const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const router = express.Router();

// Student Login by Code
router.post('/login/student', async (req, res) => {
    try {
        const { code } = req.body;
        const student = await Student.findOne({ code, isActive: true });

        if (!student) {
            return res.status(404).json({ error: 'Invalid code or inactive account' });
        }

        // Generate a unique session ID
        const sessionId = crypto.randomBytes(16).toString('hex');

        // Update student's current session
        student.currentSessionId = sessionId;
        student.lastLogin = Date.now();
        await student.save();

        const token = jwt.sign(
            { id: student._id, role: 'student', grade: student.grade, sessionId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.json({ token, student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Login
router.post('/login/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.json({ token, admin });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
