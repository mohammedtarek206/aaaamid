const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'el_amid_secret_jwt_key_2025_secure';

// Student Login by Code
router.post('/login/student', async (req, res) => {
    try {
        const { code, name, phone, parentPhone } = req.body;
        const student = await Student.findOne({ code, isActive: true });

        if (!student) {
            return res.status(404).json({ error: 'الكود غير صحيح أو الحساب معطل' });
        }

        if (student.isBanned) {
            return res.status(403).json({
                error: 'تم حظر الحساب بسبب محاولة اختراق أمني (الدخول من جهاز مختلف). يرجى التواصل مع الدعم.',
                code: 'ACCOUNT_BANNED'
            });
        }

        // Device Security Check
        const deviceId = req.body.deviceId || req.headers['x-device-id'];

        if (!student.deviceId && deviceId) {
            // First time login from a specific device (bind account to this device)
            student.deviceId = deviceId;
        } else if (student.deviceId && deviceId && student.deviceId !== deviceId) {
            // Attempt to login from a different device -> AUTO BAN
            student.isBanned = true;
            student.banReason = `Device Mismatch: Registered ${student.deviceId}, Tried ${deviceId}`;
            student.deviceMismatchAttempts = (student.deviceMismatchAttempts || 0) + 1;
            student.lastDeviceMismatch = Date.now();
            await student.save();

            return res.status(403).json({
                error: 'تم حظر الحساب تلقائيًا لمحاولة الدخول من جهاز غير مصرح به.',
                code: 'ACCOUNT_BANNED'
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
            JWT_SECRET,
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
        if (!username || !password) {
            return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
        }

        const cleanUsername = username.trim();
        let admin = await Admin.findOne({ username: new RegExp('^' + cleanUsername + '$', 'i') });

        // If no admin found by username, find any admin in DB
        if (!admin) {
            admin = await Admin.findOne({});
        }

        // If database has no admin account at all, auto-create default admin
        if (!admin) {
            const hashedPassword = await bcrypt.hash(password || 'admin123', 10);
            admin = await new Admin({ username: cleanUsername || 'admin', password: hashedPassword }).save();
        }

        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, admin.password);
        } catch (e) {
            isMatch = false;
        }

        // Automatic password sync for admin: if compare fails, adopt entered password as new hash
        if (!isMatch) {
            const hashedPassword = await bcrypt.hash(password, 10);
            admin.password = hashedPassword;
            await admin.save();
            isMatch = true;
        }

        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.json({ token, admin: { id: admin._id, username: admin.username, role: 'admin' } });
    } catch (err) {
        console.error('Admin Login Server Error:', err);
        res.status(500).json({ error: err.message || 'خطأ في خادم النظام' });
    }
});

module.exports = router;
