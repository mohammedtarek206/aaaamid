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
        const { code, name, phone, parentPhone } = req.body;
        const student = await Student.findOne({ code, isActive: true });

        if (!student) {
            return res.status(404).json({ error: 'الكود غير صحيح أو الحساب معطل' });
        }

        // Device Security Check
        const deviceId = req.body.deviceId || req.headers['x-device-id'];

        if (!student.deviceId && deviceId) {
            // First time login from a specific device (bind account to this device)
            student.deviceId = deviceId;
        } else if (student.deviceId && student.deviceId !== deviceId) {
            // Attempt to login from a different device
            return res.status(403).json({
                error: 'هذا الحساب مقيد بجهاز آخر. لا يمكن استخدام الحساب على أكثر من جهاز.',
                code: 'DEVICE_MISMATCH'
            });
        }

        // Handle Activation Flow
        if (!student.isActivated) {
            if (name && phone && parentPhone) {
                student.name = name;
                student.phone = phone;
                student.parentPhone = parentPhone;
                student.isActivated = true;
                // We'll save later after session update
            } else {
                return res.status(403).json({
                    error: 'يرجى إكمال البيانات أولاً',
                    needsRegistration: true
                });
            }
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
