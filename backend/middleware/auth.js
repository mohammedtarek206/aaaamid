const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.token;
        if (!token) throw new Error();

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role === 'admin') {
            const admin = await Admin.findById(decoded.id);
            if (!admin) throw new Error();
            req.user = admin;
            req.role = 'admin';
        } else {
            const student = await Student.findById(decoded.id);
            if (!student || !student.isActive) throw new Error();

            // Check session for single device login
            if (student.currentSessionId && student.currentSessionId !== decoded.sessionId) {
                return res.status(401).json({ error: 'Logged in from another device' });
            }

            req.user = student;
            req.role = 'student';
        }

        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.role !== 'admin') {
        return res.status(403).send({ error: 'Access denied. Admins only.' });
    }
    next();
};

const hasGradeAccess = (grade) => {
    return (req, res, next) => {
        if (req.role === 'admin') return next();
        if (req.user.grade !== parseInt(grade)) {
            return res.status(403).send({ error: 'Access denied to this grade.' });
        }
        next();
    };
};

module.exports = { auth, isAdmin, hasGradeAccess };
